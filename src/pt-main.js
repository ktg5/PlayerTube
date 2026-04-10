// hi this is playertube...
// Vars
var currentPath = window.location.href;
var progressbar = document.getElementsByClassName('ytp-progress-bar')[0];
var customTheme = userConfig.customTheme;
var extensionLocation = runtime.getURL('');
var isinTheaterMode = false;

// Fix for older configs
if (userConfig.year === '2011') {
    userConfig.year = '2012';
    storage.set({PTConfig: userConfig});
    location.reload();
}

// Put config in a element for certain scripts
// Also put extension location in another element
document.body.insertAdjacentHTML('afterbegin', `
    <script id="playertube-config">${JSON.stringify(userConfig)}</script>
    <div id="playertube"
`);


// #################################

/**
 * Inserts `element` next to `paste`
 * @param {string} element The element query name to move
 * @param {string} paste The element query name for the `element` value to be moved next to
 * @returns {void}
 */
function moveElement(element, paste) {
    let moveInt, tried = 0;

    function imove() {
        let elementDiv = document.querySelector(`${element}`);
        let pasteDiv = document.querySelector(`${paste}`);

        let logData = {
            elementStr: element,
            elementDiv: elementDiv,
            pasteStr: paste,
            pasteDiv: pasteDiv
        };

        if (
            elementDiv
            && pasteDiv
        ) {
            if (pasteDiv.contains(elementDiv)) {
                return console.error('moveElement: pasteDiv already has element', logData);
            } else if (elementDiv.parentElement.contains(elementDiv)) {
                pasteDiv.parentNode.insertBefore(elementDiv, pasteDiv.parentNode.firstElementChild);
                clearInterval(moveInt);
                return console.log('moveElement: move successful', logData)
            } else {
                return console.log('moveElement: something else failed', logData);
            }
        } else {
            return console.error('moveElement: elements can\'t be found.', logData);
        }
    }

    moveInt = setInterval(() => {
        if (tried >= 5) return clearInterval(moveInt);
        else {
            imove();
            tried++;
        }
    }, 500);
};

// Heartbeats
const ptMainHeartBeatFunc = async () => {
    // Make sure script reruns on page update.
    if (window.location.href !== currentPath) {
        startPlayer();
        progressBarChanger();
        currentPath = window.location.href;
    }

    // Fake bar heartbeat
    if (userConfig.fakeBarToggle !== false) {
        if (!document.getElementsByClassName('video-stream html5-main-video')[0] ||
            document.getElementsByClassName('video-stream html5-main-video')[0].paused === true ||
            !document.getElementById('playertube-fake-bar')) {
            return;
        } else {
            // Video to pull info off of
            var ytVideo = document.getElementsByClassName('video-stream html5-main-video')[0];

            // If the video has not started yet, don't continue.
            if (
                !ytVideo.buffered
                || ytVideo.buffered.length === 0
            ) return;

            // Vars from ytVideo
            var ytVideoCurrent = ytVideo.currentTime;
            var ytBuffered = ytVideo.buffered.end(0);
            var ytVideoFull = ytVideo.duration;
            // Debug
            // console.log(`%cPlayerTube current video element:`, styles2, ytVideo);
            // console.log(`%cPlayerTube current time: ${ytVideoCurrent}`, styles2);
            // console.log(`%cPlayerTube end time: ${ytVideoFull}`, styles2);
            // console.log(`%cPlayerTube video percentage: ${(ytVideoCurrent / ytVideoFull * 100).toFixed(2)}%`, styles2);
            // Actual script
            document.getElementById('playertube-fake-bar').style.setProperty('--pt-fakebar-current', `${(ytVideoCurrent / ytVideoFull * 100).toFixed(2)}%`)
            document.getElementById('playertube-fake-bar').style.setProperty('--pt-fakebar-loaded', `${(ytBuffered / ytVideoFull * 100).toFixed(2)}%`)
        }
    }

    // Check buttons & values
    let nextButton = document.querySelector('.ytp-next-button');
    let prevButton = document.querySelector('.ytp-prev-button');
    let buttonBase = document.querySelector('.ytp-chrome-bottom');
    /// Left & Right
    if (nextButton &&
        prevButton &&
        buttonBase) {
        // Left (Should always be on in playlists & specific themes)
        if (
            new URLSearchParams(window.location.search).get('list') !== null
            || userConfig.year === '2006'
        ) {
            nextButton.style.display = 'block';
            buttonBase.classList.remove('no-right-button');
        } else {
            // There'll be no button
            buttonBase.classList.add('no-right-button');
        }
    
        // Right
        if (prevButton.getAttribute('style') === "display: none;") {
            buttonBase.classList.add('no-left-button');
        } else {
            // Remove if spotted
            if (buttonBase.classList.contains('no-left-button')) {
                buttonBase.classList.remove('no-left-button');
            }
        }
    }

    // Volume (exact & simple)
    let volumePanel = document.querySelector('.ytp-volume-panel');
    let volumeArea = document.querySelector('.ytp-volume-area');
    // Set values
    if (buttonBase &&
        volumeArea &&
        volumePanel) {
        // Extra let
        let volumeValue = volumePanel.getAttribute('aria-valuenow');
        // Set exact value
        volumeArea.setAttribute('volumenow', volumeValue);
        // Set simple value (for CSS)
        setSimpleVolume(volumeValue);
    }
    function setSimpleVolume(value) {
        let simpleVol;
        switch (true) {
            case parseInt(value) == 0:
                simpleVol = 'none';
            break;

            case parseInt(value) <= 25:
                simpleVol = 'low';
            break;

            case parseInt(value) <= 75:
                simpleVol = 'med';
            break;
        
            case parseInt(value) >= 75:
                simpleVol = 'high';
            break;
        }
        volumeArea.setAttribute('simplevolumenow', simpleVol);
        return {attr: volumeArea.getAttribute('simplevolumenow'), simpleVol: simpleVol};
    }

    // Theater mode (mainly used for (if i even want to) JS stuff, prob not CSS)
    // Which, if anyone is wondering, you can use "ytd-watch-flexy[theater]" for
    // theater mode detection for CSS, that is if the element you're trying to
    // get is inside of the "ytd-watch-flexy" element.
    let ytpWatchFlex = document.querySelector('ytd-watch-flexy');
    if (ytpWatchFlex) {
        // After check
        let theaterCheck = document.querySelector('ytd-watch-flexy').getAttribute('theater');
        if (theaterCheck !== null) { // if getAttribute gets nothing, it should be null
            isinTheaterMode = true;
        } else { // usually is just a blank string, like: ''.
            isinTheaterMode = false;
        }
        // console.log('theater mode check:', isinTheaterMode);
    }

    // Make sure the config year is either in the body or the body containter depending on if project v3 is on
    if (!document.body.getAttribute('pt-year') && document.body.getAttribute('pt-year') !== userConfig.year) {
        document.body.setAttribute('pt-year', userConfig.year);
    }

    // console.log('ptMainHeartBeat: still rolling...');
};
var ptMainHeartBeat = setInterval(ptMainHeartBeatFunc, 1000);

