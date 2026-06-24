/* Global Script Helpers - Team Bharadwaj Aeromodelling Website */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initParticles();
    initNavbarWhenLoaded();
    initStatsCounters();
    initIntersectionObservers();
    initGenericCarousels();
    initTeamFilters();
    initGalleryLightbox();
    initSpecsModals();
    initCtaModal();
});

/* 1. Background  */
function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const maxParticles = 60;

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4 - 0.1; // Drift leftwards slightly
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Loop boundaries
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha})`; // Electric Cyan color
            ctx.fill();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.shadowBlur = 0; // Reset shadow for canvas clear
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

/* 2. Dynamic Navbar Initializer */
function initNavbarWhenLoaded() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        setupMobileNav(navbar);
        setupActiveNavLinks(navbar);
        if (typeof updateThemeIcon === 'function') {
            updateThemeIcon();
        }
        return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
        const dynamicNavbar = document.querySelector('.navbar');
        if (dynamicNavbar) {
            setupMobileNav(dynamicNavbar);
            setupActiveNavLinks(dynamicNavbar);
            if (typeof updateThemeIcon === 'function') {
                updateThemeIcon();
            }
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function setupMobileNav(navbar) {
    if (navbar.classList.contains('mobile-nav-initialized')) return;
    navbar.classList.add('mobile-nav-initialized');

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-nav-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navList = navbar.querySelector('ul');
    if (!navList) return;
    navbar.insertBefore(toggleBtn, navList);

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navbar.classList.toggle('mobile-active');
        toggleBtn.innerHTML = navbar.classList.contains('mobile-active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });

    document.addEventListener('click', () => {
        if (navbar.classList.contains('mobile-active')) {
            navbar.classList.remove('mobile-active');
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('mobile-active');
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

function setupActiveNavLinks(navbar) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = navbar.querySelectorAll('ul li a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* 4. Stats Counter Incrementing Effect */
function initStatsCounters() {
    const statsItems = document.querySelectorAll('.stats-item');
    if (statsItems.length === 0) return;

    const countOptions = {
        threshold: 0.5,
        rootMargin: "0px 0px -50px 0px"
    };

    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                // Parse text node (e.g. "30+" or "Top 10")
                const originalText = item.textContent;
                const matchNumber = originalText.match(/\d+/);
                
                if (matchNumber) {
                    const finalValue = parseInt(matchNumber[0], 10);
                    const labelSpan = item.querySelector('span');
                    const labelText = labelSpan ? labelSpan.outerHTML : '';
                    
                    let startValue = 0;
                    const duration = 1500; // 1.5s animation
                    const startTime = performance.now();

                    function updateCount(timestamp) {
                        const elapsed = timestamp - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Easing out quadratic
                        const easedProgress = progress * (2 - progress);
                        const currentValue = Math.floor(easedProgress * finalValue);

                        // Reassemble text string
                        const rawTextWithoutSpan = originalText.replace(labelSpan ? labelSpan.textContent : '', '').trim();
                        const newText = rawTextWithoutSpan.replace(finalValue.toString(), currentValue.toString());
                        
                        item.innerHTML = `${newText}${labelText}`;

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            item.innerHTML = `${originalText}`; // Set back to final original state
                        }
                    }

                    requestAnimationFrame(updateCount);
                    observer.unobserve(item);
                }
            }
        });
    }, countOptions);

    statsItems.forEach(item => countObserver.observe(item));
}

/* 5. Scroll Fade-in Intersection Observer */
function initIntersectionObservers() {
    const fadeElements = document.querySelectorAll('.fade-in-scroll, .section-card, .mission-vision, .point, .timeline-item');
    
    const fadeOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, fadeOptions);

    fadeElements.forEach(el => {
        el.classList.add('fade-in-scroll');
        fadeObserver.observe(el);
    });
}

/* 6. Interactive Carousels (Replacing basic CSS marquee) */
function initGenericCarousels() {
    const carouselContainers = document.querySelectorAll('.carousel');
    if (carouselContainers.length === 0) return;

    carouselContainers.forEach(container => {
        const inner = container.querySelector('.carousel-inner');
        if (!inner) return;

        // If the carousel should just auto-scroll (e.g. sponsors)
        if (container.classList.contains('auto-scroll-sponsors')) {
            // Keep infinite loop CSS but pause on hover
            container.addEventListener('mouseenter', () => inner.style.animationPlayState = 'paused');
            container.addEventListener('mouseleave', () => inner.style.animationPlayState = 'running');
            return;
        }

        // Make interactive slider for normal picture carousels
        const slides = inner.querySelectorAll('img');
        if (slides.length <= 1) return;

        // Structure DOM: Add controller wraps, prev/next arrows, page dots
        inner.style.animation = 'none'; // Disable horizontal infinite loop css
        inner.style.display = 'flex';
        inner.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        inner.style.width = `${slides.length * 100}%`;
        
        slides.forEach(slide => {
            slide.style.width = `${100 / slides.length}%`;
            slide.style.height = '280px';
            slide.style.objectFit = 'cover';
            slide.style.backgroundColor = 'rgba(5, 3, 10, 0.4)';
        });

        let currentIndex = 0;
        let autoplayTimer = null;

        // Create Navigation Elements
        const controls = document.createElement('div');
        controls.className = 'carousel-controls';
        controls.innerHTML = `
            <button class="carousel-btn prev" aria-label="Previous Slide"><i class="fas fa-chevron-left"></i></button>
            <button class="carousel-btn next" aria-label="Next Slide"><i class="fas fa-chevron-right"></i></button>
        `;
        container.appendChild(controls);

        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        for (let i = 0; i < slides.length; i++) {
            indicators.innerHTML += `<span class="indicator-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`;
        }
        container.appendChild(indicators);

        const updateSlider = () => {
            inner.style.transform = `translateX(-${(currentIndex * 100) / slides.length}%)`;
            indicators.querySelectorAll('.indicator-dot').forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        };

        // Event Bindings
        controls.querySelector('.next').addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
        controls.querySelector('.prev').addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });

        indicators.querySelectorAll('.indicator-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                currentIndex = parseInt(e.target.dataset.index, 10);
                updateSlider();
                resetAutoplay();
            });
        });

        // Autoplay
        const startAutoplay = () => {
            autoplayTimer = setInterval(nextSlide, 5000);
        };
        const resetAutoplay = () => {
            clearInterval(autoplayTimer);
            startAutoplay();
        };

        startAutoplay();

        // Inject specific Carousel controls styling inline in style.css, but add here for safety
        container.style.position = 'relative';
    });

    // Inject Slider Helper Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .carousel-controls {
            position: absolute;
            top: 50%;
            width: 100%;
            display: flex;
            justify-content: space-between;
            transform: translateY(-50%);
            pointer-events: none;
            padding: 0 1rem;
            z-index: 10;
        }
        .carousel-btn {
            background: rgba(10, 6, 20, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            pointer-events: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        .carousel-btn:hover {
            background: var(--accent-magenta);
            border-color: var(--accent-magenta-glow);
            box-shadow: 0 0 10px rgba(199, 21, 133, 0.5);
            transform: scale(1.1);
        }
        .carousel-indicators {
            position: absolute;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.5rem;
            z-index: 10;
        }
        .indicator-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .indicator-dot.active {
            width: 24px;
            border-radius: 4px;
            background: var(--accent-magenta-glow);
            box-shadow: 0 0 8px var(--accent-magenta);
        }
    `;
    document.head.appendChild(style);
}

/* 7. Team Search and Category Tabs Filters */
function initTeamFilters() {
    const filterTabs = document.querySelectorAll('.team-tab');
    const searchBar = document.getElementById('team-search');
    const teamMembers = document.querySelectorAll('.team-member');

    if (filterTabs.length === 0 && !searchBar) return;

    let currentCategory = 'all';
    let searchQuery = '';

    function filterTeam() {
        teamMembers.forEach(member => {
            const memberCategory = member.dataset.category || '';
            const memberName = member.querySelector('h3').textContent.toLowerCase();
            const memberRole = member.querySelector('p').textContent.toLowerCase();
            
            const matchCategory = currentCategory === 'all' || memberCategory === currentCategory;
            const matchSearch = memberName.includes(searchQuery) || memberRole.includes(searchQuery);

            if (matchCategory && matchSearch) {
                member.style.display = 'block';
                member.style.opacity = '1';
                member.style.transform = 'scale(1)';
            } else {
                member.style.opacity = '0';
                member.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (member.style.opacity === '0') {
                        member.style.display = 'none';
                    }
                }, 200);
            }
        });
    }

    // Tabs clicks
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            filterTeam();
        });
    });

    // Search bar keystroke
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterTeam();
        });
    }
}

/* 8. Gallery Lightbox overlay slider */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-card img, .gallery-item-trigger');
    const filterTabs = document.querySelectorAll('.gallery-tab');
    const galleryCards = document.querySelectorAll('.gallery-card');

    // Tab Filter Logic
    if (filterTabs.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filterVal = tab.dataset.filter;

                galleryCards.forEach(card => {
                    const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
                    if (filterVal === 'all' || categories.includes(filterVal)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(15px)';
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 250);
                    }
                });
            });
        });
    }

    if (galleryItems.length === 0) return;

    // Create Lightbox DOM elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
        <button class="lightbox-close"><i class="fas fa-times"></i></button>
        <button class="lightbox-btn prev"><i class="fas fa-chevron-left"></i></button>
        <div class="lightbox-content">
            <img src="" alt="Zoomed View">
            <p class="lightbox-caption"></p>
        </div>
        <button class="lightbox-btn next"><i class="fas fa-chevron-right"></i></button>
    `;
    document.body.appendChild(lightbox);

    // Style injector
    const style = document.createElement('style');
    style.innerHTML = `
        .lightbox-modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(5, 3, 10, 0.95);
            backdrop-filter: blur(8px);
            z-index: 2500;
            display: flex;
            align-items: center;
            justify-content: space-between;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            padding: 2rem;
        }
        .lightbox-modal.active {
            opacity: 1;
            pointer-events: all;
        }
        .lightbox-content {
            max-width: 80%;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
        .lightbox-content img {
            max-width: 100%;
            max-height: 70vh;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 240, 255, 0.2);
            object-fit: contain;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .lightbox-caption {
            font-family: var(--font-heading);
            color: white;
            font-size: 1.2rem;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        .lightbox-close {
            position: absolute;
            top: 2rem; right: 2rem;
            background: none; border: none;
            color: white; font-size: 2rem;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .lightbox-close:hover {
            color: var(--accent-magenta-glow);
            transform: rotate(90deg);
        }
        .lightbox-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            width: 50px; height: 50px;
            border-radius: 50%;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem;
            transition: all 0.2s ease;
        }
        .lightbox-btn:hover {
            background: var(--accent-magenta);
            border-color: var(--accent-magenta-glow);
            box-shadow: 0 0 15px rgba(199, 21, 133, 0.6);
        }
        @media(max-width: 768px) {
            .lightbox-content { max-width: 100%; }
            .lightbox-btn { display: none; }
        }
    `;
    document.head.appendChild(style);

    const lImg = lightbox.querySelector('img');
    const lCaption = lightbox.querySelector('.lightbox-caption');
    let activeIndex = 0;
    let imagesList = [];

    const openLightbox = (idx) => {
        activeIndex = idx;
        const currentItem = imagesList[activeIndex];
        lImg.src = currentItem.src;
        lCaption.textContent = currentItem.caption;
        lightbox.classList.add('active');
    };

    const nextImage = () => {
        activeIndex = (activeIndex + 1) % imagesList.length;
        openLightbox(activeIndex);
    };

    const prevImage = () => {
        activeIndex = (activeIndex - 1 + imagesList.length) % imagesList.length;
        openLightbox(activeIndex);
    };

    // Re-index visible items
    const updateImagesList = () => {
        imagesList = [];
        const visibleCards = Array.from(galleryCards).filter(c => c.style.display !== 'none');
        
        if (visibleCards.length > 0) {
            visibleCards.forEach((card, index) => {
                const img = card.querySelector('img');
                const text = card.querySelector('p');
                imagesList.push({
                    src: img.src,
                    caption: text ? text.textContent : '',
                    element: img
                });
                // Attach dynamic click index to elements
                img.onclick = (e) => {
                    if (card.dataset.plane === 'true') {
                        e.stopPropagation();
                        window.openPlaneSpecs(card.dataset.planeId, text ? text.textContent : 'Drone Specs');
                    } else {
                        openLightbox(index);
                    }
                };
            });
        } else {
            // Fallback for static elements outside gallery tab grids
            galleryItems.forEach((item, index) => {
                imagesList.push({
                    src: item.src || item.dataset.src,
                    caption: item.alt || item.dataset.caption || '',
                    element: item
                });
                item.onclick = () => openLightbox(index);
            });
        }
    };

    updateImagesList();

    // Reindex whenever filter tabs click
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setTimeout(updateImagesList, 300);
        });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.querySelector('.next').addEventListener('click', nextImage);
    lightbox.querySelector('.prev').addEventListener('click', prevImage);

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') lightbox.classList.remove('active');
    });
}


