class AIAssistant {
  constructor() {
    this.suggestionsEnabled = true;
    this.currentModel = 'default';
  }

  toggleSuggestions(enabled) {
    this.suggestionsEnabled = enabled;
  }

  setModel(model) {
    this.currentModel = model;
  }

  addMessageToConversation(role, message) {
    console.log(`${role}: ${message}`);
  }

  processQuery(query) {
    console.log('Processing query:', query);
  }
}

export default AIAssistant;  // or AIAssistant, or ConsoleOutput