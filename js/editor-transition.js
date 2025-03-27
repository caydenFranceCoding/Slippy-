/**
 * Editor Page Transition
 * Add this code to the editor page (index.html) to handle the fade-in effect
 */

// Check if we arrived via the loader
if (sessionStorage.getItem('showLoaderTransition') === 'true') {
    // Add styles for the fade-in effect
    const style = document.createElement('style');
    style.textContent = `
        body {
            opacity: 0;
        }
        
        body.fade-in {
            animation: fadeInBody 1s ease-out forwards;
        }
        
        @keyframes fadeInBody {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Apply the fade-in effect once the page is loaded
    window.addEventListener('load', function() {
        // Short delay to ensure everything is ready
        setTimeout(() => {
            document.body.classList.add('fade-in');

            // Remove the flag when the transition is complete
            setTimeout(() => {
                sessionStorage.removeItem('showLoaderTransition');
            }, 1000);
        }, 100);
    });
}