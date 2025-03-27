class AIAssistant {
  constructor() {
    this.conversationHistory = [];
    this.isProcessing = false;
    this.suggestionsEnabled = true;
    this.model = 'advanced';

    this.aiPanel = document.querySelector('.ai-conversation');
    this.aiInput = document.getElementById('ai-input');
    this.aiSubmit = document.getElementById('ai-submit');

    this.init();
  }

  init() {
    if (this.aiSubmit) {
      this.aiSubmit.addEventListener('click', () => this.submitQuery());
    }

    if (this.aiInput) {
      this.aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.submitQuery();
        }
      });
    }

    // Add initial greeting
    this.conversationHistory.push({
      role: 'assistant',
      content: 'Hello! I\'m your CodeAI assistant. How can I help you with your code today?'
    });
  }

  submitQuery() {
    if (!this.aiInput) return;

    const query = this.aiInput.value.trim();

    if (query === '' || this.isProcessing) return;

    // Add user message to conversation
    this.addMessageToConversation('user', query);

    this.aiInput.value = '';

    this.processQuery(query);
  }

  async processQuery(query) {
    this.isProcessing = true;

    this.showTypingIndicator();

    try {
      if (window.groqClient && window.groqClient.isConfigured) {
        const editorContent = window.editor ? window.editor.getContent() : '';
        const currentLanguage = window.editor ? window.editor.language : 'javascript';

        try {
          let response;

          if (query.toLowerCase().includes('explain')) {
            response = await window.groqClient.explainCode(editorContent, currentLanguage);
          } else if (query.toLowerCase().includes('improve')) {
            response = await window.groqClient.getCodeCompletion(
              editorContent,
              currentLanguage,
              "Suggest improvements for this code following best practices."
            );
          } else if (query.toLowerCase().includes('error') || query.toLowerCase().includes('fix')) {
            response = await window.groqClient.analyzeCode(editorContent, currentLanguage);
          } else {
            response = await window.groqClient.getCodeCompletion(editorContent, currentLanguage, query);
          }
          this.removeTypingIndicator();

          this.addMessageToConversation('assistant', response);
        } catch (error) {
          console.error('Error with Groq API:', error);
          this.removeTypingIndicator();
          this.addMessageToConversation('assistant', `I encountered an error with the AI service. Please check your API key configuration or try again later.`);
        }
      } else {
        setTimeout(() => {
          this.removeTypingIndicator();
          this.addMessageToConversation('assistant', this.generateGenericResponse(query));
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing query:', error);
      this.removeTypingIndicator();
      this.addMessageToConversation('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
    }

    this.isProcessing = false;
  }

  addMessageToConversation(role, content) {
    this.conversationHistory.push({ role, content });

    if (!this.aiPanel) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'ai-message';

    const avatarEl = document.createElement('div');
    avatarEl.className = 'ai-avatar';
    avatarEl.textContent = role === 'user' ? 'You' : 'AI';

    const contentEl = document.createElement('div');
    contentEl.className = 'ai-content';

    const processedContent = this.processContentWithCodeBlocks(content);
    contentEl.innerHTML = processedContent;

    messageEl.appendChild(avatarEl);
    messageEl.appendChild(contentEl);

    this.aiPanel.appendChild(messageEl);
    this.aiPanel.scrollTop = this.aiPanel.scrollHeight;
  }

  processContentWithCodeBlocks(content) {
    return content.replace(/```(\w+)?\n([\s\S]+?)\n```/g, (match, language, code) => {
      return `<pre><code class="language-${language || 'plaintext'}">${this.escapeHTML(code)}</code></pre>`;
    }).replace(/\n/g, '<br>');
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showTypingIndicator() {
    if (!this.aiPanel) return;

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'ai-message typing-indicator';
    typingIndicator.innerHTML = `
      <div class="ai-avatar">AI</div>
      <div class="ai-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.aiPanel.appendChild(typingIndicator);
    this.aiPanel.scrollTop = this.aiPanel.scrollHeight;
  }

  removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  generateGenericResponse(query) {
    return `
I see you're asking about "${query}". To use AI-powered responses, please configure the Groq API in settings.

In the meantime, I can help with:
- Code explanations
- Suggesting improvements
- Fixing errors

Please configure Groq API for more advanced assistance.
    `;
  }

  toggleSuggestions(enabled) {
    this.suggestionsEnabled = enabled;
  }

  setModel(model) {
    this.model = model;
  }
}