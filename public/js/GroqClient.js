class GroqAPIClient {
  constructor(apiKey = null) {
    this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    this.apiKey = apiKey || (typeof CONFIG !== 'undefined' ? CONFIG.GROQ_API_KEY : null);
    this.model = 'llama3-70b-8192';
    this.isConfigured = false;
  }

  configure(apiKey) {
    if (apiKey && apiKey.trim() !== '') {
      this.apiKey = apiKey;
      this.isConfigured = true;
      localStorage.setItem('groqApiKey', apiKey);
      return true;
    }
    return false;
  }

  loadSavedConfiguration() {
    const savedApiKey = localStorage.getItem('groqApiKey');
    if (savedApiKey) {
      return this.configure(savedApiKey);
    }
    return false;
  }

  setModel(model) {
    const availableModels = [
      'llama3-70b-8192',
      'llama3-8b-8192',
      'mixtral-8x7b-32768',
      'gemma-7b-it'
    ];

    if (availableModels.includes(model)) {
      this.model = model;
      localStorage.setItem('groqModel', model);
      return true;
    }
    return false;
  }

  async generateCompletion(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('API client not configured with an API key');
    }

    const defaultOptions = {
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      const sanitizedApiKey = this.apiKey.replace(/[^\x00-\x7F]/g, '');

      const sanitizedMessages = messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : String(msg.content)
      }));

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sanitizedApiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: sanitizedMessages,
          temperature: requestOptions.temperature,
          max_tokens: requestOptions.max_tokens,
          top_p: requestOptions.top_p
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  async getCodeCompletion(code, language, prompt) {
    const context = `You are an expert ${language} developer assisting with code. 
    The user is working on the following code:
    
    \`\`\`${language}
    ${code}
    \`\`\``;

    const messages = [
      { role: 'system', content: context },
      { role: 'user', content: prompt || 'Please help improve this code or suggest what comes next.' }
    ];

    const completion = await this.generateCompletion(messages, {
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  }

  async analyzeCode(code, language) {
    const prompt = `Please analyze this ${language} code and provide:
    1. Potential bugs or errors
    2. Performance improvements
    3. Best practice suggestions
    
    Be concise and focus on practical improvements.
    
    \`\`\`${language}
    ${code}
    \`\`\``;

    const messages = [
      { role: 'system', content: 'You are an expert code reviewer. Be thorough but concise.' },
      { role: 'user', content: prompt }
    ];

    const completion = await this.generateCompletion(messages, {
      temperature: 0.2,
      max_tokens: 1500
    });

    return completion.choices[0].message.content;
  }

  async explainCode(code, language) {
    const prompt = `Please explain this ${language} code in a clear and educational way:
    
    \`\`\`${language}
    ${code}
    \`\`\``;

    const messages = [
      { role: 'system', content: 'You are an expert programming teacher. Explain code clearly and thoroughly.' },
      { role: 'user', content: prompt }
    ];

    const completion = await this.generateCompletion(messages, {
      temperature: 0.5,
      max_tokens: 1500
    });

    return completion.choices[0].message.content;
  }

  getAvailableModels() {
    return [
      { id: 'llama3-70b-8192', name: 'LLaMA 3 70B', description: 'Most powerful model, best for complex tasks' },
      { id: 'llama3-8b-8192', name: 'LLaMA 3 8B', description: 'Smaller model, faster response times' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Good for code generation and long contexts' },
      { id: 'gemma-7b-it', name: 'Gemma 7B IT', description: 'Google\'s instruction-tuned model' }
    ];
  }
}

// Export client instance
window.groqClient = new GroqAPIClient();