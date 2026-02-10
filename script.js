/* script.js - Seamless Background Video Logic */

document.addEventListener('DOMContentLoaded', () => {
    
    const carData = {
        name: "M4 CSL",
        subtitle: "Competition Sport Lightweight",
        files: [
            "images/BMW-M4-CSL-1.mp4",
            "images/BMW-M4-CSL-2.mp4",
            "images/BMW-M4-CSL-3.mp4",
            "images/BMW-M4-CSL-4.mp4",
            "images/BMW-M4-CSL-5.mp4",
            "images/BMW-M4-CSL-6.mp4",
            "images/BMW-M4-CSL-7.mp4"
        ]
    };

    const videoContainer = document.getElementById('video-container');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!videoContainer || !prevBtn || !nextBtn) return; 

    let currentIndex = 0;
    let videoElements = [];

    function initVideos() {
        videoContainer.innerHTML = ''; 
        videoElements = [];

        carData.files.forEach((file, index) => {
            const vid = document.createElement('video');
            vid.src = file;
            vid.className = 'bg-video';
            vid.muted = true; 
            vid.playsInline = true;
            vid.preload = 'auto'; 
            
            if (index === 0) {
                vid.classList.add('active');
                vid.play().catch(e => console.log("Autoplay blocked:", e));
            }

            videoContainer.appendChild(vid);
            videoElements.push(vid);
        });
    }

    initVideos();

    function switchVideo(newIndex) {
        if (newIndex === currentIndex) return;

        const currentVideo = videoElements[currentIndex];
        const nextVideo = videoElements[newIndex];

        nextVideo.currentTime = 0; 
        nextVideo.play().then(() => {
            nextVideo.classList.add('active');
            currentVideo.classList.remove('active');

            setTimeout(() => {
                currentVideo.pause();
                currentVideo.currentTime = 0;
            }, 800); 
        }).catch(e => console.error("Play error:", e));

        currentIndex = newIndex;
    }

    nextBtn.addEventListener('click', () => {
        const newIndex = (currentIndex + 1) % carData.files.length;
        switchVideo(newIndex);
    });

    prevBtn.addEventListener('click', () => {
        const newIndex = (currentIndex - 1 + carData.files.length) % carData.files.length;
        switchVideo(newIndex);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextBtn.click();
        } else if (e.key === 'ArrowLeft') {
            prevBtn.click();
        }
    });

    let isThrottled = false;
    window.addEventListener('wheel', (e) => {
        if (isThrottled) return;
        
        if (e.deltaY > 0) {
            nextBtn.click();
        } else {
            prevBtn.click();
        }

        isThrottled = true;
    });

    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        const savedTime = localStorage.getItem('bgMusicTime');
        if (savedTime) {
            bgMusic.currentTime = parseFloat(savedTime);
        }
        
        bgMusic.volume = 0.5;
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay blocked. Waiting for user interaction.");
                const startMusic = () => {
                    bgMusic.play();
                    document.removeEventListener('click', startMusic);
                    document.removeEventListener('keydown', startMusic);
                };
                document.addEventListener('click', startMusic);
                document.addEventListener('keydown', startMusic);
            });
        }

        setInterval(() => {
            if (!bgMusic.paused) {
                localStorage.setItem('bgMusicTime', bgMusic.currentTime);
            }
        }, 1000);
    }
});


const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });
}

const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(0,0,0,0.95)';
            navLinks.style.padding = '2rem';
            navLinks.style.zIndex = '1000';
        }
    });
}

const carCards = document.querySelectorAll('.car-card');

if (carCards.length > 0) {
    carCards.forEach(card => {
        const audio = card.querySelector('audio');
        
        if (audio) {
            audio.volume = 0.5; 

            card.addEventListener('mouseenter', () => {
                audio.currentTime = 0;
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Audio play prevented:", error);
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                audio.pause();
                audio.currentTime = 0;
            });
        }
    });
}


document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