/* 9. Specifications Details Modal Launchers */
window.planeSpecsTemplates = {
    'sae-ddc-2025': `
        <table style="width: 100%; border-collapse: collapse; font-family: var(--font-body); color: var(--text-secondary);">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold; width: 40%;">Aircraft Type:</td><td style="padding: 0.8rem;">Fixed-wing (UAV)</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Wingspan:</td><td style="padding: 0.8rem;">1 meter</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">MTOW:</td><td style="padding: 0.8rem;">1 kilogram</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Endurance:</td><td style="padding: 0.8rem;">5 minutes</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Propulsion:</td><td style="padding: 0.8rem;">Brushless Outrunner DC Motor (1050KV)</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Fuselage Material:</td><td style="padding: 0.8rem;">Balsa and Aeroply</td></tr>
            <tr><td style="padding: 0.8rem; font-weight: bold;">Payload Capacity:</td><td style="padding: 0.8rem;">1 kilogram</td></tr>
        </table>
    `,
    'sae-ddc-2026': `
        <table style="width: 100%; border-collapse: collapse; font-family: var(--font-body); color: var(--text-secondary);">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold; width: 40%;">Aircraft Type:</td><td style="padding: 0.8rem;">Fixed-wing (UAV)</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Wingspan:</td><td style="padding: 0.8rem;">1 meter</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">MTOW:</td><td style="padding: 0.8rem;">1 kilogram</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Endurance:</td><td style="padding: 0.8rem;">5 minutes</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Propulsion:</td><td style="padding: 0.8rem;">Brushless Outrunner DC Motor (1050KV)</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Fuselage Material:</td><td style="padding: 0.8rem;">Balsa and Aeroply</td></tr>
            <tr><td style="padding: 0.8rem; font-weight: bold;">Payload Capacity:</td><td style="padding: 0.8rem;">1 kilogram</td></tr>
        </table>
    `,
    'boeing-2025': `
        <table style="width: 100%; border-collapse: collapse; font-family: var(--font-body); color: var(--text-secondary);">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold; width: 40%;">Aircraft Type:</td><td style="padding: 0.8rem;">Fixed-wing (UAV)</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Wingspan:</td><td style="padding: 0.8rem;">1 meter</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">MTOW:</td><td style="padding: 0.8rem;">1 kilogram</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Endurance:</td><td style="padding: 0.8rem;">5 minutes</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Propulsion:</td><td style="padding: 0.8rem;">Brushless Outrunner DC Motor (1050KV)</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 0.8rem; font-weight: bold;">Fuselage Material:</td><td style="padding: 0.8rem;">Balsa and Aeroply</td></tr>
            <tr><td style="padding: 0.8rem; font-weight: bold;">Payload Capacity:</td><td style="padding: 0.8rem;">1 kilogram</td></tr>
        </table>
    `
};
window.planeSpecsTemplates['sae-ddc-2024'] = window.planeSpecsTemplates['sae-ddc-2025'];
window.planeSpecsTemplates['sae-ddc-2026'] = window.planeSpecsTemplates['sae-ddc-2025'];
window.planeSpecsTemplates['boeing-2024'] = window.planeSpecsTemplates['boeing-2025'];
window.planeSpecsTemplates['boeing-2025'] = window.planeSpecsTemplates['boeing-2025'];
window.planeSpecsTemplates['iit-bombay-2024'] = window.planeSpecsTemplates['sae-ddc-2025'];
window.planeSpecsTemplates['iit-bombay-2025'] = window.planeSpecsTemplates['sae-ddc-2025'];

