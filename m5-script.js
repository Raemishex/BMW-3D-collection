/* m5-script.js - Car Specific Logic (M5 F90) */

document.addEventListener('DOMContentLoaded', () => {
    
    const carData = {
        name: "M5 F90",
        subtitle: "Competition",
        files: [
            "images/BMW-M5-F90-1.mp4",
            "images/BMW-M5-F90-2.mp4",
            "images/BMW-M5-F90-3.mp4",
            "images/BMW-M5-F90-4.mp4",
            "images/BMW-M5-F90-5.mp4",
            "images/BMW-M5-F90-6.mp4",
            "images/BMW-M5-F90-7.mp4",
            "images/BMW-M5-F90-8.mp4",
            "images/BMW-M5-F90-9.mp4",
            "images/BMW-M5-F90-10.mp4",
            "images/BMW-M5-F90-11.mp4"
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

    // Throttled Scroll for video switching
    let isThrottled = false;
    window.addEventListener('wheel', (e) => {
        if (isThrottled) return;
        
        if (e.deltaY > 0) {
            nextBtn.click();
        } else {
            prevBtn.click();
        }

        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, 1000);
    });
});
