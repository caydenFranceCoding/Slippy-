class CodeEditor {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.content = '';
    this.language = 'javascript';
    this.tabSize = 4;
    this.history = [];
    this.historyIndex = -1;
    this.cursorPosition = { line: 0, column: 0 };

    if (typeof CodeMirror === 'undefined') {
      console.error('CodeMirror is not loaded. Loading required dependencies...');
      this.loadDependencies(() => {
        this.init();
      });
    } else {
      this.init();
    }
  }

  loadDependencies(callback) {
    const addScript = (src, onLoad) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = onLoad;
      document.head.appendChild(script);
    };

    const addCss = (href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    // Add CSS files
    addCss('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css');
    addCss('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/dracula.min.css');
    addCss('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/hint/show-hint.min.css');
    addCss('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/fold/foldgutter.min.css');

    // Add scripts in sequence
    addScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js', () => {
      // Load language modes
      addScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/javascript/javascript.min.js', () => {
        addScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/xml/xml.min.js', () => {
          addScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/css/css.min.js', () => {
            addScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/htmlmixed/htmlmixed.min.js', () => {
              // Load addons
              const addons = [
                'addon/edit/closebrackets.min.js',
                'addon/edit/matchbrackets.min.js',
                'addon/edit/matchtags.min.js',
                'addon/edit/closetag.min.js',
                'addon/hint/show-hint.min.js',
                'addon/hint/javascript-hint.min.js',
                'addon/hint/html-hint.min.js',
                'addon/hint/css-hint.min.js',
                'addon/fold/foldcode.min.js',
                'addon/fold/foldgutter.min.js',
                'addon/fold/brace-fold.min.js',
                'addon/fold/xml-fold.min.js',
                'addon/fold/comment-fold.min.js'
              ];

              let loadedAddons = 0;
              addons.forEach(addon => {
                addScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/${addon}`, () => {
                  loadedAddons++;
                  if (loadedAddons === addons.length) {
                    if (callback) callback();
                  }
                });
              });
            });
          });
        });
      });
    });
  }

  init() {
    if (this.element) {
      this.element.innerHTML = '';

      try {
        // Create CodeMirror instance
        this.editor = CodeMirror(this.element, {
          value: '',
          mode: 'javascript',
          theme: document.body.classList.contains('light-theme') ? 'default' : 'dracula',
          lineNumbers: true,
          lineWrapping: false,
          indentUnit: this.tabSize,
          tabSize: this.tabSize,
          indentWithTabs: false,
          autoCloseBrackets: true,
          matchBrackets: true,
          matchTags: true,
          autoCloseTags: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Tab": (cm) => {
              if (cm.somethingSelected()) {
                cm.indentSelection("add");
              } else {
                cm.replaceSelection(" ".repeat(this.tabSize));
              }
            }
          }
        });

        this.setupEventListeners();
        this.applyCustomStyling();
        console.log('CodeMirror editor initialized successfully');
      } catch (error) {
        console.error('Error initializing CodeMirror:', error);
        this.fallbackToSimpleEditor();
      }
    } else {
      console.error('Editor element not found');
    }
  }

  setupEventListeners() {
    // Handle content changes
    this.editor.on('change', () => {
      const value = this.editor.getValue();

      if (value !== this.content) {
        this.saveToHistory();
        this.content = value;
      }
    });

    // Track cursor position
    this.editor.on('cursorActivity', () => {
      const cursor = this.editor.getCursor();
      this.cursorPosition = { line: cursor.line, column: cursor.ch };
    });

    // Update UI on focus/blur
    this.editor.on('focus', () => {
      this.element.classList.add('focused');
    });

    this.editor.on('blur', () => {
      this.element.classList.remove('focused');
    });

    // Theme change listener
    window.addEventListener('themeChange', (e) => {
      const isDark = e.detail && e.detail.theme === 'dark';
      this.editor.setOption('theme', isDark ? 'dracula' : 'default');
    });
  }

  applyCustomStyling() {
    const cmElement = this.element.querySelector('.CodeMirror');
    if (cmElement) {
      cmElement.classList.add('slippy-editor');
    }

    setTimeout(() => {
      if (this.editor && typeof this.editor.refresh === 'function') {
        this.editor.refresh();
      }
    }, 0);
  }

  fallbackToSimpleEditor() {
    console.warn('Falling back to simple editor');
    this.element.innerHTML = '';

    // Create line numbers element
    this.lineNumbers = document.createElement('div');
    this.lineNumbers.className = 'line-numbers';

    // Create code content element
    this.codeContent = document.createElement('div');
    this.codeContent.className = 'code-content';

    // Create textarea for input
    this.textarea = document.createElement('textarea');
    this.textarea.className = 'code-input';
    this.textarea.spellcheck = false;
    this.textarea.autocomplete = 'off';
    this.textarea.autocorrect = 'off';
    this.textarea.autocapitalize = 'off';

    // Create syntax highlighting element
    this.highlighting = document.createElement('pre');
    this.highlighting.className = 'syntax-highlighting';
    this.highlighting.innerHTML = '<code></code>';
    this.code = this.highlighting.querySelector('code');

    // Apply styling
    this.textarea.style.fontFamily = 'Courier New, monospace';
    this.highlighting.style.fontFamily = 'Courier New, monospace';
    this.code.style.fontFamily = 'Courier New, monospace';

    // Assemble the editor
    this.codeContent.appendChild(this.textarea);
    this.codeContent.appendChild(this.highlighting);
    this.element.appendChild(this.lineNumbers);
    this.element.appendChild(this.codeContent);

    // Add event listeners
    this.textarea.addEventListener('input', () => {
      const value = this.textarea.value;

      if (value !== this.content) {
        this.saveToHistory();
        this.content = value;
        this.updateEditor();
      }
    });

    // Set empty content
    this.setContent('');
  }

  updateEditor() {
    if (!this.editor) {
      this.updateLineNumbers();
      this.updateSyntaxHighlighting();
    }
  }

  updateLineNumbers() {
    if (!this.editor && this.lineNumbers) {
      const lines = this.content.split('\n');
      let lineNumbersHTML = '';

      for (let i = 0; i < lines.length; i++) {
        lineNumbersHTML += `<div class="line-number">${i + 1}</div>`;
      }

      this.lineNumbers.innerHTML = lineNumbersHTML;
    }
  }

  updateSyntaxHighlighting() {
    if (!this.editor && this.code) {
      try {
        if (window.SyntaxHighlighter && typeof window.SyntaxHighlighter.highlight === 'function') {
          const highlighted = window.SyntaxHighlighter.highlight(this.escapeHTML(this.content), this.language);
          this.code.innerHTML = highlighted;
        } else {
          this.code.innerHTML = this.escapeHTML(this.content)
            .replace(/\n/g, '<br>')
            .replace(/ /g, '&nbsp;')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }

        if (this.textarea && this.highlighting) {
          this.highlighting.scrollTop = this.textarea.scrollTop;
          this.highlighting.scrollLeft = this.textarea.scrollLeft;
        }
      } catch (error) {
        console.error('Syntax highlighting error:', error);
        if (this.code) {
          this.code.textContent = this.content;
        }
      }
    }
  }

  escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  saveToHistory() {
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }

    if (this.historyIndex !== -1 && this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(this.content);
    this.historyIndex = this.history.length - 1;
  }

  getContent() {
    if (this.editor) {
      return this.editor.getValue();
    } else if (this.textarea) {
      return this.textarea.value;
    }
    return this.content;
  }

  setContent(content, saveToHistory = true) {
    if (saveToHistory && content !== this.content) {
      this.saveToHistory();
    }

    this.content = content;

    if (this.editor) {
      this.editor.setValue(content);
      this.editor.refresh();
    } else if (this.textarea) {
      this.textarea.value = content;
      this.updateEditor();
    }
  }

  setLanguage(language) {
    this.language = language;

    if (this.editor) {
      // Map language to CodeMirror mode
      let mode;
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          mode = 'javascript';
          break;
        case 'html':
          mode = 'htmlmixed';
          break;
        case 'css':
          mode = 'css';
          break;
        case 'python':
          mode = 'python';
          break;
        case 'php':
          mode = 'php';
          break;
        case 'json':
          mode = { name: 'javascript', json: true };
          break;
        default:
          mode = 'javascript';
      }

      this.editor.setOption('mode', mode);
    } else {
      this.updateSyntaxHighlighting();
    }
  }

  setTabSize(size) {
    this.tabSize = size;

    if (this.editor) {
      this.editor.setOption('tabSize', size);
      this.editor.setOption('indentUnit', size);
    }
  }

  focus() {
    if (this.editor) {
      this.editor.focus();
    } else if (this.textarea) {
      this.textarea.focus();
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.setContent(this.history[this.historyIndex], false);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.setContent(this.history[this.historyIndex], false);
    }
  }

  setCursorPosition(position) {
    if (this.editor) {
      this.editor.setCursor(position.line, position.column);
      this.editor.focus();
    } else if (this.textarea) {
      const lines = this.content.split('\n');
      let index = 0;

      for (let i = 0; i < position.line; i++) {
        index += (lines[i] || '').length + 1;
      }

      index += Math.min(position.column, (lines[position.line] || '').length);
      this.textarea.selectionStart = this.textarea.selectionEnd = index;
      this.textarea.focus();
    }
  }

  insertAtCursor(text) {
    if (this.editor) {
      const cursor = this.editor.getCursor();
      this.editor.replaceRange(text, cursor);
      this.editor.focus();
    } else if (this.textarea) {
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      const value = this.textarea.value;

      this.textarea.value = value.substring(0, start) + text + value.substring(end);
      this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
      this.textarea.focus();
      this.textarea.dispatchEvent(new Event('input'));
    }
  }

  replaceSelection(text) {
    if (this.editor) {
      this.editor.replaceSelection(text);
      this.editor.focus();
    } else if (this.textarea) {
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      const value = this.textarea.value;

      this.textarea.value = value.substring(0, start) + text + value.substring(end);
      this.textarea.selectionStart = start;
      this.textarea.selectionEnd = start + text.length;
      this.textarea.focus();
      this.textarea.dispatchEvent(new Event('input'));
    }
  }

  getSelectedText() {
    if (this.editor) {
      return this.editor.getSelection();
    } else if (this.textarea) {
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      return this.textarea.value.substring(start, end);
    }
    return '';
  }

  formatCode() {
    console.log('Code formatting requested');

    if (window.js_beautify || window.html_beautify || window.css_beautify) {
      let formatted = this.content;

      try {
        if (this.language === 'javascript' && window.js_beautify) {
          formatted = window.js_beautify(this.getContent(), {
            indent_size: this.tabSize,
            space_in_empty_paren: true
          });
        } else if (this.language === 'html' && window.html_beautify) {
          formatted = window.html_beautify(this.getContent(), {
            indent_size: this.tabSize,
            max_preserve_newlines: 1
          });
        } else if (this.language === 'css' && window.css_beautify) {
          formatted = window.css_beautify(this.getContent(), {
            indent_size: this.tabSize
          });
        }

        this.setContent(formatted);
      } catch (error) {
        console.error('Error formatting code:', error);
      }
    } else {
      console.warn('Code formatting requires js-beautify library');
    }
  }

  showHints() {
    if (this.editor && CodeMirror.commands.autocomplete) {
      CodeMirror.commands.autocomplete(this.editor);
    }
  }

  toggleFold() {
    if (this.editor && this.editor.foldCode) {
      const line = this.editor.getCursor().line;
      this.editor.foldCode(line);
    }
  }
}