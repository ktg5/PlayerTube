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
    if (document.getElementById('movie_player') && ytVideo && ytVideo.src.includes('blob')) {
        // Get current progress bar width
        var completeWidth = document.querySelector('.ytp-chapters-container').clientWidth;
        // Actual width
        var tempVideoWidth = parseInt(getVideoWidth());

        // Debug detection
        // console.log('resize debug detection (player):', completeWidth, pastWidth);
        // console.log('resize debug detection (video):', tempVideoWidth, pastVideoWidth);
        // Detection... v2.1...
        if (completeWidth !== pastWidth || tempVideoWidth !== pastVideoWidth) {
            // Set pastWidth
            pastWidth = parseInt(completeWidth);
            pastVideoWidth = parseInt(tempVideoWidth);

            // Video width + add possible offset (say for 2006 theme)
            var videoWidth;
            switch (userConfig.year) {
                case '2006':
                    videoWidth = getOffset(userConfig.year) - 24;
                break;
            
                default:
                    videoWidth = tempVideoWidth;
                break;
            }

            // Go!
            console.log(`%cPlayerTube resize script: Detected big progress bar change! Fixing...`, styles2, `${completeWidth} !== ${videoWidth}`)
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
}, 50);

// Easy call to progress bar width
function getVideoWidth() {
    return document.querySelector('#movie_player').clientWidth;
}

function getOffset(year) {
    var result;
    switch (year) {
        case '2006':
            result = (parseInt(getVideoWidth()) - 56 - document.querySelector('.ytp-right-controls').clientWidth);
        break;

        default:
            result = 24;
        break;
    }

    return result;
}

// Get fixed width for user's theme
function getFixedWidth() {
    // Get actual current player width
    let videoWidth = parseInt(getVideoWidth());
    switch (userConfig.year) {
        case '2012':
        case '2011':
        case '2010':
            result = videoWidth + getOffset(userConfig.year);
        break;

        case '2006':
            // Since 2006 is in the middle of the player, we gotta do more.
            result = getOffset(userConfig.year);
        break;

        default:
            result = videoWidth + getOffset(userConfig.year);
        break;
    }

    return result;
}

// Fix progress bar
function fixBar() {
    // Define stuff
    let playerWidth = getFixedWidth();
    // If chapters
    // if (document.querySelectorAll(`.ytp-chapter-hover-container`).length > 1) {
    //     playerWidth = playerWidth - 1;
    // }

    // Set width that needs to be set
    let width;
    if (document.querySelectorAll('.ytp-chapter-hover-container').length > 1) {
        width = playerWidth - 1;
    } else {
        width = playerWidth;
    }
    let height = document.getElementById('movie_player').clientHeight;

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