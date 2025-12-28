// Update (14.08.2024): this should fix the issue with "'TrustedHTML' assignment." bs whatever
// This was mainly for Chrome I'm pretty sure, Firefox has no issue & still works the same with or without this TrustedTypes stuff
if (window.trustedTypes && window.trustedTypes.createPolicy) {  
    window.trustedTypes.createPolicy('default', {  
        createHTML: (string, sink) => string  
    }); 
}

// Global vars
var currentPath = window.location.href;
var userConfig = JSON.parse(document.getElementById('playertube-config').innerHTML);
var ytVideo;
var tempInterval = setInterval(() => {
    if (document.querySelector('.video-stream.html5-main-video')) {
        ytVideo = document.querySelector('.video-stream.html5-main-video');
        clearInterval(tempInterval);
    }
}, 1000);
var pastWidth;
var pastVideoWidth;

// Add CSS fixes too
var CSSPatches = `
/* hi this is from the resize script to make sure everything runs well :) */
/* PlayerTube/src/resize.js */

.video-stream.html5-main-video {
    position: relative;
    margin: auto;
    width: 100% !important;
    height: 100% !important;
    left: 0 !important;
    top: 0 !important;
    object-fit: contain !important;
}
  
.html5-video-container {
    height: 100% !important;
}
`
document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-resize-patches" type="text/css">${CSSPatches}</style>`)

// Heartbeat
var checkBar = setInterval(() => {
    // Actual check
    if (
        document.querySelector('.html5-video-player')
        && !document.querySelector('.html5-video-player').classList.contains('ytp-fullscreen')
        && ytVideo
        && ytVideo.src.includes('blob')
    ) {
        // Get current progress bar width -- v2 (10.2025)
        // We'll now be getting all of the `ytp-chapter-hover-container` divs to check for width changes
        const allChapterHovers = document.querySelectorAll('.ytp-chapter-hover-container');
        var progressBarWidth = 0;
        allChapterHovers.forEach((elmnt) => progressBarWidth = progressBarWidth + elmnt.clientWidth + Number(elmnt.style.marginRight.replace('px', '')) + 1);
        // Actual width
        const videoWidth = Number(getVideoWidth());

        // Debug detection
        // console.log('resize debug detection (player):', progressBarWidth, pastWidth);
        // console.log('resize debug detection (video):', videoWidth, pastVideoWidth);
        // Detection... v2.1...
        if (
            progressBarWidth !== pastWidth
            || videoWidth !== pastVideoWidth
            || (
                progressBarWidth !== videoWidth
                && userConfig.year !== '2006'
            )
        ) {
            // Set pastWidth
            pastWidth = Number(progressBarWidth);
            pastVideoWidth = Number(videoWidth);

            // Go!
            console.log(`%cPlayerTube resize script: Detected big progress bar change! Fixing...`, styles2, `${progressBarWidth} !== ${videoWidth}`)
            fixBar();
        }
    }

    // Location check
    if (window.location.href !== currentPath) {
        setTimeout(() => {
            fixBar();
            currentPath = window.location.href;
        }, 2000);
    }
}, 200);

// Easy call to progress bar width
function getVideoWidth() {
    return document.querySelector('.html5-video-player').clientWidth;
}

function getOffset(year) {
    return new Promise((resolve, reject) => {
        var result;
        switch (year) {
            case '2006':
                // Check if the the player div exists
                let tempInt = setInterval(() => {
                    if (getVideoWidth()) {
                        result = (parseInt(getVideoWidth()) - 56 - document.querySelector('.ytp-right-controls').clientWidth);
                        resolve(result);
                        clearInterval(tempInt);
                    }
                }, 100);
            break;

            default:
                result = 24;
                resolve(result);
            break;
        }
    });
}

// Get fixed width for user's theme
async function getFixedWidth() {
    // Get actual current player width
    let videoWidth = parseInt(getVideoWidth());
    switch (userConfig.year) {
        case '2006':
            // Since 2006 is in the middle of the player, we gotta do more.
            result = await getOffset(userConfig.year);
        break;

        default:
            result = videoWidth + await getOffset(userConfig.year);
        break;
    }

    // Dev
    // console.log(`getFixedWidth: `, result);
    return result;
}


// Main function
// Fix progress bar
async function fixBar() {
    // Define stuff
    const playerWidth = await getFixedWidth();

    // Set width that needs to be set
    const width = playerWidth;
    const height = document.getElementById('movie_player').clientHeight;

    // Use YouTube function to change width
    document.getElementById('movie_player').setInternalSize(width, height);
    document.querySelector('.ytp-progress-bar-container').style.width = `${width - 24}px`;
    console.log(`%cPlayerTube resize script: Successfully changed player size!`, styles2, {"width": width, "height": height})
}

// Initial
fixBar();


// Console cool stuff
var styles2 = [
    'background: linear-gradient(#0629d3, #022c57)'
    , 'border: 5px solid rgb(255 255 255 / 10%)'
    , 'color: white'
    , 'display: block'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
].join(';');
