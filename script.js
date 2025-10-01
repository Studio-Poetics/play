document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to any anchor links
    const smoothScroll = (target) => {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Add hover effects to timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px)';
            item.style.transition = 'transform 0.3s ease';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
        });

        // Add click interaction
        item.addEventListener('click', () => {
            const productType = item.querySelector('.product-type').textContent;
            console.log(`Clicked on: ${productType}`);

            // Add a subtle animation
            item.style.transform = 'scale(0.98)';
            setTimeout(() => {
                item.style.transform = 'translateY(0) scale(1)';
            }, 150);
        });
    });

    // Add hover effects to color swatches
    const colorSwatches = document.querySelectorAll('.color-swatch');

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('mouseenter', () => {
            swatch.style.transform = 'scale(1.1)';
            swatch.style.transition = 'transform 0.2s ease';
            swatch.style.cursor = 'pointer';
        });

        swatch.addEventListener('mouseleave', () => {
            swatch.style.transform = 'scale(1)';
        });

        swatch.addEventListener('click', () => {
            const computedStyle = window.getComputedStyle(swatch);
            const backgroundColor = computedStyle.backgroundColor;

            // Copy color to clipboard (if supported)
            if (navigator.clipboard) {
                navigator.clipboard.writeText(backgroundColor).then(() => {
                    console.log('Color copied to clipboard:', backgroundColor);

                    // Show temporary feedback
                    const originalTransform = swatch.style.transform;
                    swatch.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        swatch.style.transform = originalTransform;
                    }, 200);
                });
            }
        });
    });

    // Add subtle animation to robot eyes
    const eyes = document.querySelectorAll('.eye');

    const blinkEyes = () => {
        eyes.forEach(eye => {
            eye.style.transform = 'scaleY(0.1)';
            setTimeout(() => {
                eye.style.transform = 'scaleY(1)';
            }, 150);
        });
    };

    // Random blink every 3-8 seconds
    const scheduleNextBlink = () => {
        const delay = Math.random() * 5000 + 3000; // 3-8 seconds
        setTimeout(() => {
            blinkEyes();
            scheduleNextBlink();
        }, delay);
    };

    scheduleNextBlink();

    // Add parallax effect to large text elements
    const parallaxElements = document.querySelectorAll('.labs-text-large, .backing-text h2');

    const handleScroll = () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.2;

        parallaxElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

            if (isInViewport) {
                element.style.transform = `translateY(${rate}px)`;
            }
        });
    };

    // Throttle scroll events for performance
    let ticking = false;

    const requestTick = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', requestTick);

    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.timeline-item, .color-swatch, .labs-logo, .backing-content, .bottom-section'
    );

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Ensure focus styles are visible
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Log successful initialization
    console.log('Poets of Robotics Brand Ecosystem initialized');
    console.log('Features loaded: Timeline interactions, Color picker, Robot animations, Parallax effects');
});