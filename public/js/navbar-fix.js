document.addEventListener('DOMContentLoaded', function() {
    // Fix mobile menu toggle
    fixMobileMenu();
    // Fix navigation links
    fixNavigationLinks();
    // Add active state to current nav item
    addActiveNavState();
    // Make navbar sticky on scroll
    makeNavbarSticky();
});

function fixMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!menuToggle || !navLinks) {
        console.error('Menu toggle or nav links not found');
        return;
    }

    // Replace existing click handler
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        navLinks.classList.toggle('active');

        // Toggle menu icon
        const icon = menuToggle.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times'; // Change to X icon when open
            } else {
                icon.className = 'fas fa-bars'; // Change back to bars when closed
            }
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== menuToggle) {
            navLinks.classList.remove('active');
            // Reset icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });

    // Prevent clicks inside nav from closing it
    navLinks.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Close menu when window is resized to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            // Reset icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
}

function fixNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    navLinks.forEach(link => {
        // Remove old event listeners
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        // Add new event listener
        newLink.addEventListener('click', function(e) {
            e.preventDefault();

            // Close mobile menu if open
            const mobileNav = document.querySelector('.nav-links.active');
            if (mobileNav) {
                mobileNav.classList.remove('active');
                // Reset icon
                const icon = document.querySelector('.menu-toggle i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            }

            // Get the target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Smooth scroll to target
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });

    // Special handling for "Open Editor" button
    const editorButton = document.querySelector('.nav-links a.btn-primary');
    if (editorButton && editorButton.getAttribute('href') === 'index.html') {
        // Make sure it goes to the editor page
        editorButton.addEventListener('click', function(e) {
            // This one should just navigate normally
        });
    }
}

function addActiveNavState() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    // Add scroll event listener
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.scrollY + 200; // 200px offset for better UX

        // Find current section
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });

        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    });
}

function makeNavbarSticky() {
    const navbar = document.querySelector('header nav');
    const header = document.querySelector('header');

    if (!navbar || !header) return;

    // Clone the navbar
    const navbarClone = navbar.cloneNode(true);
    navbarClone.classList.add('sticky-nav');
    navbarClone.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: rgba(44, 62, 80, 0.95);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 10px 0;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        z-index: 1000;
        backdrop-filter: blur(5px);
    `;

    // Add to document body
    document.body.appendChild(navbarClone);

    // Reinitialize click handlers for the cloned navbar
    const menuToggle = navbarClone.querySelector('.menu-toggle');
    const navLinks = navbarClone.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Fix navigation links in cloned navbar
    const clonedLinks = navbarClone.querySelectorAll('a[href^="#"]');
    clonedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }

            // Get the target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Smooth scroll to target
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });

                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });

    // Show sticky navbar on scroll
    window.addEventListener('scroll', function() {
        const heroHeight = header.offsetHeight - navbar.offsetHeight;

        if (window.scrollY > heroHeight) {
            navbarClone.style.transform = 'translateY(0)';
        } else {
            navbarClone.style.transform = 'translateY(-100%)';
        }
    });
}

// Add active class style to navigation
const navActiveStyle = document.createElement('style');
navActiveStyle.textContent = `
    .nav-links a.active {
        color: #3498db !important;
        font-weight: 600;
    }
    
    .nav-links.active {
        transform: translateY(0) !important;
        opacity: 1 !important;
    }
    
    @media (max-width: 768px) {
        .nav-links {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #2c3e50;
            padding: 0;
            flex-direction: column;
            text-align: center;
            transform: translateY(-150%);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .nav-links a {
            padding: 15px;
            display: block;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav-links a:last-child {
            border-bottom: none;
        }
    }
`;

document.head.appendChild(navActiveStyle);