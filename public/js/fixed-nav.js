document.addEventListener('DOMContentLoaded', function() {
    // Remove any existing sticky navbar implementations
    const existingStickyNav = document.querySelector('.sticky-nav');
    if (existingStickyNav) {
        existingStickyNav.remove();
    }

    fixNavigation();
});

function fixNavigation() {
    const navbar = document.querySelector('nav');
    const header = document.querySelector('header');

    if (!navbar) {
        console.error('Navigation bar not found');
        return;
    }

    navbar.classList.add('main-nav');
    navbar.style.transition = 'all 0.3s ease';

    const navbarPosition = navbar.offsetTop;

    fixActiveLinks();

    // Handle scroll events
    window.addEventListener('scroll', function() {
        if (window.scrollY > navbarPosition + 100) {
            navbar.classList.add('is-sticky');
        } else {
            navbar.classList.remove('is-sticky');
        }
    });
}

function fixActiveLinks() {
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    history.pushState(null, null, targetId);
                }
            }

            // Remove active class from all links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });

            // Add active class to clicked link
            this.classList.add('active');
        });
    });

    // Set active link based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop - 100 && window.scrollY < sectionTop + sectionHeight - 100) {
                currentSectionId = '#' + section.getAttribute('id');
            }
        });

        // Update active link
        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentSectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}