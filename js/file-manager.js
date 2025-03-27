class FileManager {
  constructor() {
    this.files = {};
    this.currentFile = null;
  }

  init() {
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveCurrentFile());
    }

    this.loadSavedFiles();
  }

  loadSavedFiles() {
    try {
      const savedFiles = localStorage.getItem('codeai-files');
      if (savedFiles) {
        this.files = JSON.parse(savedFiles);
        console.log('Loaded saved files:', Object.keys(this.files).length);
      }
    } catch (error) {
      console.error('Error loading saved files:', error);
    }
  }

  saveCurrentFile() {
    if (!window.editor) {
      console.error('Editor not initialized');
      return;
    }

    const code = window.editor.getContent();
    const language = window.editor.language;
    const filename = this.getCurrentFilename(language);

    if (code.trim() === '') {
      console.warn('No code to save');
      return;
    }

    this.saveToLocalStorage(filename, code, language);
    this.downloadFile(filename, code);
  }

  saveToLocalStorage(filename, content, language) {
    try {
      this.files[filename] = {
        content,
        language,
        lastModified: Date.now()
      };

      localStorage.setItem('codeai-files', JSON.stringify(this.files));
      console.log(`File "${filename}" saved to localStorage`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    console.log(`File "${filename}" downloaded`);
  }

  getCurrentFilename(language) {
    const extensions = {
      javascript: 'js',
      html: 'html',
      css: 'css'
    };

    const ext = extensions[language] || 'txt';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `codeai_${timestamp}.${ext}`;
  }

  loadFile(filename) {
    if (!this.files[filename]) {
      console.error(`File "${filename}" not found`);
      return;
    }

    if (!window.editor) {
      console.error('Editor not initialized');
      return;
    }

    const file = this.files[filename];
    window.editor.setLanguage(file.language);
    window.editor.setContent(file.content);
    this.currentFile = filename;
    console.log(`File "${filename}" loaded`);
  }
}

// Initialize file manager
window.fileManager = new FileManager();

document.addEventListener('DOMContentLoaded', function() {
  if (window.fileManager) {
    window.fileManager.init();
  }
});