window.debugMode = true;

// Global error logger
window.logError = function(message, source, error) {
  console.error(`[INITIALIZATION ERROR] ${message}`, source || '', error || '');

  setTimeout(() => {
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
      const errorElem = document.createElement('div');
      errorElem.className = 'console-entry console-error';
      errorElem.textContent = `${message} - ${source || ''}`;
      consoleOutput.appendChild(errorElem);
    }
  }, 1000);
};

// Create fallbacks for critical objects
window.createFallbacks = function() {
  // Editor fallback
  if (typeof CodeEditor === 'undefined') {
    console.warn('Using fallback CodeEditor class');
    window.CodeEditor = class CodeEditor {
      constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.content = '';
        this.language = 'javascript';
        console.warn('Using fallback CodeEditor. Limited functionality available.');

        if (this.element) {
          this.element.innerHTML = '<textarea style="width:100%;height:300px"></textarea>';
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

  // Console output fallback
  if (typeof ConsoleOutput === 'undefined') {
    console.warn('Using fallback ConsoleOutput class');
    window.ConsoleOutput = class ConsoleOutput {
      constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (this.element) {
          this.element.innerHTML = '<div class="console-fallback">Console output will appear here</div>';
        }
      }

      log(...args) { this._addEntry(args.join(' '), 'log'); }
      error(...args) { this._addEntry(args.join(' '), 'error'); }
      warn(...args) { this._addEntry(args.join(' '), 'warn'); }
      info(...args) { this._addEntry(args.join(' '), 'info'); }

      _addEntry(text, type) {
        if (this.element) {
          const entry = document.createElement('div');
          entry.className = `console-entry console-${type}`;
          entry.textContent = text;
          this.element.appendChild(entry);
        }
      }

      clear() {
        if (this.element) {
          this.element.innerHTML = '';
        }
      }
    };
  }

  // AI Assistant fallback
  if (typeof AIAssistant === 'undefined') {
    console.warn('Using fallback AIAssistant class');
    window.AIAssistant = class AIAssistant {
      constructor() {
        this.conversationHistory = [];
        this.aiPanel = document.querySelector('.ai-conversation');
        this.aiInput = document.getElementById('ai-input');
        this.aiSubmit = document.getElementById('ai-submit');

        if (this.aiSubmit) {
          this.aiSubmit.addEventListener('click', () => {
            if (this.aiInput && this.aiInput.value) {
              this.addMessageToConversation('user', this.aiInput.value);
              this.addMessageToConversation('assistant', 'The AI assistant is not fully initialized. Please check the console for errors.');
              this.aiInput.value = '';
            }
          });
        }
      }

      addMessageToConversation(sender, content) {
        if (this.aiPanel) {
          const message = document.createElement('div');
          message.className = 'ai-message';

          const avatar = document.createElement('div');
          avatar.className = 'ai-avatar';
          avatar.textContent = sender === 'user' ? 'You' : 'AI';

          const contentDiv = document.createElement('div');
          contentDiv.className = 'ai-content';
          contentDiv.innerHTML = `<p>${content}</p>`;

          message.appendChild(avatar);
          message.appendChild(contentDiv);
          this.aiPanel.appendChild(message);
        }
      }

      toggleSuggestions() {}
      setModel() {}
    };
  }

  // Groq client fallback
  if (typeof window.groqClient === 'undefined') {
    console.warn('Using fallback GroqClient');
    window.groqClient = {
      isConfigured: false,
      configure: () => false,
      loadSavedConfiguration: () => false,
      setModel: () => {}
    };
  }
};

// Initialize on DOM content loaded
window.addEventListener('DOMContentLoaded', function() {
  console.info('Startup script initializing...');

  // Create fallbacks when window loads
  window.addEventListener('load', function() {
    // Wait a bit to see if real implementations load
    setTimeout(() => {
      window.createFallbacks();

      // Try to initialize app if it hasn't already
      if (typeof window.editor === 'undefined') {
        console.warn('Late initialization with fallbacks');
        try {
          // Initialize fallbacks
          window.editor = new window.CodeEditor('code-editor');
          window.consoleOutput = new window.ConsoleOutput('console-output');
          window.aiAssistant = new window.AIAssistant();
          console.info('Fallbacks initialized successfully');
        } catch (e) {
          window.logError('Failed to initialize fallbacks', 'startup.js', e);
        }
      }
    }, 2000);
  });
});