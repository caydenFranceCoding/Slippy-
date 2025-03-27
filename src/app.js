import CodeEditor from './components/CodeEditor';
import AIAssistant from './components/AIAssistant';
import ConsoleOutput from './components/ConsoleOutput';
const APP_VERSION = '1.0.0';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  try {
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

    console.log("CodeAI Assistant initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});

// Set up application event listeners
function setupEventListeners() {
  // Check if DOM elements exist before adding event listeners
  if (!document.querySelector('.tab')) {
    console.error('Tab elements not found in the DOM');
    return;
  }

  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Skip the add tab button
      if (this.classList.contains('add-tab')) {
        createNewTab();
        return;
      }

      // Set active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Switch language based on tab
      const language = this.getAttribute('data-lang');
      if (window.editor && typeof window.editor.setLanguage === 'function') {
        window.editor.setLanguage(language);
      } else {
        console.error('Editor not initialized or setLanguage method not available');
      }
    });
  });
  
  // Run button
  const runButton = document.getElementById('run-button');
  runButton.addEventListener('click', runCode);
  
  // Save button
  const saveButton = document.getElementById('save-button');
  saveButton.addEventListener('click', saveCode);
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  
  // Settings button
  const settingsButton = document.getElementById('settings-button');
  const settingsModal = document.getElementById('settings-modal');
  const closeModal = document.querySelector('.close-modal');
  
  settingsButton.addEventListener('click', function() {
    settingsModal.style.display = 'flex';
  });
  
  closeModal.addEventListener('click', function() {
    settingsModal.style.display = 'none';
  });
  
  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });
  
  // Settings controls
  const fontSizeRange = document.getElementById('font-size');
  const fontSizeValue = document.querySelector('#font-size + .setting-value');
  
  fontSizeRange.addEventListener('input', function() {
    const size = this.value;
    fontSizeValue.textContent = `${size}px`;
    document.documentElement.style.setProperty('--editor-font-size', `${size}px`);
  });
  
  const tabSizeSelect = document.getElementById('tab-size');
  tabSizeSelect.addEventListener('change', function() {
    window.editor.tabSize = parseInt(this.value);
  });
  
  // AI settings
  const aiSuggestionsToggle = document.getElementById('ai-suggestions');
  aiSuggestionsToggle.addEventListener('change', function() {
    window.aiAssistant.toggleSuggestions(this.checked);
  });
  
  const aiModelSelect = document.getElementById('ai-model');
  aiModelSelect.addEventListener('change', function() {
    window.aiAssistant.setModel(this.value);
  });
  
  // Groq API settings
  const apiKeyInput = document.getElementById('groq-api-key');
  const saveApiKeyButton = document.getElementById('save-api-key');
  
  saveApiKeyButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      const success = window.groqClient.configure(apiKey);
      if (success) {
        showNotification('API key saved successfully!', 'success');
        // Hide the key in the UI for security
        apiKeyInput.value = '••••••••••••••••••••••';
        // Update the UI to show that Groq is enabled
        document.body.classList.add('groq-enabled');
      } else {
        showNotification('Failed to save API key.', 'error');
      }
    } else {
      showNotification('Please enter a valid API key.', 'error');
    }
  });
  
  // Groq model selector
  const groqModelSelect = document.getElementById('groq-model');
  groqModelSelect.addEventListener('change', function() {
    window.groqClient.setModel(this.value);
  });
  
  // Clear console button
  const clearConsoleButton = document.getElementById('clear-console');
  clearConsoleButton.addEventListener('click', function() {
    window.consoleOutput.clear();
  });
  
  // Panel resizing
  const panelDivider = document.querySelector('.panel-divider');
  panelDivider.addEventListener('mousedown', initPanelResize);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+Enter or Cmd+Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      runCode();
    }
    
    // Ctrl+S or Cmd+S to save code
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCode();
    }
  });
  
  // Check for Groq API configuration on load
  setTimeout(() => {
    const configured = window.groqClient.loadSavedConfiguration();
    if (configured) {
      document.body.classList.add('groq-enabled');
      showNotification('Groq API configured and ready!', 'success');
      
      // Load saved model if available
      const savedModel = localStorage.getItem('groqModel');
      if (savedModel) {
        groqModelSelect.value = savedModel;
        window.groqClient.setModel(savedModel);
      }
      
      // Update API key input to show masked value
      if (apiKeyInput) {
        apiKeyInput.value = '••••••••••••••••••••••';
      }
    }
  }, 500);
}

