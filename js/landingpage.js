/**
 * Enhanced Animation Effects for Slippy Landing Page
 * Complete rewrite with improved navbar functionality and logo optimization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initAnimations();
    optimizeNavbarLogo(); // New optimized logo function
    addSleekFonts();
    adjustDemoSection();
});

/**
 * Initialize navbar functionality
 */
function initNavbar() {
    // Get navbar elements
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar') || document.querySelector('nav');

    // Add mobile menu toggle functionality
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded',
                menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });

        // Close menu when a link is clicked
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Add scroll effect to navbar
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Trigger once on page load
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
    }
}

/**
 * Enhanced function to optimize logo and text visibility in navbar
 */
function optimizeNavbarLogo() {
    // Execute after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
        // Find the logo elements
        const logoIcon = document.querySelector('.logo img, .logo-icon');
        const logoText = document.querySelector('.logo h1, .logo span');
        const navbar = document.querySelector('.navbar');

        if (!logoIcon || !logoText) return;

        // Function to update logo based on available space - much bigger sizes
        function updateLogoForSpace() {
            const navbarWidth = navbar?.clientWidth || window.innerWidth;

            // Adjust based on screen size - extra large sizes
            if (navbarWidth > 992) {
                // Desktop - extra large
                logoText.textContent = 'Slippy';
                logoIcon.style.height = '60px'; // Much bigger
            } else if (navbarWidth > 768) {
                // Tablet - larger
                logoText.textContent = 'Slippy';
                logoIcon.style.height = '55px'; // Much bigger
            } else if (navbarWidth > 480) {
                // Mobile - larger
                logoText.textContent = 'Slippy';
                logoIcon.style.height = '50px'; // Much bigger
            } else {
                // Extra small screens - still bigger
                logoText.textContent = 'Slippy';
                logoIcon.style.height = '45px'; // Much bigger
            }

            // Ensure proper visibility
            logoIcon.style.display = 'block';
            logoText.style.display = 'block';

            // Bold text for emphasis
            logoText.style.fontWeight = '700';

            // Add subtle shadow to the logo for better visibility
            logoIcon.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))';
        }

        // Initial update
        updateLogoForSpace();

        // Add window resize listener
        window.addEventListener('resize', updateLogoForSpace);

        // Add scroll listener to slightly reduce size when scrolled,
        // but still keep it much larger than original
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                // When scrolled down, reduce size slightly but keep it large
                const currentHeight = parseInt(logoIcon.style.height);
                logoIcon.style.height = (currentHeight - 4) + 'px';
            } else {
                // Reset when at top
                updateLogoForSpace();
            }
        });

        // Add subtle hover effect
        const logoLink = document.querySelector('.logo');
        if (logoLink) {
            logoLink.addEventListener('mouseenter', () => {
                logoIcon.style.transform = 'scale(1.05)';
                logoText.style.color = '#3498db'; // Highlight color on hover
            });

            logoLink.addEventListener('mouseleave', () => {
                logoIcon.style.transform = 'scale(1)';
                logoText.style.color = 'white';
            });
        }

        console.log('Logo optimized with extra large size');
    }, 300);
}

/**
 * Initialize all animations
 */
function initAnimations() {
    // Add scroll animation for elements
    addScrollAnimations();

    // Add particle background to hero section
    addParticleBackground();

    // Add hover animations to feature cards
    enhanceFeatureCards();

    // Add typewriter effect to main heading
    addTypewriterEffect();

    // Add counter animation to stats
    addCounterAnimation();

    // Add wave animation to CTA section
    addWaveAnimation();
}

/**
 * Add scroll-triggered animations to elements
 */
