// Global vars
var currentPath = window.location.href;
var videoContainer = document.getElementById('movie_player');
var userConfig = JSON.parse(document.getElementById('playertube-config').innerHTML);
var ytVideo = document.getElementsByClassName('video-stream html5-main-video')[0];

// Heartbeat
var checkBar = setInterval(() => {
    // Actual check
    if (videoContainer && ytVideo.src.includes('blob')) {
        var completeWidth = 0;
        // Detecting chapters if any
        document.querySelectorAll(`.ytp-chapter-hover-container`).forEach(element => {
            completeWidth = completeWidth + element.clientWidth;
        });
        // Video width + add possible offset (say for 2006 theme)
        var videoWidth;
        switch (userConfig.year) {
            case '2006':
                videoWidth = videoContainer.clientWidth - 55 - document.querySelector('.ytp-right-controls').clientWidth - 24;
            break;
        
            default:
                videoWidth = videoContainer.clientWidth;
            break;
        }

        // Detection...
        if (completeWidth !== videoWidth) {
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
}, 500);

// Easy call to progress bar width
function getBarWidth() {
    // If chapters
    if (document.querySelectorAll(`.ytp-chapter-hover-container`).length > 1) {
        return videoContainer.clientWidth - 1;
    // If none
    } else {
        return videoContainer.clientWidth;
    }
}

// Get fixed width for user's theme
function getFixedWidth() {
    // Get actual current player width
    var actualWidth = parseInt(getBarWidth());
    switch (userConfig.year) {
        case '2012':
        case '2011':
        case '2010':
            result = actualWidth + 24;
        break;

        case '2006':
            // Since 2006 is in the middle of the player, we gotta do more.
            result = actualWidth - 55 - document.querySelector('.ytp-right-controls').clientWidth;
        break;

        default:
            result = actualWidth + 24;
        break;
    }

    return result;
}

// Fix progress bar
function fixBar() {
    // Define stuff
    var playerWidth = getFixedWidth();

    // Set width that needs to be set
    width = playerWidth;
    height = videoContainer.clientHeight;

    // Use YouTube function to change width
    videoContainer.setInternalSize(width, height);
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