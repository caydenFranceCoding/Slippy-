/**
 * Enhanced Home Button with Terminal Loader
 * Adds a home button that shows the terminal loader when clicked
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add the home button and terminal loader
    addHomeButtonWithLoader();
});

function addHomeButtonWithLoader() {
    // Create the loader first
    createTerminalLoader();

    // Create floating home button
    const homeButton = document.createElement('a');
    homeButton.className = 'back-to-home-btn';
    homeButton.href = 'landingpage.html'; // Change this to your landing page URL
    homeButton.innerHTML = '<i class="fas fa-home"></i>';
    homeButton.title = 'Back to Home';

    // Add click handler to show the loader
    homeButton.addEventListener('click', function(e) {
        e.preventDefault();
        const targetUrl = this.getAttribute('href');

        // Show the terminal loader
        const loaderOverlay = document.querySelector('.loader-overlay');
        loaderOverlay.classList.add('active');

        // Activate the progress bar
        const progressBar = loaderOverlay.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.classList.add('active');
        }

        // Navigate after animation
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 2500); // Same timing as the loader on the landing page
    });

    // Add home button styles
    const buttonStyles = document.createElement('style');
    buttonStyles.textContent = `
        .back-to-home-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #3498db;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transition: all 0.3s ease;
            font-size: 20px;
        }
        
        .back-to-home-btn:hover {
            background-color: #2980b9;
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
    `;

    // Append styles and button to the document
    document.head.appendChild(buttonStyles);
    document.body.appendChild(homeButton);
}

// Create the terminal loader elements and styles
function createTerminalLoader() {
    // Create loader overlay
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
            <div class="text">Returning...</div>
            <div class="progress-bar"></div>
        </div>
    `;

    // Add loader styles
    const loaderStyles = document.createElement('style');
    loaderStyles.textContent = `
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
            50% {
                border-right-color: transparent;
            }
        }
        
        @keyframes typeAndDelete {
            0%, 10% {
                width: 0;
            }
            45%, 55% {
                width: 6.2em;
            }
            90%, 100% {
                width: 0;
            }
        }
        
        .terminal-loader {
            border: 0.1em solid #333;
            background-color: #1a1a1a;
            color: #0f0;
            font-family: "Courier New", Courier, monospace;
            font-size: 1em;
            padding: 1.5em 1em;
            width: 12em;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
        }
        
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
        
        .control.close {
            background-color: #e33;
        }
        
        .control.minimize {
            background-color: #ee0;
        }
        
        .control.maximize {
            background-color: #0b0;
        }
        
        .terminal-title {
            float: left;
            line-height: 1.5em;
            color: #eee;
        }
        
        .text {
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            border-right: 0.2em solid green; /* Cursor */
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
        
        .progress-bar.active::after {
            width: 100%;
        }
    `;

    // Append to document
    document.head.appendChild(loaderStyles);
    document.body.appendChild(overlay);
}