function addScrollAnimations() {
    // Elements to animate on scroll
    const animatedElements = [
        { selector: '.feature-card', animation: 'fade-up', delay: 0.1 },
        { selector: '.step', animation: 'fade-right', delay: 0.2 },
        { selector: '.faq-item', animation: 'fade-up', delay: 0.1 },
        { selector: '.section-title', animation: 'fade-down', delay: 0 },
        { selector: '.demo-content', animation: 'fade-right', delay: 0 },
        { selector: '.demo-video', animation: 'fade-left', delay: 0.1 },
        { selector: '.cta .container', animation: 'fade-up', delay: 0 }
    ];

    // Add animation classes
    const style = document.createElement('style');
    style.textContent = `
        /* Base animation styles */
        [data-animate] {
            opacity: 0;
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        [data-animate].animated {
            opacity: 1;
            transform: translate(0, 0) !important;
        }
        
        /* Specific animations */
        [data-animate="fade-up"] {
            transform: translateY(40px);
        }
        
        [data-animate="fade-down"] {
            transform: translateY(-40px);
        }
        
        [data-animate="fade-left"] {
            transform: translateX(40px);
        }
        
        [data-animate="fade-right"] {
            transform: translateX(-40px);
        }
        
        [data-animate="zoom-in"] {
            transform: scale(0.8);
        }
    `;
    document.head.appendChild(style);

    // Apply data attributes to elements
    animatedElements.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach((el, index) => {
            el.setAttribute('data-animate', item.animation);
            // Add staggered delay if specified
            if (item.delay > 0) {
                el.style.transitionDelay = (item.delay * index) + 's';
            }
        });
    });

    // Initialize intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '0px 0px -100px 0px' // Adjust to trigger before the element is fully scrolled into view
    });

    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(element => {
        observer.observe(element);
    });
}

/**
 * Add a particle background effect to the hero section
 */
function addParticleBackground() {
    const hero = document.querySelector('header');
    if (!hero) return;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    `;

    // Make sure hero has position relative for proper canvas placement
    hero.style.position = 'relative';

    // Add the canvas as the first child of hero
    hero.insertBefore(canvas, hero.firstChild);

    // Make sure hero content is above particles
    const heroContainer = document.querySelector('.hero.container');
    if (heroContainer) {
        heroContainer.style.position = 'relative';
        heroContainer.style.zIndex = '2';
    }

    // Initialize the particle effect
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Array to store particle objects
    const particles = [];
    const particleCount = 50;

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around edges
            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0;
            if (this.y < 0) this.y = height;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections between particles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });

    // Start animation
    animate();
}

/**
 * Add enhanced hover animations to feature cards
 */
function enhanceFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');

    cards.forEach(card => {
        // Add 3D hover effect
        card.addEventListener('mousemove', function(e) {
            // Get position relative to card
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            // Calculate rotation angles
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateY = ((x - centerX) / centerX) * 5; // Max 5 degrees
            const rotateX = ((centerY - y) / centerY) * 5; // Max 5 degrees

            // Apply transformation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.1), ${rotateY * 0.5}px ${-rotateX * 0.5}px 20px rgba(0, 0, 0, 0.1)`;

            // Add inner glow based on mouse position
            const icon = card.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = `translateX(${rotateY * 0.5}px) translateY(${-rotateX * 0.5}px)`;
            }
        });

        // Reset card on mouse leave
        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
            card.style.boxShadow = '';

            const icon = card.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
}

/**
 * Add typewriter effect to the main heading
 */
function addTypewriterEffect() {
    const heroHeading = document.querySelector('.hero-content h2');
    if (!heroHeading) return;

    const originalText = heroHeading.textContent;
    heroHeading.textContent = '';

    // Add cursor element
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '|';
    cursor.style.cssText = `
        animation: cursor-blink 1s infinite;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 300;
    `;

    // Add cursor blink animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cursor-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    heroHeading.appendChild(cursor);

    // Typing function
    let i = 0;
    const typeText = () => {
        if (i < originalText.length) {
            heroHeading.insertBefore(document.createTextNode(originalText[i]), cursor);
            i++;
            setTimeout(typeText, 80);
        } else {
            // Fade out cursor after typing is complete
            setTimeout(() => {
                cursor.style.opacity = '0';
                cursor.style.transition = 'opacity 1s ease';
            }, 1500);
        }
    };

    // Start typing after a short delay
    setTimeout(typeText, 500);
}

/**
 * Add counter animation for statistics
 */
function addCounterAnimation() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // Duration in milliseconds
        const startTime = Date.now();
        const startValue = 0;

        function updateCounter() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Use easing function for smoother animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

            counter.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        // Create intersection observer to start animation when element is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counter);
    });
}

/**
 * Add wave animation to the CTA section
 */