// Mainly used in fullscreen & embeds
var progressBarFullDetector;
function progressBarChanger() {
    progressBarFullDetector = setInterval(() => {
        // Check progress bar
        if (progressbar) {
            // If finished
            if (progressbar.getAttribute('aria-valuemax') === progressbar.getAttribute('aria-valuenow')) {
                progressbar.classList.add('finished');
                console.log(`%cPlayerTube video finished, progress bar should be all main color.`, styles2);
            // If restarted or keep going.
            } else {
                if (progressbar.classList.contains('finished')) {
                    progressbar.classList.remove('finished');
                    console.log(`%cPlayerTube video started, reverting back.`, styles2);
                }
            }
        }
    }, 1000);
}


// Inital startup.
// When the page is (re)loaded.
startPlayer();
progressBarChanger();
// Also add base CSS file
var baseCSS = runtime.getURL(`css/base.css`);
document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${baseCSS}">`);


// Stuff for no embeds
if (!window.location.href.includes('embed')) {
    // Insert resizing progress bar script
    let tempInterval = setInterval(() => {
        if (document.querySelector('.video-stream.html5-main-video')) {
            // Now insert
            var srcDoc = document.createElement('script');
            srcDoc.id = 'playertube-js';
            srcDoc.className = 'playertube-resize-bar';
            srcDoc.src = runtime.getURL(`src/pt-resize.js`);
            document.body.append(srcDoc);
            // Stop
            clearInterval(tempInterval);
        }
    }, 1000);
}


// You might be asking, "why is this a thing?"
// You'd only understand if you were dealing CSS.
var loadedPlayerStyle = false;

// Custom theme stuff
var didCustomTheme = false;
function enableCustomTheme() {
    return new Promise(async (resolve, reject) => {
        if (didCustomTheme !== true) {
            var outputCssCustomTheme = `/* hi this is the custom theme you set lolz */`;
            if (userConfig.controlsBack !== null) {
                outputCssCustomTheme += `
:root {
    --pt-background: ${userConfig.controlsBack} !important;
    --pt-background-top: ${userConfig.controlsBack} !important;
}
                `;
            } if (userConfig.settingsBgColor !== null) {
                outputCssCustomTheme += `
:root {
    --pt-settings-bg: ${userConfig.settingsBgColor} !important;
}
                `;
            } if (userConfig.progressBarColor !== null) {
                outputCssCustomTheme += `
:root {
    --pt-main-colour: ${userConfig.progressBarColor} !important;
    --pt-volume-slider: ${userConfig.progressBarColor} !important;
    --pt-setting-after-label: ${userConfig.progressBarBgColor} !important;
}
                `;
            } if (userConfig.progressBarBgColor !== null) {
                outputCssCustomTheme += `
:root {
    --pt-progress-bar-bg: ${userConfig.progressBarBgColor} !important;
}
                `;
            } if (userConfig.volumeSliderBack !== null) {
                outputCssCustomTheme += `
:root {
    --pt-volume-slider: ${userConfig.volumeSliderBack} !important;
}

#container .ytp-volume-slider-handle::before {
    background: ${userConfig.volumeSliderBack} !important;
}
                `;
            } if (userConfig.scrubberIcon !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-button {
    background: url(${userConfig.scrubberIcon}) no-repeat center !important;
    border-radius: 0 !important;
}
                `;
            } if (userConfig.scrubberIconHover === null && userConfig.scrubberIcon !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-button:hover {
    background: url(${userConfig.scrubberIcon}) no-repeat center !important;
    border-radius: 0 !important;
}
                `;
            } if (userConfig.scrubberIconHover !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-button:hover {
    background: url(${userConfig.scrubberIconHover}) no-repeat center !important;
    border-radius: 0 !important;
}
                `;
            } if (userConfig.scrubberPosition !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-button {
    background-position: ${userConfig.scrubberPosition} !important;
}
                `;
            } if (userConfig.scrubberSize !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-button {
    background-size: ${userConfig.scrubberSize}px !important;
}
#container .ytp-scrubber-button:hover {
    background-size: ${userConfig.scrubberSize}px !important;
}
                `;
            } if (userConfig.scrubberHeight !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-container,
#container .ytp-scrubber-button
{
    height: ${userConfig.scrubberHeight}px !important;
}
#container .ytp-scrubber-container:hover,
#container .ytp-scrubber-button:hover
{
    height: ${userConfig.scrubberHeight}px !important;
}
                `;
            } if (userConfig.scrubberWidth !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-container,
#container .ytp-scrubber-button
{
    width: ${userConfig.scrubberWidth}px !important;
}
#container .ytp-scrubber-container:hover,
#container .ytp-scrubber-button:hover
{
    width: ${userConfig.scrubberWidth}px !important;
}
                `;
            } if (userConfig.scrubberWidth === null && userConfig.scrubberHeight !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-container,
#container .ytp-scrubber-button
{
    width: ${userConfig.scrubberHeight}px !important;
}
#container .ytp-scrubber-container:hover,
#container .ytp-scrubber-button:hover
{
    width: ${userConfig.scrubberHeight}px !important;
}
                `;
            } if (userConfig.scrubberWidth !== null && userConfig.scrubberHeight === null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-container,
#container .ytp-scrubber-button
{
    height: ${userConfig.scrubberWidth}px !important;
}
#container .ytp-scrubber-container:hover,
#container .ytp-scrubber-button:hover
{
    height: ${userConfig.scrubberWidth}px !important;
}
                `;
            } if (userConfig.scrubberTop !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-container {
    top: ${userConfig.scrubberTop}px !important;
}
                `;
            } if (userConfig.scrubberLeft !== null) {
                outputCssCustomTheme += `
#container .ytp-scrubber-container {
    left: ${userConfig.scrubberLeft}px !important;
}
                `;
            }
            // output css
            document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-custom-theme" type="text/css">${outputCssCustomTheme}</style>`);

            didCustomTheme = true;
            resolve();
        }
    });
}

