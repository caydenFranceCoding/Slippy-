class ConsoleOutput {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
  }

  log(...args) {
    this.output('log', ...args);
  }

  error(...args) {
    this.output('error', ...args);
  }

  warn(...args) {
    this.output('warn', ...args);
  }

  info(...args) {
    this.output('info', ...args);
  }

  clear() {
    if (this.element) {
      this.element.innerHTML = '';
    }
  }

  output(type, ...args) {
    if (this.element) {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');

      const lineElement = document.createElement('div');
      lineElement.classList.add(type);
      lineElement.textContent = message;
      this.element.appendChild(lineElement);
    }
  }
}

export default ConsoleOutput;  // or AIAssistant, or ConsoleOutput