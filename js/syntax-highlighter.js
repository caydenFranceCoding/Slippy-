window.SyntaxHighlighter = (function() {
  // Token types
  const TOKEN_TYPES = {
    KEYWORD: 'keyword',
    STRING: 'string',
    NUMBER: 'number',
    COMMENT: 'comment',
    FUNCTION: 'function',
    METHOD: 'method',
    PROPERTY: 'property',
    OPERATOR: 'operator',
    PUNCTUATION: 'punctuation',
    BUILTIN: 'builtin',
    BOOLEAN: 'boolean',
    NULL: 'null'
  };

  // Keywords for different languages
  const KEYWORDS = {
    javascript: [
      'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class',
      'extends', 'import', 'export', 'try', 'catch', 'finally', 'throw',
      'async', 'await', 'from', 'of', 'in', 'instanceof', 'typeof', 'void'
    ],
    html: [
      'html', 'head', 'body', 'div', 'span', 'a', 'img', 'button', 'form',
      'input', 'label', 'script', 'style', 'link', 'meta', 'title'
    ],
    css: [
      '@media', '@keyframes', '@import', '@charset', '@font-face',
      'background', 'color', 'margin', 'padding', 'font', 'border'
    ]
  };

  // Built-in objects
  const BUILTINS = {
    javascript: [
      'console', 'document', 'window', 'Array', 'Object', 'String', 'Number',
      'Boolean', 'Math', 'Date', 'RegExp', 'JSON', 'Map', 'Set', 'Promise'
    ]
  };

  // HTML escape function
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Simple tokenizer
  function tokenize(code, language) {
    language = language.toLowerCase();
    if (!['javascript', 'js', 'html', 'css'].includes(language)) {
      language = 'javascript';
    }
    if (language === 'js') language = 'javascript';

    if (!code) return '';

    const safeCode = escapeHTML(code);
    let result = safeCode;

    // Highlight keywords
    if (KEYWORDS[language]) {
      const keywordPattern = new RegExp(
        '\\b(' + KEYWORDS[language].join('|') + ')\\b', 'g'
      );
      result = result.replace(keywordPattern, '<span class="token keyword">$1</span>');
    }

    // Highlight built-ins for JavaScript
    if (language === 'javascript' && BUILTINS[language]) {
      const builtinPattern = new RegExp(
        '\\b(' + BUILTINS[language].join('|') + ')\\b', 'g'
      );
      result = result.replace(builtinPattern, '<span class="token builtin">$1</span>');
    }

    // Add line breaks and maintain whitespace
    result = result
      .replace(/\n/g, '<br>')
      .replace(/ /g, '&nbsp;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    return result;
  }

  // Public API
  return {
    highlight: function(code, language) {
      try {
        return tokenize(code, language || 'javascript');
      } catch (error) {
        console.error('Syntax highlighting failed:', error);
        // Fall back to basic HTML escaping
        return escapeHTML(code)
          .replace(/\n/g, '<br>')
          .replace(/ /g, '&nbsp;')
          .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
    },

    getSupportedLanguages: function() {
      return ['javascript', 'html', 'css'];
    }
  };
})();