// User settings toggles
function applyUserSettings() {
    // toggles
    var configCSSOutput = `/* hi this is the custom settings you set lolz */`;
    if (userConfig.endScreenToggle !== true) {
        configCSSOutput += `
/* TOGGLE END SCREEN (disabled) */
.ytp-ce-element.ytp-ce-element-show {
    display: none !important;
}
        `
//     } if (userConfig.embedOtherVideos !== true) {
//         configCSSOutput += `
// /* EMBED SHOW "Other Videos" (disabled) */
// .ytp-expand-pause-overlay .ytp-pause-overlay {
//     display: none !important;
// }
//         `
    } if (userConfig.autoplayButton !== true) {
        configCSSOutput += `
/* AUTO PLAY BUTTON (disabled / not set) */
.ytp-chrome-controls .ytp-button.ytp-autonav-toggle {
    display: none !important;
}
        `
    } if (userConfig.heatMapToggle !== true) {
        configCSSOutput += `
/* PROGRESS BAR HEAT MAP (disabled) */
.ytp-progress-bar-container .ytp-heat-map-container {
    display: none !important;
}
        `
    } if (userConfig.toggleWatermark === false) {
        configCSSOutput += `
/* CHANNEL WATERMARK (disabled) */
.annotation.annotation-type-custom.iv-branding {
    display: none;
}
        `
    } if (userConfig.toggleRoundedCorners !== true) {
        configCSSOutput += `
/* ROUNDED CORNERS (disabled / not set) */
#ytd-player .ytd-watch-flexy {
    border-radius: 0 !important;
}
        `
    } else if (userConfig.toggleRoundedCorners === true) {
        configCSSOutput += `
/* ROUNDED CORNERS (enabled) */
#ytd-player .ytd-watch-flexy {
    border-radius: 12px !important;
}
        `
    } if (userConfig.togglePaidContent !== true) {
        configCSSOutput += `
/* PAID CONTENT (disabled / not set) */
.ytp-suggested-action-badge[aria-label="View products"], .ytp-paid-content-overlay-link {
    display: none !important;
}
        `
    } if (userConfig.toggleInfoCards === false) {
        configCSSOutput += `
/* INFO CARDS (disabled) */
.ytp-button.ytp-cards-button, .iv-drawer, .ytp-cards-teaser {
    display: none !important;
}
        `
    } if (userConfig.fullyExtendBar === true) {
        configCSSOutput += `
/* FULLY EXTEND PROGRESS BAR (enabled) */
#ytd-player .ytp-chrome-bottom .ytp-progress-bar-container .ytp-progress-bar {
    height: var(--pt-progress-bar-full-height) !important;
    margin-bottom: 1px !important;
}

.ytp-chrome-bottom .ytp-progress-bar .ytp-progress-list {
    transform: scaleY(1) !important;
}

.ytp-chrome-bottom .ytp-progress-bar .ytp-scrubber-container .ytp-scrubber-button {
    transform: scale(1) !important;
}

.ytp-chrome-bottom .ytp-progress-bar:after {
    transform: scale(1) !important;
}

/* 3rd-party stuff for same setting */
.ytp-autohide #previewbar {
    transform: scaleY(0.5);
    top: -8px;
}
        `

        document.querySelector('#ytd-player').setAttribute('pt-force-extend', true);

        if (userConfig.year === '2010') {
            configCSSOutput += `
#previewbar {
    transform: scale(1) !important;
}
            `
        }
    } if (userConfig.toggleFadeOut === true) {
        configCSSOutput += `
/* TOGGLE FADE OUT (enabled) */
#ytd-player #container .ytp-autohide:not(.ytp-watch-controls):not(.paused-mode) .ytp-chrome-bottom, #ytd-player .ytp-chrome-bottom[aria-hidden=true] {
    opacity: 0 !important;
    bottom: 0 !important;
}
        `
    } if (userConfig.toggleSpinner === false) {
        configCSSOutput += `
/* TOGGLE CUSTOM SPINNER (disabled) */
.ytp-spinner {
    background: none !important;
    height: auto !important;
}
        `
    } if (userConfig.toggleMoreVids !== true) {
        configCSSOutput += `
/* TOGGLE MORE VIDEOS FEATURE (disabled) */
#ytd-player {
    --ytp-grid-scroll-percentage: 0 !important;
}

.ytp-fullscreen-grid {
    display: none !important;
}

#ytd-player .ytp-gradient-bottom {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==) !important;
    background-position-y: bottom !important;
}

#ytd-player .ytp-delhi-modern:not(.ytp-disable-bottom-gradient) .ytp-gradient-bottom,
.ytp-delhi-modern.ytp-fullscreen-grid-active .ytp-gradient-bottom
{
    height: 64px;
}

#ytd-player .ytp-delhi-modern.ytp-fullscreen-grid-active:not(#ytd-player .ended-mode):not(.ytp-grid-scrolling) .ytp-chrome-bottom {
    display: inherit;
    pointer-events: all;
}
        `
    } if (userConfig.toggleFSButtons !== true) {
        configCSSOutput += `
/* TOGGLE FULLSCREEN BUTTONS (disabled) */
#ytd-player .ytp-fullscreen.ytp-fullscreen-grid-peeking .ytp-fullscreen-quick-actions {
    display: none;
}
        `
    } if (userConfig.toggleScrubberThumbs !== true) {
        configCSSOutput += `
/* TOGGLE THUMBNAIL PREVIEWS WHEN SCRUBBING (disabled) */
#ytd-player .ytp-tooltip.ytp-preview .ytp-tooltip-bg {
    opacity: 0;
}
        `
    } if (userConfig.toggleLessSettings._self === true) {
        const settingsMenuClass = '.ytp-popup.ytp-settings-menu';
        // id menu options by SVG LMAOOO
        const svgPaths = {
            stableVol: 'd="M12 .99C5.92 .99 1 5.92 1 11.99C1 18.07 5.92 22.99 12 22.99C18.07 22.99 23 18.07 23 11.99C23 5.92 18.07 .99 12 .99ZM12 2.99C14.38 2.99 16.67 3.94 18.36 5.63C20.05 7.32 21 9.61 21 11.99C21 14.38 20.05 16.67 18.36 18.36C16.67 20.05 14.38 20.99 12 20.99C9.61 20.99 7.32 20.05 5.63 18.36C3.94 16.67 3 14.38 3 11.99C3 9.61 3.94 7.32 5.63 5.63C7.32 3.94 9.61 2.99 12 2.99ZM14 6.00C13.73 6.00 13.48 6.10 13.29 6.29C13.10 6.48 13 6.73 13 7.00V17.00C13 17.26 13.10 17.52 13.29 17.70C13.48 17.89 13.73 18.00 14 18.00C14.26 18.00 14.51 17.89 14.70 17.70C14.89 17.52 15 17.26 15 17.00V7.00C15 6.73 14.89 6.48 14.70 6.29C14.51 6.10 14.26 6.00 14 6.00ZM10 8.00C9.73 8.00 9.48 8.10 9.29 8.29C9.10 8.48 9 8.73 9 9.00V15.00C9 15.26 9.10 15.52 9.29 15.70C9.48 15.89 9.73 16.00 10 16.00C10.26 16.00 10.51 15.89 10.70 15.70C10.89 15.52 11 15.26 11 15.00V9.00C11 8.73 10.89 8.48 10.70 8.29C10.51 8.10 10.26 8.00 10 8.00ZM18 9.00C17.73 9.00 17.48 9.10 17.29 9.29C17.10 9.48 17 9.73 17 10.00V14.00C17 14.26 17.10 14.52 17.29 14.70C17.48 14.89 17.73 15.00 18 15.00C18.26 15.00 18.51 14.89 18.70 14.70C18.89 14.52 19 14.26 19 14.00V10.00C19 9.73 18.89 9.48 18.70 9.29C18.51 9.10 18.26 9.00 18 9.00ZM6 10.00C5.73 10.00 5.48 10.10 5.29 10.29C5.10 10.48 5 10.73 5 11.00V13.00C5 13.26 5.10 13.52 5.29 13.70C5.48 13.89 5.73 14.00 6 14.00C6.26 14.00 6.51 13.89 6.70 13.70C6.89 13.52 7 13.26 7 13.00V11.00C7 10.73 6.89 10.48 6.70 10.29C6.51 10.10 6.26 10.00 6 10.00Z"',
            voiceBoost: 'd="M11.48 2.14 3.91 6.68A6 6 0 0 0 1 11.83v.33a6 6 0 0 0 2.91 5.14l7.57 4.54A1 1 0 0 0 13 21V3a1.00 1.00 0 0 0-1.51-.85Zm6.88 2.07a1 1 0 0 0-.00 1.41 9 9 0 0 1 0 12.72 1 1 0 0 0 1.41 1.41 11 11 0 0 0 0-15.55 1 1 0 0 0-1.41 0ZM4.94 8.40l.00-.00L11 4.76v14.46l-6.05-3.63A4 4 0 0 1 3 12.16v-.33a4 4 0 0 1 1.94-3.42ZM15.53 7.05a1 1 0 0 0 0 1.41 5 5 0 0 1 0 7.07 1 1 0 0 0 1.41 1.41 6.99 6.99 0 0 0 0-9.9 1 1 0 0 0-1.41 0Z"',
            sleepTimer: 'd="M12.33 1.00C12.22 1.00 12.11 1.00 12 1C5.92 1 1 5.92 1 12C1 18.07 5.92 23 12 23C13.90 23.00 15.78 22.50 17.44 21.55C19.10 20.61 20.48 19.25 21.46 17.61L21.64 17.29C22.06 16.52 21.21 15.73 20.35 15.88C18.76 16.15 17.12 15.94 15.66 15.27C14.19 14.59 12.97 13.49 12.14 12.11C11.31 10.73 10.91 9.13 11.01 7.52C11.11 5.91 11.69 4.37 12.67 3.09L12.89 2.83C13.45 2.16 13.20 1.03 12.33 1.00ZM15.56 2.60C15.45 2.84 15.43 3.11 15.51 3.36C15.59 3.61 15.77 3.82 16.01 3.94C16.91 4.39 17.73 4.99 18.44 5.71L18.73 6.03L18.80 6.10C18.99 6.27 19.22 6.36 19.47 6.37C19.72 6.37 19.96 6.28 20.15 6.12C20.33 5.95 20.45 5.72 20.48 5.48C20.51 5.23 20.44 4.98 20.29 4.78L20.23 4.70L19.87 4.31C19.01 3.43 18.01 2.70 16.90 2.15C16.67 2.03 16.39 2.01 16.14 2.10C15.89 2.18 15.68 2.36 15.56 2.60M10.24 3.17C9.42 4.64 8.99 6.31 9 8C9 13.42 13.32 17.84 18.71 17.99C17.86 18.93 16.83 19.69 15.67 20.21C14.52 20.73 13.26 21.00 12 21C9.76 21.00 7.60 20.17 5.95 18.67C4.29 17.17 3.25 15.10 3.03 12.88C2.81 10.65 3.43 8.43 4.76 6.63C6.09 4.84 8.05 3.60 10.24 3.17M21.16 7.88C20.93 7.96 20.73 8.12 20.61 8.34C20.49 8.55 20.45 8.81 20.50 9.05L20.53 9.15L20.66 9.56C20.93 10.53 21.04 11.54 20.98 12.55C20.97 12.81 21.06 13.06 21.23 13.26C21.41 13.45 21.65 13.57 21.92 13.59C22.18 13.60 22.44 13.52 22.63 13.34C22.83 13.17 22.95 12.93 22.97 12.67C23.05 11.44 22.92 10.20 22.58 9.02L22.43 8.51L22.39 8.42C22.29 8.19 22.11 8.01 21.88 7.91C21.65 7.81 21.40 7.80 21.16 7.88Z"',
            ambientMode: 'd="M12 .5C11.73 .5 11.48 .60 11.29 .79C11.10 .98 11 1.23 11 1.5V3.5C11 3.76 11.10 4.01 11.29 4.20C11.48 4.39 11.73 4.5 12 4.5C12.26 4.5 12.51 4.39 12.70 4.20C12.89 4.01 13 3.76 13 3.5V1.5C13 1.23 12.89 .98 12.70 .79C12.51 .60 12.26 .5 12 .5ZM3.79 1.29C3.61 1.46 3.51 1.70 3.50 1.94C3.48 2.19 3.56 2.43 3.72 2.63L3.79 2.70L5.29 4.20L5.37 4.27C5.56 4.42 5.80 4.50 6.04 4.49C6.29 4.47 6.52 4.37 6.70 4.20C6.87 4.02 6.97 3.79 6.99 3.54C7.00 3.30 6.92 3.06 6.77 2.86L6.70 2.79L5.20 1.29L5.13 1.22C4.93 1.06 4.69 .98 4.44 1.00C4.20 1.01 3.96 1.11 3.79 1.29ZM18.86 1.22L18.79 1.29L17.29 2.79L17.22 2.86C17.07 3.06 16.99 3.30 17.00 3.54C17.01 3.79 17.12 4.02 17.29 4.20C17.47 4.37 17.70 4.48 17.95 4.49C18.19 4.50 18.43 4.42 18.63 4.27L18.70 4.20L20.20 2.70L20.27 2.63C20.42 2.43 20.50 2.19 20.49 1.95C20.48 1.70 20.37 1.47 20.20 1.29C20.02 1.12 19.79 1.01 19.54 1.00C19.30 .99 19.06 1.07 18.86 1.22ZM19.20 6.01L19 6H5L4.79 6.01C4.30 6.06 3.84 6.29 3.51 6.65C3.18 7.02 2.99 7.50 3 8V16L3.01 16.20C3.05 16.66 3.26 17.08 3.58 17.41C3.91 17.73 4.33 17.94 4.79 17.99L5 18H19L19.20 17.98C19.66 17.94 20.08 17.73 20.41 17.41C20.73 17.08 20.94 16.66 20.99 16.20L21 16V8C20.99 7.50 20.81 7.02 20.48 6.66C20.15 6.29 19.69 6.06 19.20 6.01ZM5 16V8H19V16H5ZM17.29 19.79C17.11 19.96 17.01 20.20 17.00 20.44C16.98 20.69 17.06 20.93 17.22 21.13L17.29 21.20L18.79 22.70L18.86 22.77C19.06 22.92 19.30 23.00 19.54 22.99C19.79 22.98 20.02 22.87 20.20 22.70C20.37 22.52 20.48 22.29 20.49 22.04C20.50 21.80 20.42 21.56 20.27 21.36L20.20 21.29L18.70 19.79L18.63 19.72C18.43 19.56 18.19 19.48 17.94 19.50C17.70 19.51 17.46 19.61 17.29 19.79ZM5.37 19.72L5.29 19.79L3.79 21.29L3.72 21.36C3.57 21.56 3.49 21.80 3.50 22.04C3.51 22.29 3.62 22.52 3.79 22.70C3.97 22.87 4.20 22.98 4.45 22.99C4.69 23.00 4.93 22.92 5.13 22.77L5.20 22.70L6.70 21.20L6.77 21.13C6.92 20.93 7.00 20.69 6.99 20.45C6.97 20.20 6.87 19.97 6.70 19.79C6.52 19.62 6.29 19.52 6.04 19.50C5.80 19.49 5.56 19.57 5.37 19.72ZM12 19.5C11.73 19.5 11.48 19.60 11.29 19.79C11.10 19.98 11 20.23 11 20.5V22.5C11 22.76 11.10 23.01 11.29 23.20C11.48 23.39 11.73 23.5 12 23.5C12.26 23.5 12.51 23.39 12.70 23.20C12.89 23.01 13 22.76 13 22.5V20.5C13 20.23 12.89 19.98 12.70 19.79C12.51 19.60 12.26 19.5 12 19.5Z"',
            autoDub: 'd="M19.4 .2C19.29 .27 19.20 .37 19.13 .49C19.07 .60 19.02 .72 19.01 .85C18.99 .98 18.99 1.12 19.03 1.24C19.06 1.37 19.12 1.49 19.2 1.6L20.8 .4C20.64 .18 20.40 .04 20.14 .01C19.87 -0.02 19.61 .04 19.4 .2ZM20.8 .4L20 1L19.2 1.59C20.37 3.16 21.00 5.06 21.00 7.01C20.99 8.97 20.35 10.87 19.17 12.42C19.01 12.64 18.94 12.90 18.98 13.16C19.02 13.43 19.16 13.66 19.37 13.83C19.58 13.99 19.84 14.05 20.11 14.02C20.37 13.98 20.61 13.84 20.77 13.63C22.21 11.73 22.99 9.41 23 7.02C23.00 4.63 22.23 2.31 20.8 .4ZM10 2C8.67 2 7.40 2.52 6.46 3.46C5.52 4.40 5 5.67 5 7C5 8.32 5.52 9.59 6.46 10.53C7.40 11.47 8.67 12 10 12C11.32 12 12.59 11.47 13.53 10.53C14.47 9.59 15 8.32 15 7C15 5.67 14.47 4.40 13.53 3.46C12.59 2.52 11.32 2 10 2ZM16.17 2.29C15.97 2.48 15.86 2.73 15.86 2.99C15.85 3.26 15.95 3.51 16.14 3.71C16.98 4.58 17.44 5.68 17.49 6.80L17.5 7.02C17.49 8.22 17.01 9.40 16.10 10.32C15.92 10.51 15.83 10.77 15.83 11.03C15.84 11.29 15.95 11.53 16.13 11.71C16.32 11.90 16.57 12.00 16.83 12.00C17.09 12.00 17.34 11.90 17.53 11.72C18.78 10.44 19.49 8.77 19.5 7.03L19.49 6.71C19.42 5.09 18.74 3.53 17.58 2.32C17.49 2.23 17.38 2.15 17.26 2.10C17.14 2.05 17.01 2.02 16.88 2.01C16.75 2.01 16.62 2.03 16.49 2.08C16.37 2.13 16.26 2.20 16.17 2.29ZM10 4C10.39 4 10.78 4.07 11.14 4.22C11.51 4.37 11.84 4.60 12.12 4.87C12.39 5.15 12.62 5.48 12.77 5.85C12.92 6.21 13 6.60 13 7C13 7.39 12.92 7.78 12.77 8.14C12.62 8.51 12.39 8.84 12.12 9.12C11.84 9.39 11.51 9.62 11.14 9.77C10.78 9.92 10.39 10 10 10C9.20 10 8.44 9.68 7.87 9.12C7.31 8.55 7 7.79 7 7C7 6.20 7.31 5.44 7.87 4.87C8.44 4.31 9.20 4 10 4ZM10.39 13.01L10 13C8.01 12.99 6.10 13.73 4.63 15.06L4.34 15.34C3.60 16.08 3.01 16.96 2.60 17.93C2.20 18.90 1.99 19.94 2 21C2 21.26 2.10 21.51 2.29 21.70C2.48 21.89 2.73 22 3 22C3.26 22 3.51 21.89 3.70 21.70C3.89 21.51 4 21.26 4 21C4.00 19.40 4.63 17.88 5.75 16.75L5.97 16.55C7.07 15.55 8.51 15 10 15L10.29 15.00C11.78 15.08 13.18 15.70 14.24 16.75L14.44 16.97C15.44 18.07 16 19.51 16 21C16 21.26 16.10 21.51 16.29 21.70C16.48 21.89 16.73 22 17 22C17.26 22 17.51 21.89 17.70 21.70C17.89 21.51 18 21.26 18 21C18.00 19.01 17.26 17.10 15.93 15.63L15.65 15.34C14.25 13.93 12.37 13.10 10.39 13.01Z"',
            annotations: 'd="M9.65 6.00L9.5 6H2.5L2.34 6.00C1.97 6.04 1.63 6.21 1.38 6.49C1.13 6.77 1.00 7.12 1 7.5V13.5L1.00 13.65C1.04 14.02 1.21 14.36 1.49 14.61C1.77 14.86 2.12 15 2.5 15H4.5L3.81 17.75C3.77 17.89 3.77 18.03 3.79 18.17C3.82 18.31 3.87 18.45 3.95 18.56C4.03 18.68 4.14 18.78 4.26 18.85C4.38 18.92 4.51 18.97 4.66 18.99L4.78 19H8.55L8.72 18.98C8.88 18.95 9.04 18.89 9.17 18.79C9.30 18.68 9.40 18.55 9.47 18.40L9.52 18.24L10.62 13.96C10.84 13.11 10.96 12.24 10.99 11.36L11 10.98V7.5C11 7.12 10.86 6.77 10.61 6.49C10.36 6.21 10.02 6.04 9.65 6.00ZM21.65 6.00L21.5 6H14.5L14.34 6.00C13.97 6.04 13.63 6.21 13.38 6.49C13.13 6.77 13 7.12 13 7.5V13.5L13.00 13.65C13.04 14.02 13.21 14.36 13.49 14.61C13.77 14.86 14.12 15 14.5 15H16.5L15.81 17.75C15.77 17.89 15.77 18.03 15.79 18.17C15.82 18.31 15.87 18.44 15.95 18.56C16.03 18.68 16.14 18.78 16.26 18.85C16.38 18.92 16.51 18.97 16.66 18.99L16.78 19H20.55L20.72 18.98C20.88 18.95 21.04 18.89 21.17 18.79C21.30 18.68 21.40 18.55 21.47 18.40L21.52 18.24L22.62 13.96C22.84 13.11 22.96 12.24 22.99 11.36L23 10.98V7.5C23 7.12 22.86 6.77 22.61 6.49C22.36 6.21 22.02 6.04 21.65 6.00ZM3 13V8H9V10.98C9.00 11.71 8.91 12.44 8.76 13.16L8.68 13.47L7.78 17H6.06L6.44 15.48L7.06 13H3ZM15 13V8H21V10.98C21 11.71 20.91 12.44 20.76 13.16L20.68 13.47L19.78 17H18.06L18.44 15.48L19.06 13H15Z"'
        };
        
        // add html listener to settings menu
        const settingsMenuObs = new MutationObserver(() => {
            settingsMenuObs.disconnect();

            const settingsMenuDiv = document.querySelector(settingsMenuClass);

            // manually set display none for each menuitem
            let onMainPage = false;
            for (const key in svgPaths) {
                if (!Object.hasOwn(svgPaths, key)) continue;

                // check if the sub option for svgPath is set to true
                if (userConfig.toggleLessSettings[key] !== true) continue;
                
                const svgPath = svgPaths[key];
                
                const svgPathDiv = document.querySelector(`[${svgPath}]`);
                if (svgPathDiv) {
                    // check if svg is in the animation panel or not
                    const animatePanel = settingsMenuDiv.querySelector(".ytp-panel-animate-back");
                    if (
                        animatePanel
                        && animatePanel.contains(svgPathDiv)
                    ) return;

                    const optionDiv = svgPathDiv.parentElement.parentElement.parentElement;
                    if (optionDiv) {
                        optionDiv.style.display = 'none';
                        if (onMainPage === false) onMainPage = true;
                    }
                }
            }

            // change page height
            if (onMainPage === true) {
                let miniPanelHeight = 0;

                // get menu panel height from the amount of items shown
                const allMenuItems = settingsMenuDiv.querySelectorAll('.ytp-panel .ytp-menuitem');
                allMenuItems.forEach((menuItem) => {
                    if (menuItem.style.display !== 'none') miniPanelHeight += 48;
                });

                console.log(miniPanelHeight);
                settingsMenuDiv.style.height = miniPanelHeight;
                settingsMenuDiv.querySelector(`.ytp-panel`).style.height = miniPanelHeight;
                settingsMenuDiv.querySelector(`.ytp-panel .ytp-panel-menu`).style.height = miniPanelHeight;
            }

            // start observering again
            startSettingsMenuObs();
        });
        const settingsMenuObsConf = {
            childList: true,
            characterData: true,
            attributes: true,
            subtree: true
        };

        function startSettingsMenuObs() {
            return settingsMenuObs.observe(document.querySelector(settingsMenuClass), settingsMenuObsConf);
        }
        setTimeout(startSettingsMenuObs, 500);
    }
    // output css
    document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-toggles" type="text/css">${configCSSOutput}</style>`);

    // Import 3rd-party CSS
    var thirdPartyCSS = runtime.getURL(`css/3rd-party-style.css`);
    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-3rd-party" rel="stylesheet" type="text/css" href="${thirdPartyCSS}">`);
    // Import 3rd-party CSS for 2010
    if (userConfig.year === "2010") {
        var thirdPartyCSS2010 = 
        `
/* This is 3rd-party CSS for those using the 2010 theme */

.ytp-chrome-bottom .playerButton.ytp-button {
    background: none !important;
    border: none !important;
}

#sbSkipIconControlBarImage {
    background: none !important;
    border: none !important;
}
        `
        if (userConfig.alternateMode === false) thirdPartyCSS2010 += 
        `
        
.skipButtonControlBarContainer div {
    color: black;
}
        `

        document.body.insertAdjacentHTML('afterbegin', `
            <style id="playertube-css" class="playertube-3rd-party-2010" type="text/css">
            ${thirdPartyCSS2010}
            </style>
        `);
    } else if (userConfig.year === "2006") {
        var thirdPartyCSS2006 = 
        `
/* This is 3rd-party CSS for those using the 2006 theme */

#previewbar {
    transform: scaleY(1);
}
        `

        document.body.insertAdjacentHTML('afterbegin', `
            <style id="playertube-css" class="playertube-3rd-party-2006" type="text/css">
            ${thirdPartyCSS2006}
            </style>
        `);
    }
}

