document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
});

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    if (!navbar || !menuToggle || !navLinks) {
        console.error('Navbar elements not found');
        return;
    }

    // Handle mobile menu toggle
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');

        // Update icon if using font awesome
        const icon = menuToggle.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times'; // X icon
            } else {
                icon.className = 'fas fa-bars'; // Bars icon
            }
        }
    });

    // Handle navigation link clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(event) {
            // Close mobile menu
            navLinks.classList.remove('active');

            // Reset icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }

            // Highlight active link
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');

            // Handle smooth scrolling to sections
            if (this.getAttribute('href').startsWith('#')) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    // Account for fixed navbar height
                    const navbarHeight = navbar.offsetHeight;
                    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Update active link based on scroll position
    window.addEventListener('scroll', function() {
        const navbarHeight = navbar.offsetHeight;
        const scrollPosition = window.pageYOffset + navbarHeight + 50; // Add some offset

        // Find the current section
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const currentId = '#' + section.getAttribute('id');

                // Update active state in navigation
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === currentId) {
                        item.classList.add('active');
                    }
                });
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !menuToggle.contains(e.target)) {

            navLinks.classList.remove('active');

            // Reset icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
}