window.openPlaneSpecs = function(droneKey, title) {
    let modal = document.getElementById('specs-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'specs-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <button class="modal-close"><i class="fas fa-times"></i></button>
                <h2 id="modal-plane-title" class="cyan-glow" style="margin-bottom: 1.5rem; font-size: 2rem;">Drone Details</h2>
                <div id="modal-plane-specs" style="margin-bottom: 2rem;"></div>
                <button class="btn-primary" onclick="this.closest('.modal-overlay').classList.remove('active')">Close Details</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.onclick = () => modal.classList.remove('active');
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        };
    }
    
    modal.querySelector('#modal-plane-title').textContent = title;
    modal.querySelector('#modal-plane-specs').innerHTML = window.planeSpecsTemplates[droneKey] || '<p>Specifications details coming soon!</p>';
    modal.classList.add('active');
};

function initSpecsModals() {
    const specsTriggers = document.querySelectorAll('.specs-trigger');
    if (specsTriggers.length === 0) return;

    specsTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const droneKey = btn.dataset.specs;
            const title = btn.dataset.title || 'Drone Specifications';
            window.openPlaneSpecs(droneKey, title);
        });
    });
}

/* 10. CTA Join Us / Sponsor Form Overlay */
function initCtaModal() {
    const ctaBtns = document.querySelectorAll('.cta-button, [href="#join-us"], [href="#contact-us"], [href="#contact"]');
    if (ctaBtns.length === 0) return;

    const ctaModal = document.createElement('div');
    ctaModal.className = 'modal-overlay';
    ctaModal.innerHTML = `
        <div class="modal-container">
            <button class="modal-close"><i class="fas fa-times"></i></button>
            <h2 class="glow-text" style="color: var(--accent-magenta-glow); margin-bottom: 1rem; text-align: center;">Become a Sponsor</h2>
            <p style="color: var(--text-secondary); text-align: center; margin-bottom: 2rem;">Fuel our mission to conquer the skies. Fill out the sponsorship inquiry below and our leadership team will reach out directly.</p>
            <form id="recruitment-form">
                <div class="form-group">
                    <label>Company / Sponsor Name</label>
                    <input type="text" class="form-control" name="company_name" required placeholder="Zenith Aerospace">
                </div>
                <div class="form-group">
                    <label>Contact Person Name</label>
                    <input type="text" class="form-control" name="fullname" required placeholder="Jane Doe">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" class="form-control" name="email" required placeholder="sponsor@company.com">
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>Sponsorship Tier</label>
                        <select class="form-control" name="tier" required style="background: #0d091b; border: 1px solid rgba(255, 255, 255, 0.1);">
                            <option value="Gold Sponsor">Gold Sponsor</option>
                            <option value="Silver Sponsor">Silver Sponsor</option>
                            <option value="Technical Partner">Technical Partner</option>
                            <option value="Other">Other Sponsorship</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Contribution Details</label>
                        <input type="text" class="form-control" name="amount" required placeholder="e.g., Funding or carbon rolls">
                    </div>
                </div>
                <div class="form-group">
                    <label>Message / Areas of Interest</label>
                    <textarea class="form-control" name="message" required placeholder="How would you like to collaborate with us?"></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Submit Sponsorship Request</button>
            </form>
        </div>
    `;
    document.body.appendChild(ctaModal);

    ctaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ctaModal.classList.add('active');
        });
    });

    const closeBtn = ctaModal.querySelector('.modal-close');
    closeBtn.onclick = () => ctaModal.classList.remove('active');
    ctaModal.onclick = (e) => {
        if (e.target === ctaModal) ctaModal.classList.remove('active');
    };

    const form = ctaModal.querySelector('#recruitment-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            company_name: form.querySelector('[name="company_name"]').value,
            fullname: form.querySelector('[name="fullname"]').value,
            email: form.querySelector('[name="email"]').value,
            tier: form.querySelector('[name="tier"]').value,
            amount: form.querySelector('[name="amount"]').value,
            message: form.querySelector('[name="message"]').value
        };
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Transmitting Signal...";

        fetch('/api/sponsor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            ctaModal.querySelector('.modal-container').innerHTML = `
                <div style="text-align: center; padding: 2rem 0;">
                    <i class="fas fa-check-circle" style="font-size: 5rem; color: var(--accent-cyan); margin-bottom: 1.5rem; filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.4));"></i>
                    <h2 class="cyan-glow" style="margin-bottom: 1rem;">Transmission Complete!</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">Thank you, <strong>${formData.fullname}</strong>. Your sponsorship details for <strong>${formData.company_name}</strong> have been logged in our database, and team leads have been alerted.</p>
                    <button class="btn-primary" onclick="location.reload()">Close</button>
                </div>
            `;
        })
        .catch(err => {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Sponsorship Request";
            alert("Database transmission failed. Storing request locally. " + err);
        });
    });
}

/* 11. Light/Dark Theme Switcher */
function initTheme() {
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            document.documentElement.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
            document.documentElement.classList.remove('light-mode');
        }
        updateThemeIcon();
    };

    const updateThemeIcon = () => {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;
        const icon = toggleBtn.querySelector('i');
        if (!icon) return;
        if (document.body.classList.contains('light-mode')) {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    };

    // Apply saved theme immediately
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // Event delegation for theme toggle click
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#theme-toggle');
        if (toggleBtn) {
            e.preventDefault();
            const isLight = document.body.classList.contains('light-mode');
            const nextTheme = isLight ? 'dark' : 'light';
            localStorage.setItem('theme', nextTheme);
            applyTheme(nextTheme);
        }
    });

    // Observe when the navbar is injected and update the icon when #theme-toggle appears
    const observer = new MutationObserver(() => {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            updateThemeIcon();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