// Custom buttons
// Watch later
function watchLaterButtonAdd() {
    // Make button
    var subtitlesButton = document.querySelector(`.ytp-subtitles-button.ytp-button`);
    // Need to make a interval because the subtitle button appears whenever
    // the YouTube page is done loading
    let tempInterval = setInterval(() => {
        if (subtitlesButton) {
            subtitlesButton.insertAdjacentHTML('beforebegin', `
                <button
                class="ytp-button playertube-watchlater"
                data-tooltip-opaque="false" aria-label="Watch later"
                title="Watch later">
                </button>
            `);
            // Click listener
            document.querySelector(`.ytp-button.playertube-watchlater`).addEventListener('click', async () => {
                function PTwatchLaterButton() {
                    // CustomTube 
                    if (document.querySelector('[aria-label="Save to playlist"]')) {
                        document.querySelector('[aria-label="Save to playlist"]').click();
                    // Vanilla YouTube
                    } else {
                        // Click more opinions button two times to both create other buttons & close it's menu
                        document.querySelector('button.yt-spec-button-shape-next.yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--size-m.yt-spec-button-shape-next--icon-button').click();
                        // If the menu button for showing the Watch Later prompt isn't there, we'll rerun
                        setTimeout(() => {
                            let target = document.querySelector('ytd-menu-service-item-renderer.style-scope.ytd-menu-popup-renderer.iron-selected');
                            if (target) {
                                target.click();
                            }
                        }, 100);
                    }
                }
                PTwatchLaterButton()
            });

            // Stop interval so that we don't add any extra listeners or something else
            clearInterval(tempInterval);
        } else {

        }
    }, 1000);
}


