const APP_VERSION = '1.2.0';

const tabContents = {};
const tabs = {
  counter: 0,
  items: []
};


document.addEventListener('DOMContentLoaded', function() {
  try {
    // Check if necessary scripts are loaded
    if (typeof CodeEditor === 'undefined' || typeof AIAssistant === 'undefined' || typeof ConsoleOutput === 'undefined') {
      console.error("Required classes not loaded. Attempting to use fallbacks.");
      createFallbacks();
    }

    // Initialize the editor
    window.editor = new CodeEditor('code-editor');

    // Initialize the AI assistant
    window.aiAssistant = new AIAssistant();

    // Initialize the console
    window.consoleOutput = new ConsoleOutput('console-output');

    // Set up event listeners
    setupEventListeners();

    // Initialize the theme switcher
    initTheme();

    // Initialize tab management
    initializeDefaultTabs();

    // Add tab close button styles
    addTabCloseButtonStyles();

    // Initialize preview functionality
    initPreviewFunctionality();

    console.log("CodeAI Assistant initialized successfully");
    window.consoleOutput.info("CodeAI Assistant initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});

// Create fallback implementations for critical components
function createFallbacks() {
  // Fallback for CodeEditor
  if (typeof CodeEditor === 'undefined') {
    console.warn('Using fallback for CodeEditor');
    window.CodeEditor = class CodeEditor {
      constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.content = '';
        this.language = 'javascript';

        if (this.element) {
          this.element.innerHTML = '<textarea style="width:100%;height:400px"></textarea>';
          this.textarea = this.element.querySelector('textarea');

          this.textarea.addEventListener('input', () => {
            this.content = this.textarea.value;
          });
        }
      }

      getContent() { return this.content; }
      setContent(content) {
        this.content = content;
        if (this.textarea) this.textarea.value = content;
      }
      setLanguage(lang) { this.language = lang; }
      focus() { if (this.textarea) this.textarea.focus(); }
    };
  }

  // Fallback for AIAssistant
  if (typeof AIAssistant === 'undefined') {
    console.warn('Using fallback for AIAssistant');
    window.AIAssistant = class AIAssistant {
      constructor() {
        this.conversationHistory = [];
        this.isProcessing = false;

        this.aiPanel = document.querySelector('.ai-conversation');
        this.aiInput = document.getElementById('ai-input');
        this.aiSubmit = document.getElementById('ai-submit');

        if (this.aiSubmit && this.aiInput) {
          this.aiSubmit.addEventListener('click', () => {
            if (!this.isProcessing && this.aiInput.value.trim()) {
              this.addMessageToConversation('user', this.aiInput.value);
              this.aiInput.value = '';
              this.processQuery("Please configure Groq API to get AI-powered responses.");
            }
          });
        }
      }

      addMessageToConversation(role, content) {
        if (this.aiPanel) {
          const messageEl = document.createElement('div');
          messageEl.className = 'ai-message';

          const avatarEl = document.createElement('div');
          avatarEl.className = 'ai-avatar';
          avatarEl.textContent = role === 'user' ? 'You' : 'AI';

          const contentEl = document.createElement('div');
          contentEl.className = 'ai-content';
          contentEl.innerHTML = content.replace(/\n/g, '<br>');

          messageEl.appendChild(avatarEl);
          messageEl.appendChild(contentEl);
          this.aiPanel.appendChild(messageEl);
          this.aiPanel.scrollTop = this.aiPanel.scrollHeight;
        }
      }

      processQuery(query) {
        this.isProcessing = true;
        setTimeout(() => {
          this.addMessageToConversation('assistant', "To use AI-powered responses, please configure the Groq API in settings.");
          this.isProcessing = false;
        }, 500);
      }

      toggleSuggestions() {}
      setModel() {}
    };
  }

  // Fallback for ConsoleOutput
  if (typeof ConsoleOutput === 'undefined') {
    console.warn('Using fallback for ConsoleOutput');
    window.ConsoleOutput = class ConsoleOutput {
      constructor(elementId) {
        this.element = document.getElementById(elementId);

        if (!this.element) {
          console.error('Console output element not found:', elementId);
          return;
        }
      }

      log(...args) { this._addEntry(args.join(' '), 'log'); }
      error(...args) { this._addEntry(args.join(' '), 'error'); }
      warn(...args) { this._addEntry(args.join(' '), 'warn'); }
      info(...args) { this._addEntry(args.join(' '), 'info'); }

      _addEntry(text, type) {
        if (!this.element) return;

        const entry = document.createElement('div');
        entry.className = `console-entry console-${type}`;

        // Add timestamp
        const now = new Date();
        const timestamp = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`;

        entry.textContent = `${timestamp} ${text}`;
        this.element.appendChild(entry);
        this.element.scrollTop = this.element.scrollHeight;
      }

      clear() {
        if (!this.element) return;
        this.element.innerHTML = '';
        this._addEntry('Console cleared', 'info');
      }
    };
  }
}

// Set up application event listeners
function setupEventListeners() {
  // Add Tab button event listener
  const addTabButton = document.querySelector('.add-tab');
  if (addTabButton) {
    addTabButton.addEventListener('click', createNewTab);
  }

  // Run button
  const runButton = document.getElementById('run-button');
  if (runButton) {
    runButton.addEventListener('click', runCode);
  }

  // Save button
  const saveButton = document.getElementById('save-button');
  if (saveButton) {
    saveButton.addEventListener('click', saveCode);
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Settings button
  const settingsButton = document.getElementById('settings-button');
  const settingsModal = document.getElementById('settings-modal');
  const closeModal = document.querySelector('.close-modal');

  if (settingsButton && settingsModal && closeModal) {
    settingsButton.addEventListener('click', function() {
      settingsModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', function() {
      settingsModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });
  }

  // Settings controls
  setupSettingsControls();

  // Clear console button
  const clearConsoleButton = document.getElementById('clear-console');
  if (clearConsoleButton && window.consoleOutput) {
    clearConsoleButton.addEventListener('click', function() {
      window.consoleOutput.clear();
    });
  }

  // Panel resizing
  const panelDivider = document.querySelector('.panel-divider');
  if (panelDivider) {
    panelDivider.addEventListener('mousedown', initPanelResize);
  }

  // AI input field
  const aiInput = document.getElementById('ai-input');
  const aiSubmit = document.getElementById('ai-submit');

  if (aiInput && aiSubmit && window.aiAssistant) {
    // Enter key in AI input
    aiInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        aiSubmit.click();
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+Enter or Cmd+Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }

    // Ctrl+S or Cmd+S to save code
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCode();
    }

    // Ctrl+P or Cmd+P to preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      openPreview();
    }
  });
}

// Setup settings controls
function setupSettingsControls() {
  // Font size control
  const fontSizeRange = document.getElementById('font-size');
  const fontSizeValue = document.querySelector('#font-size + .setting-value');

  if (fontSizeRange && fontSizeValue) {
    // Set initial value
    const savedFontSize = localStorage.getItem('editor-font-size') || '14';
    fontSizeRange.value = savedFontSize;
    fontSizeValue.textContent = `${savedFontSize}px`;
    document.documentElement.style.setProperty('--editor-font-size', `${savedFontSize}px`);

    fontSizeRange.addEventListener('input', function() {
      const size = this.value;
      fontSizeValue.textContent = `${size}px`;
      document.documentElement.style.setProperty('--editor-font-size', `${size}px`);
      localStorage.setItem('editor-font-size', size);

      // Refresh editor if available
      if (window.editor && window.editor.editor && typeof window.editor.editor.refresh === 'function') {
        window.editor.editor.refresh();
      }
    });
  }

  // Tab size control
  const tabSizeSelect = document.getElementById('tab-size');
  if (tabSizeSelect && window.editor) {
    // Set initial value
    const savedTabSize = localStorage.getItem('editor-tab-size') || '4';
    tabSizeSelect.value = savedTabSize;

    if (window.editor.setTabSize) {
      window.editor.setTabSize(parseInt(savedTabSize));
    } else if (window.editor.tabSize !== undefined) {
      window.editor.tabSize = parseInt(savedTabSize);
    }

    tabSizeSelect.addEventListener('change', function() {
      const tabSize = parseInt(this.value);
      localStorage.setItem('editor-tab-size', tabSize);

      if (window.editor.setTabSize) {
        window.editor.setTabSize(tabSize);
      } else if (window.editor.tabSize !== undefined) {
        window.editor.tabSize = tabSize;
      }
    });
  }

  // AI settings
  const aiSuggestionsToggle = document.getElementById('ai-suggestions');
  if (aiSuggestionsToggle && window.aiAssistant && typeof window.aiAssistant.toggleSuggestions === 'function') {
    // Set initial value
    const savedSuggestions = localStorage.getItem('ai-suggestions') !== 'false';
    aiSuggestionsToggle.checked = savedSuggestions;
    window.aiAssistant.toggleSuggestions(savedSuggestions);

    aiSuggestionsToggle.addEventListener('change', function() {
      localStorage.setItem('ai-suggestions', this.checked);
      window.aiAssistant.toggleSuggestions(this.checked);
    });
  }

  const aiModelSelect = document.getElementById('ai-model');
  if (aiModelSelect && window.aiAssistant && typeof window.aiAssistant.setModel === 'function') {
    // Set initial value
    const savedModel = localStorage.getItem('ai-model') || 'advanced';
    aiModelSelect.value = savedModel;
    window.aiAssistant.setModel(savedModel);

    aiModelSelect.addEventListener('change', function() {
      localStorage.setItem('ai-model', this.value);
      window.aiAssistant.setModel(this.value);
    });
  }

  // Groq API settings
  setupGroqAPIControls();
}

// Setup Groq API controls
function setupGroqAPIControls() {
  const apiKeyInput = document.getElementById('groq-api-key');
  const saveApiKeyButton = document.getElementById('save-api-key');

  if (!apiKeyInput || !saveApiKeyButton) {
    console.warn('Groq API controls not found in the DOM');
    return;
  }

  if (!window.groqClient) {
    console.error('groqClient not available. API controls will not function.');
    return;
  }

  // Replace with new element to remove old handlers
  const newSaveButton = saveApiKeyButton.cloneNode(true);
  saveApiKeyButton.parentNode.replaceChild(newSaveButton, saveApiKeyButton);

  // Add event handler
  newSaveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    console.log('Save API key clicked, length:', apiKey.length);

    if (!apiKey) {
      showNotification('Please enter a valid API key.', 'error');
      return;
    }

    try {
      const success = window.groqClient.configure(apiKey);
      if (success) {
        showNotification('API key saved successfully!', 'success');
        apiKeyInput.value = '••••••••••••••••••••••';
        document.body.classList.add('groq-enabled');
      } else {
        showNotification('Failed to save API key.', 'error');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      showNotification('Error: ' + error.message, 'error');
    }
  });

  // Groq model selector
  const groqModelSelect = document.getElementById('groq-model');
  if (groqModelSelect && window.groqClient && typeof window.groqClient.setModel === 'function') {
    // Set initial value
    const savedGroqModel = localStorage.getItem('groqModel') || 'llama3-70b-8192';
    groqModelSelect.value = savedGroqModel;
    window.groqClient.setModel(savedGroqModel);

    groqModelSelect.addEventListener('change', function() {
      window.groqClient.setModel(this.value);
    });
  }

  // Load saved configuration
  setTimeout(() => {
    if (window.groqClient && typeof window.groqClient.loadSavedConfiguration === 'function') {
      const configured = window.groqClient.loadSavedConfiguration();
      if (configured) {
        document.body.classList.add('groq-enabled');
        showNotification('Groq API configured and ready!', 'success');

        // Update UI
        if (apiKeyInput) {
          apiKeyInput.value = '••••••••••••••••••••••';
        }

        // Set saved model
        if (groqModelSelect) {
          const savedModel = localStorage.getItem('groqModel');
          if (savedModel) {
            groqModelSelect.value = savedModel;
          }
        }
      }
    }
  }, 1000);
}

// Function to run the code
function runCode() {
  console.log("Run code called");
  if (!window.editor || !window.consoleOutput) {
    console.error("Editor or console not initialized");
    return;
  }

  const code = window.editor.getContent();
  const activeTab = document.querySelector('.tab.active');
  if (!activeTab) {
    console.error("No active tab found");
    return;
  }

  const language = activeTab.getAttribute('data-lang');

  // Save the content to the current tab
  saveCurrentTabContent();

  console.log(`Running ${language} code, length: ${code.length} characters`);

  // Clear previous console output
  window.consoleOutput.clear();

  // Handle different languages
  if (language === 'javascript' || language === 'js') {
    executeJavaScript(code);
  } else if (language === 'html') {
    window.consoleOutput.info(`HTML code detected. Opening preview instead...`);
    openPreview(); // Open the preview instead of trying to run HTML
  } else if (language === 'css') {
    window.consoleOutput.info(`CSS code detected. Opening preview instead...`);
    openPreview(); // Open the preview instead of trying to run CSS
  } else {
    window.consoleOutput.info(`Running ${language} code in the console is not supported.`);
  }
}

// Execute JavaScript code
function executeJavaScript(code) {
  try {
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = function(...args) {
      originalLog.apply(console, args);
      window.consoleOutput.log(...args);
    };

    console.error = function(...args) {
      originalError.apply(console, args);
      window.consoleOutput.error(...args);
    };

    console.warn = function(...args) {
      originalWarn.apply(console, args);
      window.consoleOutput.warn(...args);
    };

    console.info = function(...args) {
      originalInfo.apply(console, args);
      window.consoleOutput.info(...args);
    };

    // Execute the code
    window.consoleOutput.info("Executing JavaScript code...");
    const result = eval(`(function() { ${code} })()`);

    // Restore original console methods
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;

    // Log the result if it's not undefined
    if (result !== undefined) {
      window.consoleOutput.log('Result:', result);
    }
  } catch (error) {
    window.consoleOutput.error('Error:', error.message);
    console.error("JavaScript execution error:", error);
  }
}

// Initialize preview functionality
function initPreviewFunctionality() {
  console.log("Initializing preview functionality");

  // Add the preview button if it doesn't exist
  const previewBtn = document.getElementById('preview-btn');
  if (!previewBtn) {
    const navbar = document.querySelector('nav');
    if (navbar) {
      const customPreviewBtn = document.createElement('button');
      customPreviewBtn.id = 'preview-btn';
      customPreviewBtn.className = 'btn btn-primary';
      customPreviewBtn.innerHTML = 'Preview';
      customPreviewBtn.onclick = openPreview;
      navbar.appendChild(customPreviewBtn);
      console.log("Preview button added");
    }
  }

  // Create or get the preview container
  setupPreviewContainer();

  // Make preview function globally available
  window.openPreview = openPreview;
}

// Setup or get the preview container (iframe)
function setupPreviewContainer() {
  // Check if we already have a preview container
  let previewContainer = document.getElementById('preview-container');

  if (!previewContainer) {
    // Create preview container
    previewContainer = document.createElement('div');
    previewContainer.id = 'preview-container';
    previewContainer.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 40%;
      height: 100%;
      background: white;
      border-left: 1px solid #ccc;
      z-index: 9999;
      display: none;
      flex-direction: column;
    `;

    // Create header for the preview
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #f0f0f0;
      border-bottom: 1px solid #ccc;
    `;

    // Add title to header
    const title = document.createElement('h3');
    title.textContent = 'Preview';
    title.style.margin = '0';
    header.appendChild(title);

    // Add close button to header
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    `;
    closeBtn.onclick = function() {
      previewContainer.style.display = 'none';
    };
    header.appendChild(closeBtn);

    // Create iframe for the preview content
    const iframe = document.createElement('iframe');
    iframe.id = 'preview-iframe';
    iframe.style.cssText = `
      flex: 1;
      width: 100%;
      border: none;
    `;

    // Add elements to the preview container
    previewContainer.appendChild(header);
    previewContainer.appendChild(iframe);

    // Add to document body
    document.body.appendChild(previewContainer);

    console.log("Preview container created");
  }

  return previewContainer;
}

// Main preview function - called when clicking the preview button
function openPreview() {
  console.log("Preview button clicked");

  // Check if editor is initialized
  if (!window.editor || typeof window.editor.getContent !== 'function') {
    showNotification('Editor not initialized', 'error');
    return;
  }

  // Get current content from all tabs
  const htmlContent = getTabContentByLanguage('html');
  const cssContent = getTabContentByLanguage('css');
  const jsContent = getTabContentByLanguage('javascript');

  // Create a combined HTML document with all three components
  const combinedContent = createCombinedPreview(htmlContent, cssContent, jsContent);

  // Create a completely new preview container each time to avoid issues
  const existingContainer = document.getElementById('preview-container');
  if (existingContainer) {
    document.body.removeChild(existingContainer);
  }

  // Create a new preview container
  const previewContainer = document.createElement('div');
  previewContainer.id = 'preview-container';
  previewContainer.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
    background: white;
    border-left: 1px solid #ccc;
    z-index: 9999;
    display: flex;
    flex-direction: column;
  `;

  // Create header for the preview
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #f0f0f0;
    border-bottom: 1px solid #ccc;
  `;

  // Add title to header
  const title = document.createElement('h3');
  title.textContent = 'Combined Preview';
  title.style.margin = '0';
  header.appendChild(title);

  // Add close button to header
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  `;
  closeBtn.onclick = function() {
    if (previewContainer.parentNode) {
      document.body.removeChild(previewContainer);
    }
  };
  header.appendChild(closeBtn);

  // Create iframe for the preview content
  const iframe = document.createElement('iframe');
  iframe.id = 'preview-iframe';
  iframe.style.cssText = `
    flex: 1;
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;

  // Add elements to the preview container
  previewContainer.appendChild(header);
  previewContainer.appendChild(iframe);

  // Add to document body
  document.body.appendChild(previewContainer);

  // Show notification
  showNotification('Combined preview opened', 'info');

  // Display the combined content
  displayCombinedPreview(combinedContent, iframe);
}

// Get content from a tab based on language
function getTabContentByLanguage(language) {
  // Save current tab content first to ensure it's up to date
  saveCurrentTabContent();

  // First, check all tabs to find the one with the requested language
  const allTabs = document.querySelectorAll('.tab');
  let content = '';

  for (const tab of allTabs) {
    if (tab.getAttribute('data-lang') === language) {
      const tabId = tab.getAttribute('data-tab-id');
      if (tabId && tabContents[tabId]) {
        content = tabContents[tabId];
        break;
      }
    }
  }

  return content;
}

// Create a combined preview HTML document from separate HTML, CSS, and JS contents
function createCombinedPreview(htmlContent, cssContent, jsContent) {
  // If no HTML content, create a minimal structure
  if (!htmlContent || htmlContent.trim() === '') {
    htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
  <meta charset="UTF-8">
</head>
<body>
  <div id="app">
    <h1>Preview</h1>
    <p>This is a placeholder. Add HTML content to see your actual page.</p>
  </div>
</body>
</html>`;
  }

  // Parse the HTML content to insert CSS and JS
  let combinedContent = htmlContent;

  // Add CSS if available
  if (cssContent && cssContent.trim() !== '') {
    // Check if there's a </head> tag to insert before
    if (combinedContent.includes('</head>')) {
      combinedContent = combinedContent.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
    } else if (combinedContent.includes('<body')) {
      // If no </head>, insert before <body>
      const bodyPos = combinedContent.indexOf('<body');
      combinedContent = combinedContent.substring(0, bodyPos) +
                        `<style>\n${cssContent}\n</style>\n` +
                        combinedContent.substring(bodyPos);
    } else {
      // Last resort: just prepend to the whole document
      combinedContent = `<style>\n${cssContent}\n</style>\n${combinedContent}`;
    }
  }

  // Add JavaScript if available
  if (jsContent && jsContent.trim() !== '') {
    // Check if there's a </body> tag to insert before
    if (combinedContent.includes('</body>')) {
      combinedContent = combinedContent.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
    } else {
      // If no </body>, append to the end
      combinedContent += `\n<script>\n${jsContent}\n</script>`;
    }
  }

  return combinedContent;
}

// Display the combined preview in the iframe
function displayCombinedPreview(content, iframe) {
  try {
    setTimeout(() => {
      // Wait for the iframe to be properly added to the DOM
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(content);
      doc.close();

      console.log("Combined preview displayed");
      window.consoleOutput.info("Combined preview loaded successfully");
    }, 100);
  } catch (error) {
    console.error("Error displaying combined preview:", error);
    window.consoleOutput.error("Error displaying preview: " + error.message);

    // Attempt alternative approach using data URLs
    try {
      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(content);
      iframe.src = dataUrl;
      console.log("Using alternative preview method");
    } catch (fallbackError) {
      console.error("Fallback preview failed:", fallbackError);
    }
  }
}

// Preview CSS code
function previewCSS(code, iframe) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>CSS Preview</title>
  <style>${code}</style>
</head>
<body>
  <h1>CSS Preview</h1>
  
  <h2>Basic Elements</h2>
  <p>This is a paragraph with <a href="#">a link</a> and some <strong>bold text</strong>.</p>
  <button>Button</button>
  <form>
    <input type="text" placeholder="Input field">
    <input type="checkbox" id="checkbox"><label for="checkbox">Checkbox</label>
  </form>
  
  <h2>Common Classes</h2>
  <div class="container">This is a div with class "container"</div>
  <div class="todo-item">This is a div with class "todo-item"</div>
  <div class="add-button">This is a div with class "add-button"</div>
  <div class="todo-input">This is a div with class "todo-input"</div>
  <div class="filters">This is a div with class "filters"</div>
  <div class="todo-footer">This is a div with class "todo-footer"</div>
  
  <h2>Layout Test</h2>
  <div style="display: flex; gap: 20px; margin-top: 20px;">
    <div style="width: 200px; padding: 20px; border: 1px solid #ccc;">
      <h3>Sidebar</h3>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>
    <div style="flex: 1; padding: 20px; border: 1px solid #ccc;">
      <h3>Content</h3>
      <p>This area shows how your CSS affects layout containers.</p>
    </div>
  </div>
</body>
</html>`;

  // Write the content to the iframe
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  console.log("CSS preview displayed");
}

// Function to save code
function saveCode() {
  if (!window.editor) {
    console.error("Editor not initialized");
    return;
  }

  const code = window.editor.getContent();
  const activeTab = document.querySelector('.tab.active');

  if (!activeTab) {
    showNotification('No active tab to save', 'error');
    return;
  }

  const tabId = activeTab.getAttribute('data-tab-id');
  const language = activeTab.getAttribute('data-lang');

  // Get filename from the tab
  let filename;
  const tabInfo = tabs.items.find(tab => tab.id === tabId);
  if (tabInfo) {
    filename = tabInfo.filename;
  } else {
    filename = getFilenameForLanguage(language);
  }

  // Save to our storage
  if (tabId) {
    tabContents[tabId] = code;
  }

  // Create a blob with the code
  const blob = new Blob([code], { type: 'text/plain' });

  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;

  // Add to document, click, and remove
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Show notification
  showNotification('Code saved as ' + filename, 'success');
}

// Function to toggle theme
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector('.theme-icon');
  const isDarkTheme = body.classList.contains('dark-theme');

  if (isDarkTheme) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  }

  // Update CodeMirror theme if available
  if (window.editor && window.editor.editor && typeof window.editor.editor.setOption === 'function') {
    window.editor.editor.setOption('theme', isDarkTheme ? 'default' : 'dracula');
  }

  // Dispatch theme change event for other components
  window.dispatchEvent(new CustomEvent('themeChange', {
    detail: { theme: isDarkTheme ? 'light' : 'dark' }
  }));
}

// Function to initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;
  const themeIcon = document.querySelector('.theme-icon');

  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
  }
}

// Function to get filename based on language
function getFilenameForLanguage(language) {
  const extensions = {
    javascript: 'js',
    html: 'html',
    css: 'css',
    python: 'py',
    php: 'php',
    ruby: 'rb',
    markdown: 'md',
    json: 'json'
  };

  const ext = extensions[language.toLowerCase()] || 'txt';
  const timestamp = new Date().toISOString().slice(0, 10);
  return `slippy_${timestamp}.${ext}`;
}

// Function to create a new tab
function createNewTab() {
  // Prompt for language
  const language = prompt('Select language (javascript, html, css):');

  if (!language || !['javascript', 'html', 'css'].includes(language.toLowerCase())) {
    showNotification('Unsupported language. Please choose javascript, html, or css.', 'error');
    return;
  }

  // Generate a unique ID for this tab
  const tabId = 'tab_' + (++tabs.counter);

  // Create filename
  const extensions = {
    javascript: 'js',
    html: 'html',
    css: 'css'
  };
  const extension = extensions[language.toLowerCase()];

  // If it's the first additional file of this type, add a number
  let filename = `file${tabs.items.filter(t => t.language === language.toLowerCase()).length + 1}.${extension}`;

  // Create tab object
  const tabInfo = {
    id: tabId,
    language: language.toLowerCase(),
    filename: filename
  };

  // Add to our tabs array
  tabs.items.push(tabInfo);

  // Initialize empty content for this tab
  tabContents[tabId] = '';

  // Create a new tab element
  const tabsContainer = document.querySelector('.tabs');
  const newTab = document.createElement('button');
  newTab.className = 'tab';
  newTab.setAttribute('data-lang', language.toLowerCase());
  newTab.setAttribute('data-tab-id', tabId);

  // Create tab content with close button
  const tabText = document.createElement('span');
  tabText.textContent = filename;

  const closeBtn = document.createElement('span');
  closeBtn.className = 'tab-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent triggering the tab click
    closeTab(tabId);
  });

  newTab.appendChild(tabText);
  newTab.appendChild(closeBtn);

  // Insert before the add tab button
  const addTab = document.querySelector('.add-tab');
  if (tabsContainer && addTab) {
    tabsContainer.insertBefore(newTab, addTab);
  } else {
    console.error('Unable to add new tab: tab container or add button not found');
    return;
  }

  // Save current content before switching
  saveCurrentTabContent();

  // Add event listener for clicking the tab
  newTab.addEventListener('click', function() {
    switchToTab(tabId);
  });

  // Activate the new tab
  switchToTab(tabId);
}

