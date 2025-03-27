import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// This component will load your original HTML pages
const OriginalApp = ({ page }) => {
  useEffect(() => {
    // Dynamically load your original JavaScript files
    const scripts = [
      '/js/editor.js',
      '/js/console.js',
      '/js/file-manager.js',
      '/js/config.js',
      '/js/GroqClient.js',
      '/js/ai-assistant.js',
      '/js/themes.js',
      '/js/app.js'
    ];

    scripts.forEach(script => {
      const scriptEl = document.createElement('script');
      scriptEl.src = script;
      document.body.appendChild(scriptEl);
    });

    return () => {
      // Clean up scripts when component unmounts
      scripts.forEach(script => {
        const scriptEl = document.querySelector(`script[src="${script}"]`);
        if (scriptEl) document.body.removeChild(scriptEl);
      });
    };
  }, []);

  return (
    <div className="original-app-container">
      <iframe
        src={`/${page}.html`}
        style={{width: '100%', height: '100vh', border: 'none'}}
        title="Slippy IDE"
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OriginalApp page="landingpage" />} />
        <Route path="/editor" element={<OriginalApp page="index" />} />
      </Routes>
    </Router>
  );
}

export default App;