// Load everything else.
// Includes year theme & fake bar.
// This function will keep going until it's happy.
async function startPlayer() {
    if (loadedPlayerStyle !== true) {
        // Delhi CSS
        var link = runtime.getURL(`css/delhi.css`);
        if (link) document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-delhi" rel="stylesheet" type="text/css" href="${link}">`);
        else {
            alert(`PlayerTube ERROR! "delhi.css" couldn't be fetched! If this happens again, report this issue onto the GitHub page!`)
            console.error(`MAJOR ERROR!!!!!!!!! "delhi.css" couldn't be fetched!`);
            return;
        }

        switch (userConfig.year) {
            case '2015':
                // IMPORT CSS (if it wasn't already loaded)
                // Base
                var link = runtime.getURL(`css/${userConfig.year}.css`);
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${link}">`);
                loadedPlayerStyle = true;

                // IMPORT THE OTHER CSS
                /// User settings
                applyUserSettings();
                /// Settings menu
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${runtime.getURL(`css/settings-menu.1.css`)}">`);

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    await enableCustomTheme();
                }
            break;

            case '2013':
                // Base
                var baselink = runtime.getURL(`css/${userConfig.year}.css`);
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${baselink}">`);
                
                // Alt mode stuff
                if (
                    userConfig.alternateMode === true
                    && userConfig.customTheme !== true
                ) {
                    var colorlink = runtime.getURL(`css/${userConfig.year}-white.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                } else {
                    var colorlink = runtime.getURL(`css/${userConfig.year}-dark.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                }
                loadedPlayerStyle = true;

                // IMPORT THE OTHER CSS
                /// User settings
                applyUserSettings();
                /// Top buttons style
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${runtime.getURL(`css/old-top-buttons.css`)}">`);
                /// Settings menu
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${runtime.getURL(`css/settings-menu.1.css`)}">`);

                // Custom watch later button
                watchLaterButtonAdd();

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    await enableCustomTheme();
                    // .ytp-scrubber-button.ytp-swatch-background-color {
                    //     background-color: transparent !important;
                    // }
                }
            break;

            case '2012':
                // IMPORT CSS (if it wasn't already loaded)
                // Base
                var link = runtime.getURL(`css/${userConfig.year}.css`);
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${link}">`);
                loadedPlayerStyle = true;

                // IMPORT THE OTHER CSS
                /// User settings
                applyUserSettings();
                /// Top buttons style
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${runtime.getURL(`css/old-top-buttons.css`)}">`);
                /// Settings menu
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${runtime.getURL(`css/settings-menu.1.css`)}">`);

                // Custom watch later button
                watchLaterButtonAdd();

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    await enableCustomTheme();
                }
            break;

            case '2010':
                // IMPORT CSS (if it wasn't already loaded)
                var colorlink;
                var baselink = runtime.getURL(`css/${userConfig.year}.css`);
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${baselink}">`);

                // Alt mode stuff
                if (
                    userConfig.alternateMode === true
                    && userConfig.customTheme !== true
                ) {
                    colorlink = runtime.getURL(`css/${userConfig.year}-dark.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                } else {
                    colorlink = runtime.getURL(`css/${userConfig.year}-white.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                }

                loadedPlayerStyle = true;
                // IMPORT THE OTHER CSS
                /// User settings
                applyUserSettings();
                /// Settings menu
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${runtime.getURL(`css/settings-menu.2.css`)}">`);                    

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    await enableCustomTheme();

                    var CustomThemeCss2010 = `
/* someother custom theme stuff for 2010 */

#container .ytp-chrome-controls {
    border-top: solid 2px #d1d1d180 !important;
}

#container .ytp-chrome-bottom .ytp-left-controls:before {
    position: absolute;
    content: "";
    height: 100%;
    width: 100%;
    left: 80px;
    background: linear-gradient(rgb(0 0 0 / 17.5%), rgb(255 255 255 / 0%));
}

#container .ytp-chrome-bottom .ytp-right-controls:before {
    position: absolute;
    content: "";
    height: 100%;
    width: 60%;
    background: linear-gradient(rgb(0 0 0 / 17.5%), rgb(255 255 255 / 0%));
}

#container .ytp-chrome-bottom .ytp-button {
    border: solid 1px rgb(255 255 255 / 35%);
    background: linear-gradient(rgb(255 255 255 / 35%), rgb(0 0 0 / 35%)) !important;
}

/* igrone background & border for the following: */
#container .ytp-chrome-bottom .ytp-button.ytp-settings-button,
#container .ytp-chrome-bottom .ytp-button.ytp-subtitles-button,
#container .ytp-chrome-bottom .ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"],
#container .ytp-chrome-bottom .ytp-chapter-title.ytp-button
{
    background: none !important;
    border: none !important;
}
                    `
                    if (userConfig.progressBarColor) {
                        CustomThemeCss2010 += `
:root {
    --pt-alt-colour: ${userConfig.progressBarColor}45;
}
                        `
                    }
                    // output css
                    document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-custom-theme-for-2010" type="text/css">${CustomThemeCss2010}</style>`);
                }
            break;

            case '2006':
                // IMPORT CSS (if it wasn't already loaded)
                var link = runtime.getURL(`css/${userConfig.year}.css`);
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${link}">`);
                loadedPlayerStyle = true;

                // IMPORT THE OTHER CSS
                /// User settings
                applyUserSettings();
                /// Settings menu
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${runtime.getURL(`css/settings-menu.2.css`)}">`);                    

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    await enableCustomTheme();
                }

                // Move stuffs
                setInterval(() => {
                    // Move volume area to right side
                    let VolumePanel = document.querySelector("span.ytp-volume-area");
                    if (VolumePanel && VolumePanel.parentNode.className !== 'ytp-right-controls') {
                        let firstRightControl = document.querySelector(".ytp-right-controls").childNodes[0];
                        let firstRightControlStr = `.${firstRightControl.classList[0]}`;

                        if (VolumePanel) moveElement('span.ytp-volume-area', firstRightControlStr);
                        // Do the same for the time display
                        let TimePanel = document.querySelector("div.ytp-time-display");
                        if (TimePanel) moveElement('div.ytp-time-display', firstRightControlStr);
                        // Move the panel ahead of the actual volume button
                        let VolumeButton = document.querySelector(".ytp-volume-panel");
                        if (VolumeButton) moveElement(".ytp-volume-panel", '.ytp-volume-icon.ytp-button');
                    }
                }, 500);
            break; 

            default:
                console.error(`PLAYERTUBE ERROR:`, `no userConfig.year is selected, please fix that.`);
            break;
        };

        // Move previous button back to where it should be (why would you change this bro...)
        moveElement('.ytp-prev-button', '.ytp-play-button');
    };


    // Make fake bar
    // No need to load the JS for fake bar here, that's at the top of this script.
    if (userConfig.fakeBarToggle !== false) {
        if (document.getElementById('playertube-fake-bar')) return;
        else {
            var chromeBottom = document.querySelector('.ytp-chrome-bottom');
            
            let tempInt = setInterval(() => {
                if (chromeBottom) {
                    /// Add [pt-fakebar] to chrome bottom (player controls) for CSS reasons
                    chromeBottom.setAttribute('pt-fakebar', '');

                    /// Load fake bar CSS
                    var link = runtime.getURL(`css/fakebar.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-fakebar" rel="stylesheet" type="text/css" href="${link}">`);
                    /// Load fake bar HTML
                    chromeBottom.insertAdjacentHTML('afterend', `
<div id="playertube-fake-bar">
    <div class="current"></div>
    <div class="loaded"></div>
</div>
                    `);

                    // Make sure to end our checker
                    clearInterval(tempInt);
                } else chromeBottom = document.querySelector('.ytp-chrome-bottom');
            }, 100);
        }
    }
}