// Function to save the content of the current tab
function saveCurrentTabContent() {
  const activeTab = document.querySelector('.tab.active');
  if (activeTab && window.editor) {
    const tabId = activeTab.getAttribute('data-tab-id');
    if (tabId) {
      tabContents[tabId] = window.editor.getContent();
      console.log(`Saved content for tab ${tabId}`);
    } else {
      // Handle default tabs that don't have IDs yet
      const language = activeTab.getAttribute('data-lang');
      if (language) {
        tabContents[language] = window.editor.getContent();
        console.log(`Saved content for default ${language} tab`);
      }
    }
  }
}

// Function to switch to a specific tab
function switchToTab(tabId) {
  // Save current content first
  saveCurrentTabContent();

  // Find the tab
  const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (!tab) {
    console.error(`Tab with ID ${tabId} not found`);
    return;
  }

  // Set active tab
  const allTabs = document.querySelectorAll('.tab');
  allTabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  // Switch language
  const language = tab.getAttribute('data-lang');
  if (window.editor && typeof window.editor.setLanguage === 'function') {
    window.editor.setLanguage(language);

    // Load the saved content for this tab
    const content = tabContents[tabId] || '';
    window.editor.setContent(content);
    console.log(`Loaded content for tab ${tabId} (${language})`);
  } else {
    console.error('Editor not initialized or setLanguage method not available');
  }
}

