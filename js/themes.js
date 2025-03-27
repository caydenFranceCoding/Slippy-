/**
 * CodeAI Assistant - Theme Management
 * Handles theme switching and persistence
 */

// Define theme object
const ThemeManager = {
  // Current theme
  currentTheme: 'dark',

  // Available themes
  themes: ['dark', 'light'],

  /**
   * Initialize the theme manager
   */
  init: function() {
    // Load saved theme
    this.loadSavedTheme();

    // Add event listener for theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  },

  /**
   * Load the saved theme from localStorage
   */
  loadSavedTheme: function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && this.themes.includes(savedTheme)) {
      this.setTheme(savedTheme);
    }
  },

  /**
   * Set the theme
   * @param {string} theme - The theme name
   */
  setTheme: function(theme) {
    if (!this.themes.includes(theme)) {
      console.error(`Theme "${theme}" is not available`);
      return;
    }

    // Update current theme
    this.currentTheme = theme;

    // Apply theme to body
    document.body.classList.remove(...this.themes.map(t => `${t}-theme`));
    document.body.classList.add(`${theme}-theme`);

    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    // Save theme preference
    localStorage.setItem('theme', theme);

    console.log(`Theme set to "${theme}"`);
  },

  /**
   * Toggle between dark and light themes
   */
  toggleTheme: function() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
};

// Initialize theme on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  ThemeManager.init();
});

// Export theme manager to window
window.ThemeManager = ThemeManager;