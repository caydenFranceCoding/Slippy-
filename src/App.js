import React from 'react';
import './App.css';

function App() {
  // Check which page to load
  const path = window.location.pathname;
  const isEditor = path === '/editor';
  const pagePath = isEditor ? '/index.html' : '/landingpage.html';

  return (
    <div className="slippy-container" style={{ height: '100vh', width: '100%' }}>
      <iframe
        src={pagePath}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        title="Slippy IDE"
      />
    </div>
  );
}

export default App;