// Function to close a tab
function closeTab(tabId) {
  // Find the tab element
  const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (!tabElement) {
    console.error(`Tab element with ID ${tabId} not found`);
    return;
  }

  // Check if it's the active tab
  const isActive = tabElement.classList.contains('active');

  // Remove the tab from our arrays
  const tabIndex = tabs.items.findIndex(tab => tab.id === tabId);
  if (tabIndex > -1) {
    tabs.items.splice(tabIndex, 1);
  }

  // Remove content for this tab
  delete tabContents[tabId];

  // Remove the tab element
  tabElement.remove();

  // If it was the active tab, switch to another tab
  if (isActive) {
    // Find another tab to activate - prefer the tab to the left
    const allTabs = document.querySelectorAll('.tab:not(.add-tab)');
    if (allTabs.length > 0) {
      const nextTabId = allTabs[Math.min(tabIndex, allTabs.length - 1)].getAttribute('data-tab-id');
      // If it's a default tab without ID, just click it directly
      if (nextTabId) {
        switchToTab(nextTabId);
      } else {
        allTabs[Math.min(tabIndex, allTabs.length - 1)].click();
      }
    } else {
      // No tabs left, just clear the editor
      if (window.editor) {
        window.editor.setContent('');
      }
    }
  }

  showNotification(`Closed tab ${tabElement.textContent.trim()}`, 'info');
}

