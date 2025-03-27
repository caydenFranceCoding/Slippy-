// terminal-loader.js
document.addEventListener('DOMContentLoaded', function() {
    // Create loader if we're on the landing page
    if (!window.location.href.includes('index.html')) {
        createLoaderElements();
        setupLandingPageHandlers();
    }
    // Handle fade-in on the editor page
    else if (sessionStorage.getItem('showLoaderTransition') === 'true') {
        setupEditorPageTransition();
    }
});

function createLoaderElements() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.innerHTML = `
        <div class="terminal-loader">
            <div class="terminal-header">
                <div class="terminal-title">Status</div>
                <div class="terminal-controls">
                    <div class="control close"></div>
                    <div class="control minimize"></div>
                    <div class="control maximize"></div>
                </div>
            </div>
            <div class="text">Loading...</div>
            <div class="progress-bar"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        /* Loader overlay */
        .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        
        .loader-overlay.active {
            opacity: 1;
            pointer-events: all;
        }
        
        /* Terminal loader styles */
        @keyframes blinkCursor {
            50% { opacity: 0; }
        }
        
        @keyframes typeAndDelete {
            0%, 10% { width: 0; }
            45%, 55% { width: 6.2em; }
            90%, 100% { width: 0; }
        }
        
        .terminal-loader {
            border: 0.1em solid #333;
            background-color: #1a1a1a;
            color: #0f0;
            font-family: "Courier New", monospace;
            font-size: 1em;
            padding: 1.5em 1em;
            width: 12em;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
        }
        
        /* Header styles */
        .terminal-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1.5em;
            background-color: #333;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            padding: 0 0.4em;
            box-sizing: border-box;
        }
        
        .terminal-controls {
            float: right;
        }
        
        .control {
            display: inline-block;
            width: 0.6em;
            height: 0.6em;
            margin-left: 0.4em;
            border-radius: 50%;
            background-color: #777;
        }
        
        .control.close { background-color: #e33; }
        .control.minimize { background-color: #ee0; }
        .control.maximize { background-color: #0b0; }
        
        .terminal-title {
            float: left;
            line-height: 1.5em;
            color: #eee;
        }
        
        .text {
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            border-right: 0.2em solid green;
            animation: typeAndDelete 4s steps(11) infinite, blinkCursor 0.5s step-end infinite alternate;
            margin-top: 1.5em;
        }
        
        /* Progress bar */
        .progress-bar {
            width: 100%;
            height: 4px;
            background-color: #333;
            margin-top: 15px;
            position: relative;
            overflow: hidden;
            border-radius: 2px;
        }
        
        .progress-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 0%;
            background-color: #0f0;
            transition: width 2s ease;
        }
        
        .loader-overlay.active .progress-bar::after {
            width: 100%;
        }
        
        /* Editor page transition */
        body.fade-in {
            animation: fadeInBody 1s ease-out forwards;
        }
        
        @keyframes fadeInBody {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

function setupLandingPageHandlers() {
    // Find links to the editor
    const editorLinks = document.querySelectorAll('a[href="index.html"], .btn-primary, a.btn');
    const overlay = document.querySelector('.loader-overlay');

    editorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === 'index.html' ||
                this.textContent.includes('Editor') ||
                this.textContent.includes('Try') ||
                this.textContent.includes('Launch')) {

                e.preventDefault();
                const targetUrl = this.getAttribute('href');
                sessionStorage.setItem('showLoaderTransition', 'true');

                overlay.classList.add('active');
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 2500);
            }
        });
    });
}

function setupEditorPageTransition() {
    // Hide the body initially
    document.body.style.opacity = '0';

    // Add fade-in after a short delay
    setTimeout(() => {
        document.body.classList.add('fade-in');
        setTimeout(() => {
            sessionStorage.removeItem('showLoaderTransition');
        }, 1000);
    }, 100);
}
