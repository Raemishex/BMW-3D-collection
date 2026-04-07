// Shared Utilities

// Global variables
const M3_TARGET_DATE = new Date('2026-12-31T00:00:00');

// Throttle function for scroll and resize
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function
const debounce = (func, wait = 10, immediate = true) => {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const initCounters = () => {
    const counters = document.querySelectorAll('.counter');

    const startCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const decimals = +counter.getAttribute('data-decimals') || 0;
        const duration = 2000; // 2 seconds
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease out function: fast start, slow finish
            const easedPercentage = 1 - Math.pow(1 - percentage, 3);

            const currentCount = easedPercentage * target;
            counter.innerText = currentCount.toFixed(decimals);

            if (percentage < 1) {
                requestAnimationFrame(animate);
            } else {
                counter.innerText = target.toFixed(decimals);
                counter.classList.add('pulse-animation');
            }
        };
        requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
};

const initPageTransitions = () => {
    // Prevent multiple overlays
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);
    }

    // Slide up on load
    window.addEventListener('load', () => {
        setTimeout(() => {
            overlay.classList.add('loaded');
            document.body.classList.add('fade-in');
        }, 300);
    });

    const handleNavigation = (href) => {
        overlay.classList.remove('loaded');
        overlay.classList.add('active');
        setTimeout(() => {
            window.location.href = href;
        }, 800);
    };

    // Handle navigation
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if it's not a local page link
            if (!href || href.startsWith('#') || href.startsWith('javascript:') || link.target === '_blank') {
                return;
            }

            e.preventDefault();
            handleNavigation(href);
        });
    });

    // Handle car cards
    document.querySelectorAll('.car-card').forEach(card => {
        const isLocked = card.classList.contains('car-card--locked');
        if (isLocked) return;

        // Try to find if there's an onclick attribute that redirects
        const originalOnClick = card.getAttribute('onclick');
        let targetHref = null;

        if (originalOnClick && originalOnClick.includes('window.location.href')) {
            targetHref = originalOnClick.match(/'([^']+)'/)[1];
            card.removeAttribute('onclick'); // Important to prevent double execution
        }

        if (targetHref) {
            card.addEventListener('click', (e) => {
                handleNavigation(targetHref);
            });
        }
    });
};

const initCustomCursor = () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animateCursor = () => {
        const lerp = 0.15;
        cursorX += (mouseX - cursorX) * lerp;
        cursorY += (mouseY - cursorY) * lerp;

        cursorOutline.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const updateInteractiveElements = () => {
        const interactiveElements = document.querySelectorAll('a, button, .car-card, .gallery-item, .explore-btn, #notify-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hover');
            });
        });
    };
    updateInteractiveElements();
};

const initAudioController = () => {
    let audio = document.getElementById('bg-music') || document.querySelector('.car-audio');

    // If no audio element, inject a default one (for gallery/specs subpages)
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'bg-music';
        audio.loop = true;
        const source = document.createElement('source');
        source.src = 'music/Never let go of me - Baltra [Slowed_Tiktok] - RoseSenpai.mp3';
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        document.body.appendChild(audio);
    }

    if (document.querySelector('.audio-controller')) return;

    const controller = document.createElement('div');
    controller.className = 'audio-controller';

    const trackName = audio.querySelector('source')?.src.split('/').pop().replace(/%20/g, ' ').split('.')[0] || "BMW M Series";

    controller.innerHTML = `
        <div class="waveform paused">
            <span></span><span></span><span></span><span></span>
        </div>
        <div class="track-info">${trackName}</div>
        <button class="play-toggle">
            <i class="fas fa-play"></i>
        </button>
    `;

    document.body.appendChild(controller);

    const toggleBtn = controller.querySelector('.play-toggle');
    const waveform = controller.querySelector('.waveform');
    const icon = toggleBtn.querySelector('i');

    const updateUI = () => {
        if (audio.paused) {
            icon.className = 'fas fa-play';
            waveform.classList.add('paused');
        } else {
            icon.className = 'fas fa-pause';
            waveform.classList.remove('paused');
        }
    };

    const togglePlay = () => {
        if (audio.paused) {
            audio.play();
            sessionStorage.setItem('audioPaused', 'false');
        } else {
            audio.pause();
            sessionStorage.setItem('audioPaused', 'true');
        }
        updateUI();
    };

    toggleBtn.addEventListener('click', togglePlay);

    const isPaused = sessionStorage.getItem('audioPaused') === 'true';
    if (!isPaused) {
        audio.play().then(updateUI).catch(() => {
            document.addEventListener('click', () => {
                if (sessionStorage.getItem('audioPaused') !== 'true') {
                    audio.play().then(updateUI);
                }
            }, { once: true });
        });
    } else {
        audio.pause();
        updateUI();
    }

    audio.volume = 0;
    const fadeAudio = (target) => {
        const step = 0.05;
        const interval = 50;
        const fader = setInterval(() => {
            if (target > audio.volume) {
                audio.volume = Math.min(audio.volume + step, target);
            } else {
                audio.volume = Math.max(audio.volume - step, target);
            }
            if (audio.volume === target) clearInterval(fader);
        }, interval);
    };

    if (!isPaused) fadeAudio(0.5);

    audio.addEventListener('play', () => fadeAudio(0.5));
    audio.addEventListener('pause', () => fadeAudio(0));
};