// Initialize default tabs with IDs
function initializeDefaultTabs() {
  const defaultTabs = document.querySelectorAll('.tab:not(.add-tab)');
  defaultTabs.forEach((tab, index) => {
    const language = tab.getAttribute('data-lang');
    const tabId = `default_${language}`;

    // Set the tab ID
    tab.setAttribute('data-tab-id', tabId);

    // Add tab info to our array
    tabs.items.push({
      id: tabId,
      language: language,
      filename: tab.textContent.trim()
    });

    // Initialize content storage
    tabContents[tabId] = '';

    // Add close button to default tabs
    const tabText = document.createElement('span');
    tabText.textContent = tab.textContent;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'tab-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent triggering the tab click
      closeTab(tabId);
    });

    // Clear existing content and add the new elements
    tab.textContent = '';
    tab.appendChild(tabText);
    tab.appendChild(closeBtn);

    // Update click handler
    tab.onclick = function(e) {
      // Only handle if the click wasn't on the close button
      if (e.target !== closeBtn) {
        switchToTab(tabId);
      }
    };
  });

  // Set the first tab as active
  if (defaultTabs.length > 0) {
    const firstTabId = defaultTabs[0].getAttribute('data-tab-id');
    switchToTab(firstTabId);
  }
}

// Function to initialize panel resizing
function initPanelResize(e) {
  e.preventDefault();

  const editorContainer = document.querySelector('.editor-container');
  const sidePanel = document.querySelector('.side-panel');
  const startX = e.clientX;
  const startWidth = sidePanel.offsetWidth;

  function doPanelResize(e) {
    const mainContainer = document.querySelector('main');
    const totalWidth = mainContainer.offsetWidth;
    const newWidth = Math.max(300, Math.min(600, startWidth - (e.clientX - startX)));

    sidePanel.style.width = `${newWidth}px`;
    editorContainer.style.width = `${totalWidth - newWidth - 5}px`; // 5px for divider
  }

  function stopPanelResize() {
    document.removeEventListener('mousemove', doPanelResize);
    document.removeEventListener('mouseup', stopPanelResize);
  }

  document.addEventListener('mousemove', doPanelResize);
  document.addEventListener('mouseup', stopPanelResize);
}

