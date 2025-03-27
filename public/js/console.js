class ConsoleOutput {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.maxEntries = 100;
  }

  log(...args) {
    this.addEntry(args, 'log');
  }

  error(...args) {
    this.addEntry(args, 'error');
  }

  warn(...args) {
    this.addEntry(args, 'warn');
  }

  info(...args) {
    this.addEntry(args, 'info');
  }

  addEntry(args, type) {
    // Create a new console entry element
    const entry = document.createElement('div');
    entry.className = `console-entry console-${type}`;

    // Format the arguments
    const formattedArgs = this.formatArgs(args);
    entry.innerHTML = formattedArgs;

    // Add timestamp
    const timestamp = document.createElement('span');
    timestamp.className = 'console-timestamp';
    timestamp.textContent = this.getTimestamp();
    entry.prepend(timestamp);

    // Add to the console
    this.element.appendChild(entry);

    // Limit the number of entries
    this.limitEntries();

    // Scroll to the bottom
    this.element.scrollTop = this.element.scrollHeight;
  }

  formatArgs(args) {
    return args.map(arg => {
      // Handle different types
      if (arg === null) {
        return '<span class="console-null">null</span>';
      }

      if (arg === undefined) {
        return '<span class="console-undefined">undefined</span>';
      }

      if (typeof arg === 'string') {
        return `<span class="console-string">"${this.escapeHTML(arg)}"</span>`;
      }

      if (typeof arg === 'number') {
        return `<span class="console-number">${arg}</span>`;
      }

      if (typeof arg === 'boolean') {
        return `<span class="console-boolean">${arg}</span>`;
      }

      if (typeof arg === 'function') {
        return `<span class="console-function">ƒ ${arg.name || '(anonymous)'}</span>`;
      }

      if (arg instanceof Error) {
        return `<span class="console-error">${this.escapeHTML(arg.toString())}</span>`;
      }

      if (Array.isArray(arg)) {
        return `<span class="console-array">[${arg.map(item => this.formatArgs([item])).join(', ')}]</span>`;
      }

      if (typeof arg === 'object') {
        try {
          return `<span class="console-object">${this.formatObject(arg)}</span>`;
        } catch (error) {
          return `<span class="console-error">Error formatting object: ${error.message}</span>`;
        }
      }

      // Default case
      return this.escapeHTML(String(arg));
    }).join(' ');
  }

  formatObject(obj) {
    // For DOM elements, show the element type
    if (obj instanceof HTMLElement) {
      return `<${obj.tagName.toLowerCase()}>`;
    }

    // For other objects, use JSON.stringify with formatting
    try {
      const json = JSON.stringify(obj, null, 2);

      // For short objects, display inline
      if (json.length < 50) {
        return this.escapeHTML(json);
      }

      // For longer objects, create a collapsible section
      return `<details>
                <summary>${obj.constructor.name || 'Object'} {...}</summary>
                <pre>${this.escapeHTML(json)}</pre>
              </details>`;
    } catch (error) {
      return `[Object ${obj.constructor.name || 'object'}]`;
    }
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
  }

  limitEntries() {
    const entries = this.element.querySelectorAll('.console-entry');

    if (entries.length > this.maxEntries) {
      for (let i = 0; i < entries.length - this.maxEntries; i++) {
        this.element.removeChild(entries[i]);
      }
    }
  }

  clear() {
    this.element.innerHTML = '';
    this.addEntry(['Console cleared'], 'info');
  }
}