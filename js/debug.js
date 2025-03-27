window.Debug = {
  errors: [],
  resources: {
    js: {},
    css: {}
  },

  init: function() {
    window.addEventListener('error', this.handleError.bind(this));
    this.checkRequiredElements();
    this.checkScripts();
    this.printDebugInfo();
  },

  handleError: function(event) {
    const error = {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error ? event.error.stack : null,
      timestamp: new Date().toISOString()
    };

    this.errors.push(error);
    console.warn('Error captured by debug tools:', error);
  },

  checkRequiredElements: function() {
    const requiredElements = [
      '#code-editor',
      '.ai-conversation',
      '#ai-input',
      '#ai-submit',
      '#console-output',
      '#run-button',
      '#save-button',
      '#theme-toggle'
    ];

    const missingElements = requiredElements.filter(selector => !document.querySelector(selector));

    if (missingElements.length > 0) {
      console.error('Missing required DOM elements:', missingElements);
    } else {
      console.log('All required DOM elements found');
    }
  },

  checkScripts: function() {
    const requiredScripts = [
      'utils.js',
      'syntax-highlighter.js',
      'editor.js',
      'console.js',
      'file-manager.js',
      'GroqClient.js',
      'ai-assistant.js',
      'themes.js',
      'app.js'
    ];

    const scriptTags = Array.from(document.scripts);

    requiredScripts.forEach(script => {
      const found = scriptTags.some(tag => tag.src.includes(script));
      this.resources.js[script] = found;

      if (!found) {
        console.warn(`Script "${script}" not found in document`);
      }
    });

    const requiredObjects = [
      { name: 'CodeEditor', global: 'CodeEditor' },
      { name: 'AIAssistant', global: 'AIAssistant' },
      { name: 'ConsoleOutput', global: 'ConsoleOutput' },
      { name: 'SyntaxHighlighter', global: 'SyntaxHighlighter' },
      { name: 'GroqAPIClient', global: 'groqClient' },
      { name: 'ThemeManager', global: 'ThemeManager' },
      { name: 'FileManager', global: 'fileManager' },
      { name: 'Utils', global: 'Utils' }
    ];

    requiredObjects.forEach(obj => {
      const exists = typeof window[obj.global] !== 'undefined';
      if (!exists) {
        console.error(`Required object "${obj.name}" is not defined globally as "${obj.global}"`);
      }
    });
  },

  printDebugInfo: function() {
    console.log('======= CodeAI Debug Info =======');
    console.log('Browser:', navigator.userAgent);
    console.log('URL:', window.location.href);
    console.log('Resources:', this.resources);
    console.log('Errors:', this.errors);
    console.log('=================================');
  },

  autoFix: function() {
    if (!document.querySelector('#code-editor')) {
      console.warn('Creating missing #code-editor element');
      const editor = document.createElement('div');
      editor.id = 'code-editor';
      document.body.appendChild(editor);
    }

    if (typeof CodeEditor === 'undefined' && typeof window.CodeEditor === 'function') {
      console.warn('Fixing CodeEditor reference');
      window.CodeEditor = CodeEditor;
    }

    const requiredStyles = [
      'main.css',
      'editor.css',
      'console.css'
    ];

    requiredStyles.forEach(style => {
      const found = Array.from(document.styleSheets).some(sheet =>
        sheet.href && sheet.href.includes(style));
      this.resources.css[style] = found;

      if (!found) {
        console.warn(`Style "${style}" not found in document`);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  window.Debug.init();
});

console.log('Debug tools loaded. Access via window.Debug in the console.');