// Show notification
function showNotification(message, type = 'info') {
  console.log(`Notification (${type}): ${message}`);

  try {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to document body
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto-remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  } catch (error) {
    // Fallback to alert if there's an error with the notification
    console.error('Error showing notification:', error);
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

// Add CSS for the tab close button
function addTabCloseButtonStyles() {
  // Check if styles already exist
  if (document.getElementById('tab-close-styles')) return;

  const style = document.createElement('style');
  style.id = 'tab-close-styles';
  style.textContent = `
    .tab {
      position: relative;
      padding-right: 30px; /* Make room for the close button */
    }
    
    .tab-close {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      color: #888;
      font-size: 14px;
      cursor: pointer;
      display: inline-block;
    }
    
    .tab-close:hover {
      background: rgba(255, 0, 0, 0.2);
      color: #fff;
    }
    
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      background-color: #333;
      color: white;
      border-radius: 4px;
      z-index: 9999;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s, transform 0.3s;
      max-width: 300px;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .notification.success {
      background-color: #4CAF50;
    }
    
    .notification.error {
      background-color: #F44336;
    }
    
    .notification.warning {
      background-color: #FF9800;
    }
  `;

  document.head.appendChild(style);
}

// Function to improve button visibility
function improveButtonVisibility() {
  // Wait for DOM to be fully loaded
  setTimeout(() => {
    // Run button
    const runButton = document.getElementById('run-button');
    if (runButton) {
      runButton.innerHTML = `<span style="color: white; font-weight: bold;">▶ Run</span>`;
      runButton.style.backgroundColor = '#3498db';
      runButton.style.color = 'white';
      runButton.style.padding = '8px 15px';
      runButton.style.borderRadius = '4px';
      runButton.style.border = 'none';
    }

    // Save button
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      saveButton.innerHTML = `<span style="font-weight: bold;">💾 Save</span>`;
      saveButton.style.backgroundColor = '#34495e';
      saveButton.style.color = 'white';
      saveButton.style.padding = '8px 15px';
      saveButton.style.borderRadius = '4px';
      saveButton.style.border = 'none';
    }

    // Settings button
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
      settingsButton.innerHTML = `<span style="font-weight: bold;">⚙️ Settings</span>`;
      settingsButton.style.backgroundColor = '#34495e';
      settingsButton.style.color = 'white';
      settingsButton.style.padding = '8px 15px';
      settingsButton.style.borderRadius = '4px';
      settingsButton.style.border = 'none';
    }

    // Theme button
    const themeButton = document.getElementById('theme-toggle');
    if (themeButton) {
      // Function to update theme button display
      function updateThemeButton() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        themeButton.innerHTML = isDarkTheme ?
          `<span style="font-weight: bold;">🌙 Dark</span>` :
          `<span style="font-weight: bold;">☀️ Light</span>`;
      }

      // Set initial button style
      themeButton.style.backgroundColor = '#34495e';
      themeButton.style.color = 'white';
      themeButton.style.padding = '8px 15px';
      themeButton.style.borderRadius = '4px';
      themeButton.style.border = 'none';

      // Set initial text
      updateThemeButton();

      // Create a completely new click handler
      const originalOnClick = themeButton.onclick;
      themeButton.onclick = function(e) {
        // Call the original handler if it exists
        if (originalOnClick) {
          originalOnClick.call(this, e);
        }

        // Update the button text after a slight delay to ensure the class has changed
        setTimeout(updateThemeButton, 50);
      };

      // Also observe changes to the body class to catch theme changes from elsewhere
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class') {
            updateThemeButton();
          }
        });
      });

      observer.observe(document.body, { attributes: true });
    }

    // Preview button
    const previewButton = document.getElementById('preview-btn');
    if (previewButton) {
      previewButton.innerHTML = `<span style="font-weight: bold;">👁️ Preview</span>`;
      previewButton.style.backgroundColor = '#34495e';
      previewButton.style.color = 'white';
      previewButton.style.padding = '8px 15px';
      previewButton.style.borderRadius = '4px';
      previewButton.style.border = 'none';
    }

    console.log('Button visibility improved');
  }, 500);
}

