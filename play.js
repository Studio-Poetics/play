document.addEventListener('DOMContentLoaded', function() {
    // Mobile filter toggle functionality
    const filterToggle = document.getElementById('filterToggle');
    const filterTabs = document.getElementById('filterTabs');

    if (filterToggle && filterTabs) {
        filterToggle.addEventListener('click', () => {
            filterToggle.classList.toggle('active');
            filterTabs.classList.toggle('active');
        });
    }

    // Filter functionality
    const tabs = document.querySelectorAll('.tab');
    const projectCards = document.querySelectorAll('.project-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filter = tab.textContent.toLowerCase().trim();

            // Filter project cards
            projectCards.forEach(card => {
                const badge = card.querySelector('.project-badge');
                const category = badge.textContent.toLowerCase().trim();

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease-in';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        projectCards.forEach(card => {
            const projectName = card.querySelector('.project-logo span').textContent.toLowerCase();
            const badge = card.querySelector('.project-badge').textContent.toLowerCase();

            if (projectName.includes(searchTerm) || badge.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                card.style.display = 'none';
            }
        });

        // If search is cleared, show all cards based on current filter
        if (searchTerm === '') {
            const activeTab = document.querySelector('.tab.active');
            const filter = activeTab.textContent.toLowerCase().trim();

            projectCards.forEach(card => {
                const badge = card.querySelector('.project-badge');
                const category = badge.textContent.toLowerCase().trim();

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    });

    // Enhanced hover effects for project cards
    const cards = document.querySelectorAll('.project-card, .featured-project');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });

        // Add click effect
        card.addEventListener('mousedown', () => {
            card.style.transform = 'translateY(-2px) scale(0.98)';
        });

        card.addEventListener('mouseup', () => {
            card.style.transform = 'translateY(-4px) scale(1)';
        });
    });

    // Logo icon animation
    const logoIcon = document.querySelector('.logo-icon');
    let rotationAngle = 0;

    logoIcon.addEventListener('click', () => {
        rotationAngle += 360;
        logoIcon.style.transform = `rotate(${rotationAngle}deg)`;
        logoIcon.style.transition = 'transform 0.6s ease';
    });

    // Add click handlers for navigation and buttons
    const applyBtn = document.querySelector('.apply-btn');
    const ctaPrimary = document.querySelector('.cta-primary');
    const ctaSecondary = document.querySelector('.cta-secondary');
    const arrowBtns = document.querySelectorAll('.arrow-btn, .project-arrow');

    applyBtn.addEventListener('click', () => {
        console.log('Apply Now clicked');
        alert('Play application form would open here');
    });

    ctaPrimary.addEventListener('click', () => {
        console.log('Apply for Play Incubation clicked');
        alert('Play incubation application form would open here');
    });

    ctaSecondary.addEventListener('click', () => {
        console.log('Apply for Play Funding clicked');
        alert('Play funding application form would open here');
    });

    arrowBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.project-card, .featured-project');
            let projectName;

            if (card.classList.contains('featured-project')) {
                projectName = card.querySelector('.featured-logo').textContent;
            } else {
                projectName = card.querySelector('.project-logo span').textContent;
            }

            console.log(`View details for: ${projectName}`);
            alert(`Project details for ${projectName} would open here`);
        });
    });

    // Add navigation link handlers
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            const linkText = link.textContent;

            // Don't prevent default for actual navigation links
            if (href === '#') {
                e.preventDefault();
                console.log(`Navigation clicked: ${linkText}`);

                if (linkText.includes('Blog')) {
                    alert('Would navigate to play blog page');
                } else if (linkText.includes('Ecosystem')) {
                    alert('Would navigate to play ecosystem page');
                }
            }
        });
    });

    // Add pulse animation to featured project
    const featuredProject = document.querySelector('.featured-project');

    setInterval(() => {
        const badge = featuredProject.querySelector('.featured-badge');
        badge.style.animation = 'pulse 2s ease-in-out';

        setTimeout(() => {
            badge.style.animation = '';
        }, 2000);
    }, 8000);

    // Add stats counter animation on scroll
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValues = entry.target.querySelectorAll('.stat-value, .stat-row span');
                statValues.forEach((stat, index) => {
                    setTimeout(() => {
                        stat.style.animation = 'countUp 0.6s ease-out';
                    }, index * 100);
                });
            }
        });
    }, { threshold: 0.5 });

    // Observe featured project and project cards for stats animation
    const statsElements = document.querySelectorAll('.featured-project, .project-card');
    statsElements.forEach(element => {
        statsObserver.observe(element);
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes countUp {
            from { transform: scale(0.8); opacity: 0.5; }
            to { transform: scale(1); opacity: 1; }
        }

        .tab {
            position: relative;
            overflow: hidden;
        }

        .tab::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: #ff6b35;
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }

        .tab.active::after {
            width: 100%;
        }

        .project-card {
            position: relative;
            overflow: hidden;
        }

        .project-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.1), transparent);
            transition: left 0.6s ease;
        }

        .project-card:hover::before {
            left: 100%;
        }
    `;
    document.head.appendChild(style);

    // Initialize with all projects visible
    console.log('Poetics of Play Portfolio initialized successfully');
    console.log('Features: Filtering, Search, Animations, Interactive elements');
});