function addWaveAnimation() {
    const ctaSection = document.querySelector('.cta');
    if (!ctaSection) return;

    // Add waves container
    const waves = document.createElement('div');
    waves.className = 'waves';
    waves.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 150px;
        overflow: hidden;
    `;

    // Create wave SVG
    waves.innerHTML = `
        <svg class="waves-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path class="wave wave-1" fill="rgba(255, 255, 255, 0.05)" d="M0,192L48,202.7C96,213,192,235,288,224C384,213,480,171,576,165.3C672,160,768,192,864,197.3C960,203,1056,181,1152,192C1248,203,1344,245,1392,266.7L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path class="wave wave-2" fill="rgba(255, 255, 255, 0.08)" d="M0,224L48,229.3C96,235,192,245,288,224C384,203,480,149,576,138.7C672,128,768,160,864,170.7C960,181,1056,171,1152,186.7C1248,203,1344,245,1392,266.7L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path class="wave wave-3" fill="rgba(255, 255, 255, 0.1)" d="M0,256L48,261.3C96,267,192,277,288,277.3C384,277,480,267,576,240C672,213,768,171,864,170.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        .waves-svg {
            width: 100%;
            height: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
        }
        
        .wave {
            animation: wave-animation 20s linear infinite;
        }
        
        .wave-1 {
            animation-delay: 0s;
            animation-duration: 20s;
        }
        
        .wave-2 {
            animation-delay: 1s;
            animation-duration: 15s;
        }
        
        .wave-3 {
            animation-delay: 2s;
            animation-duration: 10s;
        }
        
        @keyframes wave-animation {
            0% {
                transform: translateX(0);
            }
            50% {
                transform: translateX(-25%);
            }
            100% {
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Make sure CTA section has position relative
    ctaSection.style.position = 'relative';
    ctaSection.style.overflow = 'hidden';

    // Add wave effect to CTA section
    ctaSection.appendChild(waves);

    // Ensure content is above waves
    const ctaContainer = ctaSection.querySelector('.container');
    if (ctaContainer) {
        ctaContainer.style.position = 'relative';
        ctaContainer.style.zIndex = '2';
    }
}

/**
 * Add sleek fonts to the entire site
 */
function addSleekFonts() {
    // Add Google Fonts to the document if not already added
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Poppins"]')) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap';
        document.head.appendChild(fontLink);
    }

    // Create a style element for our font rules
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Apply sleek fonts to the entire site */
        body, 
        button, 
        input, 
        select, 
        textarea,
        .btn,
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
        }
        
        /* Use monospace font for code areas */
        .CodeMirror,
        code,
        pre,
        .code-editor,
        .console-output {
            font-family: 'Roboto Mono', 'Fira Code', 'Source Code Pro', monospace !important;
        }
        
        /* Adjust font weights for better readability */
        body {
            font-weight: 400;
        }
        
        h1, h2, h3, h4, .btn-primary {
            font-weight: 600;
        }
        
        /* Improve letter spacing slightly */
        body {
            letter-spacing: 0.01em;
        }
        
        h1, h2, h3 {
            letter-spacing: -0.02em;
        }
        
        /* Better line height for readability */
        p, li {
            line-height: 1.7;
        }
        
        /* Make headings more sleek */
        h1, h2, h3 {
            line-height: 1.3;
        }
    `;

    document.head.appendChild(styleElement);
    console.log('Sleek fonts applied to the site');
}

/**
 * Adjust the demo video section
 */
function adjustDemoSection() {
    // Find the video caption
    const videoCaption = document.querySelector('.video-caption');
    if (videoCaption) {
        // Remove the caption
        videoCaption.remove();
        console.log('Video caption removed');
    }

    // Find the Try Now button
    const tryNowBtn = document.querySelector('.try-now-btn');
    if (tryNowBtn) {
        // Move the button closer to the video
        tryNowBtn.style.marginTop = '20px';
        // Center the button
        tryNowBtn.style.display = 'block';
        tryNowBtn.style.margin = '20px auto 0';
        // Make button more prominent
        tryNowBtn.style.padding = '12px 30px';
        tryNowBtn.style.fontSize = '1.1rem';
        tryNowBtn.style.fontWeight = 'bold';
        console.log('Try Now button repositioned');
    }

    // Find the demo video container
    const demoVideoContainer = document.querySelector('.demo-video-container, .demo-video');
    if (demoVideoContainer) {
        // Adjust the bottom margin to bring the button closer
        demoVideoContainer.style.marginBottom = '20px';
    }
}

// Add window resize event to handle responsive adjustments
window.addEventListener('resize', function() {
    // This is handled by the optimizeNavbarLogo function now
});

