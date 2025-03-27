(function() {
  // Add preview button to navbar
  function addPreviewButton() {
    const navbar = document.querySelector('nav');
    if (!navbar) return;
    if (document.getElementById('preview-btn')) return;

    const previewBtn = document.createElement('button');
    previewBtn.id = 'preview-btn';
    previewBtn.className = 'btn btn-primary';
    previewBtn.innerHTML = 'Preview';
    previewBtn.addEventListener('click', handlePreviewClick);

    navbar.appendChild(previewBtn);
    console.log('Preview button added to navbar');
  }

  // Handle preview button click
  function handlePreviewClick() {
    console.log('Preview button clicked');

    // Get content from editor
    let content = '';
    let language = 'html';

    if (window.editor && typeof window.editor.getContent === 'function') {
      content = window.editor.getContent();
      if (window.editor.language) {
        language = window.editor.language;
      }
    } else {
      const editorTextarea = document.querySelector('#code-editor textarea, .code-editor textarea');
      if (editorTextarea) {
        content = editorTextarea.value;
      }

      const activeTab = document.querySelector('.tab.active');
      if (activeTab && activeTab.getAttribute('data-lang')) {
        language = activeTab.getAttribute('data-lang');
      }
    }

    console.log(`Preview content with language: ${language}, length: ${content.length} characters`);
    openPreviewWindow(content, language);
  }

  // Function to open a preview window
  function openPreviewWindow(content, language) {
    let htmlContent = '';

    if (language === 'html') {
      // For HTML, just use the content directly
      htmlContent = content;
    }
    else if (language === 'javascript' || language === 'js') {
      // For JavaScript, create a page that will run the code
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>JavaScript Preview</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .output { border: 1px solid #ddd; padding: 15px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>JavaScript Preview</h1>
  <div class="output" id="output"></div>
  <script>
    // Capture console output
    const output = document.getElementById('output');
    const originalLog = console.log;
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      const line = document.createElement('div');
      line.textContent = args.join(' ');
      output.appendChild(line);
    };
    
    try {
      ${content}
    } catch(error) {
      console.log('Error: ' + error.message);
    }
  </script>
</body>
</html>`;
    }
    else if (language === 'css') {
      // For CSS, create a page with sample elements to style
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>CSS Preview</title>
  <style>${content}</style>
</head>
<body>
  <h1>CSS Preview</h1>
  <p>This is a paragraph with <a href="#">a link</a> and some <strong>bold text</strong>.</p>
  <button>Button</button>
  <form>
    <input type="text" placeholder="Input field">
  </form>
  <div class="container">This is a div with class "container"</div>
</body>
</html>`;
    }
    else {
      // For unsupported languages
      htmlContent = `<html><body><h1>Preview not supported for ${language}</h1></body></html>`;
    }

    // Create a data URL
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);

    // Open in a new window
    const previewWindow = window.open(dataUrl, 'preview', 'width=800,height=600');

    if (previewWindow) {
      previewWindow.focus();
      console.log('Preview window opened successfully');
    } else {
      console.error('Failed to open preview window. Check popup settings.');
      alert('Failed to open preview window. Please check if popups are blocked by your browser.');
    }
  }

  // Initialize when the page loads
  function init() {
    console.log('Initializing preview functionality');
    addPreviewButton();

    // Hook into the run button if it exists
    const runButton = document.getElementById('run-button');
    if (runButton) {
      const originalOnClick = runButton.onclick;
      runButton.onclick = function(e) {
        if (typeof originalOnClick === 'function') {
          originalOnClick.call(this, e);
        }
        setTimeout(handlePreviewClick, 100);
      };
      console.log('Run button enhanced with preview functionality');
    }
  }

  // Initialize after the page has loaded
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  // Make the preview function available globally
  window.previewCode = handlePreviewClick;
})();