class CodeEditor {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    this.language = 'javascript';  // Default language
  }

  getContent() {
    return this.element ? this.element.value : '';
  }

  setContent(content) {
    if (this.element) {
      this.element.value = content;
    }
  }

  setLanguage(language) {
    this.language = language;
  }
}

export default CodeEditor;  // or AIAssistant, or ConsoleOutput