const initLightbox = () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0 || document.querySelector('.lightbox')) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close"><i class="fas fa-times"></i></span>
            <img src="" alt="" class="lightbox-img">
            <div class="lightbox-counter">1 / 1</div>
        </div>
        <div class="lightbox-nav">
            <div class="lightbox-arrow prev"><i class="fas fa-chevron-left"></i></div>
            <div class="lightbox-arrow next"><i class="fas fa-chevron-right"></i></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.prev');
    const nextBtn = lightbox.querySelector('.next');

    let currentIndex = 0;
    const images = Array.from(galleryItems).map(item => item.querySelector('img').src);

    const openLightbox = (index) => {
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightboxCounter.innerText = `${currentIndex + 1} / ${images.length}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    const showNext = () => {
        currentIndex = (currentIndex + 1) % images.length;
        openLightbox(currentIndex);
    };

    const showPrev = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        openLightbox(currentIndex);
    };

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) showNext();
        if (touchEndX - touchStartX > 50) showPrev();
    });
};

const initCountdown = () => {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = M3_TARGET_DATE.getTime() - now;

        if (distance < 0) {
            countdownEl.innerText = "LAUNCHED";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minsEl = document.getElementById('minutes');
        const secsEl = document.getElementById('seconds');

        if (daysEl) {
            daysEl.innerText = days.toString().padStart(2, '0');
            hoursEl.innerText = hours.toString().padStart(2, '0');
            minsEl.innerText = minutes.toString().padStart(2, '0');
            secsEl.innerText = seconds.toString().padStart(2, '0');
        }
    };

    setInterval(updateCountdown, 1000);
    updateCountdown();

    const notifyBtn = document.getElementById('notify-btn');
    const notifyEmail = document.getElementById('notify-email');

    if (notifyBtn && notifyEmail) {
        notifyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const email = notifyEmail.value;
            if (email && email.includes('@')) {
                localStorage.setItem('notified_email', email);
                notifyBtn.innerText = 'THANKS!';
                notifyBtn.disabled = true;
                notifyEmail.style.display = 'none';
            }
        });

        if (localStorage.getItem('notified_email')) {
            notifyBtn.innerText = 'THANKS!';
            notifyBtn.disabled = true;
            notifyEmail.style.display = 'none';
        }
    }
};

const initMobileMenu = () => {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    });
};

const initCardHoverSounds = () => {
    const carCards = document.querySelectorAll('.car-card:not(.car-card--locked)');
    carCards.forEach(card => {
        const audio = card.querySelector('audio');
        if (audio) {
            audio.volume = 0.3;
            card.addEventListener('mouseenter', () => {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            });
            card.addEventListener('mouseleave', () => {
                audio.pause();
                audio.currentTime = 0;
            });
        }
    });
};

const initShared = () => {
    // Staggered entrance for model names
    document.querySelectorAll('.model-name, .landing-title').forEach(el => {
        const text = el.innerText.trim();
        el.innerHTML = '';
        text.split(/\s+/).forEach((word, i, arr) => {
            const span = document.createElement('span');
            span.className = 'word';
            // Use non-breaking space for the space between words to keep them in one piece
            span.textContent = word + (i < arr.length - 1 ? '\u00A0' : '');
            span.style.display = 'inline-block';
            span.style.animationDelay = `${0.2 + (i * 0.15)}s`;
            el.appendChild(span);
        });
    });

    initCounters();
    initPageTransitions();
    initCustomCursor();
    initAudioController();
    initLightbox();
    initMobileMenu();
    initCountdown();
    initCardHoverSounds();

    // Smooth scroll reveal
    const reveal = () => {
        const reveals = document.querySelectorAll('.reveal, .stagger-item');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 100;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
                if (el.classList.contains('stagger-item')) {
                    el.style.opacity = '1';
                }
            }
        });
    };

    window.addEventListener('scroll', throttle(reveal, 100));
    window.addEventListener('resize', debounce(() => {
        // Redraw cursor or recalibrate elements if needed
    }, 250));

    reveal(); // Initial check
};

document.addEventListener('DOMContentLoaded', initShared);
