// Global vars
var currentPath = window.location.href;
var barWidth;
var videoContainer = document.getElementById('movie_player');
var userConfig = JSON.parse(document.getElementById('playertube-config').innerHTML);
var ytVideo = document.getElementsByClassName('video-stream html5-main-video')[0];

// Heartbeat
var checkBar = setInterval(() => {
    // Actual check
    if (videoContainer && ytVideo.src.includes('blob')) {
        var completeWidth = 0;
        document.querySelectorAll(`.ytp-chapter-hover-container`).forEach(element => {
            completeWidth = completeWidth + element.clientWidth;
        });
        if (completeWidth !== videoContainer.clientWidth) {
            fixBar();
            barWidth = getBarWidth();
        }
    }

    // Location check
    if (window.location.href !== currentPath) {
        setTimeout(() => {
            fixBar();
            barWidth = getBarWidth();
            currentPath = window.location.href;
        }, 2000);
    }
}, 500);

// Easy call to progress bar width
function getBarWidth() {
    return videoContainer.clientWidth;
}

// Get offset for user's theme
function getOffset() {
    switch (userConfig.year) {
        case 2012:
        case 2011:
        case 2010:
            result = 24
        break;

        case 2006:

    
        default:
            result = 24;
        break;
    }

    return result;
}

// Fix progress bar
function fixBar() {
    // Define stuff
    var playerWidth = parseInt(getBarWidth());
    var playerOffset = getOffset();

    // Set width that needs to be set
    width = playerWidth + playerOffset;
    height = videoContainer.clientHeight;

    // Use YouTube function to change width
    videoContainer.setInternalSize(width, height);
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