
/**
 * Landing Page Transition
 * Handles fade-in effect when returning to the landing page
 */
(function() {
    // Execute immediately to avoid flash of unstyled content
    // Check if we're returning from the editor
    if (sessionStorage.getItem('showLandingTransition') === 'true') {
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
        window.addEventListener('DOMContentLoaded', function() {
            // Short delay to ensure everything is ready
            setTimeout(() => {
                document.body.classList.add('fade-in');

                // Remove the flag when the transition is complete
                setTimeout(() => {
                    sessionStorage.removeItem('showLandingTransition');
                }, 1000);
            }, 100);
        });
    }
})();