// Function to run the code
function runCode() {
  const code = window.editor.getContent();
  const language = window.editor.language;
  
  // Clear previous console output
  window.consoleOutput.clear();
  
  if (language === 'javascript') {
    try {
      // Create a safe environment for running the code
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };
      
      // Override console methods to capture output
      console.log = function(...args) {
        originalConsole.log(...args);
        window.consoleOutput.log(...args);
      };
      
      console.error = function(...args) {
        originalConsole.error(...args);
        window.consoleOutput.error(...args);
      };
      
      console.warn = function(...args) {
        originalConsole.warn(...args);
        window.consoleOutput.warn(...args);
      };
      
      console.info = function(...args) {
        originalConsole.info(...args);
        window.consoleOutput.info(...args);
      };
      
      // Run the code in a try-catch block
      const result = eval(`(function() { ${code} })()`);
      
      // Restore original console methods
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      
      // Log the result if it's not undefined
      if (result !== undefined) {
        window.consoleOutput.log('=> ', result);
      }
    } catch (error) {
      window.consoleOutput.error(error.toString());
      
      // Ask AI assistant for help with the error
      suggestErrorFix(error.toString());
    }
  } else {
    window.consoleOutput.info(`Running ${language} code is not supported in this demo.`);
  }
}

// Function to save code
function saveCode() {
  const code = window.editor.getContent();
  const language = window.editor.language;
  const filename = getFilenameForLanguage(language);
  
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
  
  if (body.classList.contains('light-theme')) {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  }
}

// Function to initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const body = document.body;
  const themeIcon = document.querySelector('.theme-icon');
  
  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeIcon.textContent = '☀️';
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeIcon.textContent = '🌙';
  }
}

// Function to get filename based on language
function getFilenameForLanguage(language) {
  const extensions = {
    javascript: 'js',
    html: 'html',
    css: 'css'
  };
  
  const ext = extensions[language] || 'txt';
  return `code.${ext}`;
}

// Function to create a new tab
function createNewTab() {
  // Prompt for language
  const language = prompt('Select language (javascript, html, css):').toLowerCase();
  
  // Validate language
  if (!['javascript', 'html', 'css'].includes(language)) {
    showNotification('Unsupported language. Please choose javascript, html, or css.', 'error');
    return;
  }
  
  // Create a new tab
  const tabs = document.querySelector('.tabs');
  const newTab = document.createElement('button');
  newTab.className = 'tab';
  newTab.setAttribute('data-lang', language);
  
  // Set tab name
  const filename = getFilenameForLanguage(language);
  newTab.textContent = filename;
  
  // Insert before the add tab button
  const addTab = document.querySelector('.add-tab');
  tabs.insertBefore(newTab, addTab);
  
  // Add event listener
  newTab.addEventListener('click', function() {
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    this.classList.add('active');
    
    // Switch language
    window.editor.setLanguage(language);
    window.editor.setContent('');
  });
  
  // Activate the new tab
  newTab.click();
}

// Function to initialize panel resizing
function initPanelResize(e) {
  e.preventDefault();
  
  const editor = document.querySelector('.editor-container');
  const sidePanel = document.querySelector('.side-panel');
  const startX = e.clientX;
  const startWidth = sidePanel.offsetWidth;
  
  function doPanelResize(e) {
    const editorContainer = document.querySelector('main');
    const totalWidth = editorContainer.offsetWidth;
    const newWidth = Math.max(300, Math.min(600, startWidth - (e.clientX - startX)));
    
    sidePanel.style.width = `${newWidth}px`;
    editor.style.width = `${totalWidth - newWidth - 5}px`; // 5px for divider
  }
  
  function stopPanelResize() {
    document.removeEventListener('mousemove', doPanelResize);
    document.removeEventListener('mouseup', stopPanelResize);
  }
  
  document.addEventListener('mousemove', doPanelResize);
  document.addEventListener('mouseup', stopPanelResize);
}

// Function to suggest a fix for an error
function suggestErrorFix(errorMessage) {
  if (window.aiAssistant && window.groqClient && window.groqClient.isConfigured) {
    // Ask AI assistant for help with the error
    const code = window.editor.getContent();
    const language = window.editor.language;
    
    // Add a system message
    window.aiAssistant.addMessageToConversation('system', 'I noticed an error in your code. Let me help with that...');
    
    // Process the query in the background
    window.aiAssistant.processQuery(`Fix this error in my ${language} code: ${errorMessage}`);
  }
}

// Function to show a notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