// Call this function after the page loads
document.addEventListener('DOMContentLoaded', improveButtonVisibility);
// Also call it after a slight delay to ensure it runs after other scripts
setTimeout(improveButtonVisibility, 1000);

// Function to enhance the logo size
function enhanceLogo() {
  // Wait for DOM to be fully loaded
  setTimeout(() => {
    // Find the logo element - adjust the selector if needed
    const logo = document.querySelector('.logo img, .logo-icon');

    if (logo) {
      // Make the logo bigger
      logo.style.width = '50px';
      logo.style.height = '50px';

      // Add some additional styling for better appearance
      logo.style.margin = '5px';
      logo.style.transition = 'transform 0.3s ease';

      console.log('Logo size enhanced');
    } else {
      console.log('Logo element not found');
    }
  }, 500);
}

// Call this function to enhance the logo
document.addEventListener('DOMContentLoaded', enhanceLogo);
// Also call after a delay to ensure it runs after other scripts
setTimeout(enhanceLogo, 1000);

// Function to add sleek fonts to the entire site
function addSleekFonts() {
  // Add Google Fonts to the document
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap';
  document.head.appendChild(fontLink);

  // Create a style element for our font rules
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Apply sleek fonts to the entire site */
    body, 
    button, 
    input, 
    select, 
    textarea,
    .btn,
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
    }
    
    /* Use monospace font for code areas */
    .CodeMirror,
    code,
    pre,
    .code-editor,
    .console-output {
      font-family: 'Roboto Mono', 'Fira Code', 'Source Code Pro', monospace !important;
    }
    
    /* Adjust font weights for better readability */
    body {
      font-weight: 400;
    }
    
    h1, h2, h3, h4, .btn-primary {
      font-weight: 600;
    }
    
    /* Improve letter spacing slightly */
    body {
      letter-spacing: 0.01em;
    }
    
    h1, h2, h3 {
      letter-spacing: -0.02em;
    }
    
    /* Better line height for readability */
    p, li {
      line-height: 1.7;
    }
    
    /* Make headings more sleek */
    h1, h2, h3 {
      line-height: 1.3;
    }
  `;

  document.head.appendChild(styleElement);
  console.log('Sleek fonts applied to the site');
}

// Call this function after the page loads
document.addEventListener('DOMContentLoaded', addSleekFonts);
// Also call it after a slight delay to ensure it overrides other styles
setTimeout(addSleekFonts, 1000);

// Function to add a single Help button and instructions modal
function addHelpButton() {
  // First check if we already added a help button
  if (document.querySelector('#slippy-help-button')) {
    return; // Already exists, don't add another
  }

  // Find the element to add it to (toolbar or similar)
  const navbar = document.querySelector('nav') ||
                 document.querySelector('.navbar') ||
                 document.querySelector('.editor-controls');

  if (!navbar) {
    console.error('Could not find navbar or control area to add Help button');
    return;
  }

  // Create the help button with a unique ID
  const helpButton = document.createElement('button');
  helpButton.id = 'slippy-help-button'; // Unique ID to prevent duplicates
  helpButton.innerHTML = 'Help';
  helpButton.className = 'btn'; // Use the same class as other buttons

  // Copy styles from existing buttons if possible
  const existingButton = document.querySelector('.btn');
  if (existingButton) {
    // Try to match existing button styles
    helpButton.style.backgroundColor = getComputedStyle(existingButton).backgroundColor;
    helpButton.style.color = getComputedStyle(existingButton).color;
    helpButton.style.border = getComputedStyle(existingButton).border;
    helpButton.style.borderRadius = getComputedStyle(existingButton).borderRadius;
    helpButton.style.padding = getComputedStyle(existingButton).padding;
  } else {
    // Default styling
    helpButton.style.backgroundColor = '#3498db';
    helpButton.style.color = 'white';
    helpButton.style.border = 'none';
    helpButton.style.borderRadius = '4px';
    helpButton.style.padding = '8px 15px';
  }

  // Handle click to show instructions modal
  helpButton.addEventListener('click', showInstructionsModal);

  // Add to navbar
  navbar.appendChild(helpButton);
  console.log('Help button added successfully');
}

// Function to add a single Help button and instructions modal
function addHelpButton() {
  // First check if we already added a help button
  if (document.querySelector('#slippy-help-button')) {
    return; // Already exists, don't add another
  }

  // Find the element to add it to (toolbar or similar)
  const navbar = document.querySelector('nav') ||
                 document.querySelector('.navbar') ||
                 document.querySelector('.editor-controls');

  if (!navbar) {
    console.error('Could not find navbar or control area to add Help button');
    return;
  }

  // Create the help button with a unique ID
  const helpButton = document.createElement('button');
  helpButton.id = 'slippy-help-button'; // Unique ID to prevent duplicates
  helpButton.innerHTML = 'Help';
  helpButton.className = 'btn'; // Use the same class as other buttons

  // Apply direct styling to ensure visibility
  helpButton.style.backgroundColor = '#3498db';
  helpButton.style.color = 'white';
  helpButton.style.border = 'none';
  helpButton.style.borderRadius = '4px';
  helpButton.style.padding = '8px 15px';
  helpButton.style.cursor = 'pointer';
  helpButton.style.fontWeight = 'bold';

  // Handle click to show instructions modal
  helpButton.addEventListener('click', showInstructionsModal);

  // Add to navbar
  navbar.appendChild(helpButton);
  console.log('Help button added successfully');
}

// Instructions modal function with high-contrast text
function showInstructionsModal() {
  // Remove any existing modal first to avoid duplicates
  const existingModal = document.getElementById('instructions-modal');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  // Create new modal
  const modal = document.createElement('div');
  modal.id = 'instructions-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
  modal.style.zIndex = '9999';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';

  // Create modal content with high contrast
  const content = document.createElement('div');
  content.style.backgroundColor = '#ffffff';
  content.style.color = '#000000';
  content.style.padding = '30px';
  content.style.borderRadius = '8px';
  content.style.width = '80%';
  content.style.maxWidth = '800px';
  content.style.maxHeight = '80vh';
  content.style.overflowY = 'auto';
  content.style.position = 'relative';
  content.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '15px';
  closeBtn.style.background = '#e74c3c';
  closeBtn.style.color = 'white';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.width = '30px';
  closeBtn.style.height = '30px';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.lineHeight = '30px';
  closeBtn.style.textAlign = 'center';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontWeight = 'bold';
  closeBtn.style.padding = '0';

  closeBtn.onclick = function() {
    document.body.removeChild(modal);
  };

  // Add help content with explicit styling for better readability
  content.innerHTML = `
    <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px; font-weight: bold;">Slippy: AI-Powered Code Editor</h1>
    
    <h2 style="color: #2c3e50; font-size: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 25px; font-weight: bold;">Getting Started</h2>
    
    <h3 style="color: #2c3e50; font-size: 18px; margin-top: 20px; font-weight: bold;">Setting Up AI</h3>
    <ol style="color: #333; margin-left: 25px; line-height: 1.6;">
      <li style="margin-bottom: 8px;">Sign up at <a href="https://console.groq.com" target="_blank" style="color: #3498db; text-decoration: underline;">console.groq.com</a></li>
      <li style="margin-bottom: 8px;">Create an API key in your Groq dashboard</li>
      <li style="margin-bottom: 8px;">Click Settings in Slippy</li>
      <li style="margin-bottom: 8px;">Paste your API key and save</li>
    </ol>
    
    <h3 style="color: #2c3e50; font-size: 18px; margin-top: 20px; font-weight: bold;">Using Tabs</h3>
    <ul style="color: #333; margin-left: 25px; line-height: 1.6;">
      <li style="margin-bottom: 8px;">Click + to create a new tab</li>
      <li style="margin-bottom: 8px;">Select a language for your new file</li>
      <li style="margin-bottom: 8px;">Click on tabs to switch between files</li>
      <li style="margin-bottom: 8px;">Click × to close a tab</li>
    </ul>
    
    <h3 style="color: #2c3e50; font-size: 18px; margin-top: 20px; font-weight: bold;">Running Code</h3>
    <ul style="color: #333; margin-left: 25px; line-height: 1.6;">
      <li style="margin-bottom: 8px;">Write JavaScript in the editor</li>
      <li style="margin-bottom: 8px;">Click Run or press Ctrl+Enter (Cmd+Enter on Mac)</li>
      <li style="margin-bottom: 8px;">See results in the console panel</li>
    </ul>
    
    <h3 style="color: #2c3e50; font-size: 18px; margin-top: 20px; font-weight: bold;">Using the AI Assistant</h3>
    <ul style="color: #333; margin-left: 25px; line-height: 1.6;">
      <li style="margin-bottom: 8px;">Type your question in the AI input field at the bottom</li>
      <li style="margin-bottom: 8px;">Press Enter or click Send</li>
      <li style="margin-bottom: 8px;">The AI will respond with helpful information in the conversation area</li>
    </ul>
    
    <div style="background-color: #f8f9fa; border-left: 4px solid #f39c12; padding: 15px; margin-top: 25px;">
      <h4 style="color: #f39c12; margin-top: 0; margin-bottom: 10px; font-weight: bold;">Pro Tip</h4>
      <p style="color: #333; margin-bottom: 0;">Use console.log() in your JavaScript code to debug. The output will appear in the console panel.</p>
    </div>
  `;

  // Assemble the modal
  content.appendChild(closeBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Add button when DOM is loaded
document.addEventListener('DOMContentLoaded', addHelpButton);
// Also try after a delay in case the DOM is modified by other scripts
setTimeout(addHelpButton, 1000);