// hi this is playertube...
// Vars
var currentPath = window.location.href;
var progressbar = document.getElementsByClassName('ytp-progress-bar')[0];
var customTheme = userConfig.customTheme;
var extensionLocation = runtime.getURL('');
var isinTheaterMode = false;

// Fix for older configs
if (userConfig.year == '2015') {
    userConfig.year = '2012';
    storage.set({PTConfig: userConfig});
}

// Put config in a element for certain scripts
// Also put extension location in another element
document.body.insertAdjacentHTML('afterbegin', `
    <script id="playertube-config">${JSON.stringify(userConfig)}</script>
    <div id="playertube"
`);


// #################################

// MOVING ELEMENTS
function moveElement(element, pasteDiv) {
    // Will insert element next to pasteDiv and move it from it's parent
    console.log('moveElement: checking', element)
    if (pasteDiv) {
        console.log('moveElement: element is valid')
        if (pasteDiv.contains(element)) {
            return console.error('moveElement: pasteDiv already has element');
        } else if (element.parentElement.contains(element)) {
            pasteDiv.parentNode.insertBefore(element, pasteDiv.parentNode.firstElementChild);
            return console.log('moveElement: move successful')
        } else {
            return console.log('moveElement: something else failed');
        }
    } else {
        return console.error('moveElement: pasteDiv can\'t be found', pasteDiv);
    }
};

// Heartbeats
setInterval(() => {
    /// Make sure script reruns on page update.
    if (window.location.href !== currentPath) {
        startPlayer();
        progressBarChanger();
        currentPath = window.location.href;
    }

    /// Fake bar heartbeat
    if (userConfig.fakeBarToggle !== false) {
        if (!document.getElementsByClassName('video-stream html5-main-video')[0] ||
            document.getElementsByClassName('video-stream html5-main-video')[0].paused == true ||
            !document.getElementById('playertube-fake-bar')) {
            return;
        } else {
            // Video to pull info off of
            var ytVideo = document.getElementsByClassName('video-stream html5-main-video')[0];
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
}, 1000);

// Mainly used in fullscreen & embeds
function progressBarChanger() {
    setInterval(() => {
        // Check progress bar
        if (progressbar) {
            // If finished
            if (progressbar.getAttribute('aria-valuemax') == progressbar.getAttribute('aria-valuenow')) {
                progressbar.classList.add('finished');
                console.log(`%cPlayerTube video finished, progress bar should be all main color.`, styles2);
            // If restarted or keep going.
            } else {
                if (progressbar.classList.contains('finished')) {
                    progressbar.classList.remove('finished');
                    console.log(`%cPlayerTube video started, reerting back.`, styles2);
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


// Insert resizing progress bar script
// First, make sure this isn't a embed
if (!window.location.href.includes('embed')) {
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


// Button & value checks
setInterval(() => {
    // Check buttons & values
    let nextButton = document.querySelector('.ytp-next-button');
    let prevButton = document.querySelector('.ytp-prev-button');
    let buttonBase = document.querySelector('.ytp-chrome-bottom');
    /// Left & Right
    if (nextButton &&
        prevButton &&
        buttonBase) {
        // Left
        if (nextButton.getAttribute('style') == "display: none;") {
            buttonBase.classList.add('no-right-button');
        } else {
            // Remove if spotted
            if (buttonBase.classList.contains('no-right-button')) {
                buttonBase.classList.remove('no-right-button');
            }
        }
    
        // Right
        if (prevButton.getAttribute('style') == "display: none;") {
            buttonBase.classList.add('no-left-button');
        } else {
            // Remove if spotted
            if (buttonBase.classList.contains('no-left-button')) {
                buttonBase.classList.remove('no-left-button');
            }
        }
    }

    /// Volume (exact & simple)
    let volumePanel = document.querySelector('.ytp-volume-panel');
    let volumeArea = document.querySelector('.ytp-volume-area');
    if (buttonBase &&
        volumeArea &&
        volumePanel) {
        // Extra let
        let volumeValue = volumePanel.getAttribute('aria-valuenow');
        // Set exact value
        volumeArea.setAttribute('volumenow', volumeValue);
        // Set simple value (for CSS)
        let simpleVol;
        switch (true) {
            case parseInt(volumeValue) == 0:
                simpleVol = 'none';
            break;

            case parseInt(volumeValue) <= 25:
                simpleVol = 'low';
            break;

            case parseInt(volumeValue) <= 75:
                simpleVol = 'med';
            break;
        
            case parseInt(volumeValue) >= 75:
                simpleVol = 'high';
            break;
        }
        volumeArea.setAttribute('simplevolumenow', simpleVol);
    }

    /// Theater mode (mainly used for (if i even want to) JS stuff, prob not CSS)
    /// Which, if anyone is wondering, you can use "ytd-watch-flexy[theater]" for
    /// theater mode detection for CSS, that is if the element you're trying to
    /// get is inside of the "ytd-watch-flexy" element.
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
}, 500);

// You might be asking, "why is this a thing?"
// You'd only understand if you were dealing CSS.
var loadedPlayerStyle = false;

// Custom theme stuff
var didCustomTheme = false;
function enableCustomTheme() {
    if (didCustomTheme !== true) {
        var outputCssCustomTheme = `/* hi this is the custom theme you set lolz */`;
        if (userConfig.controlsBack !== null) {
            outputCssCustomTheme += `
            :root {
                --pt-background: ${userConfig.controlsBack} !important;
                --pt-background-top: ${userConfig.controlsBack} !important;
            }
            `
        } if (userConfig.settingsBgColor !== null) {
            outputCssCustomTheme += `
            :root {
                --pt-settings-bg: ${userConfig.settingsBgColor} !important;
            }
            `
        } if (userConfig.progressBarColor !== null) {
            outputCssCustomTheme += `
            :root {
                --pt-main-colour: ${userConfig.progressBarColor} !important;
                --pt-volume-slider: ${userConfig.progressBarColor} !important;
                --pt-setting-after-label: ${userConfig.progressBarBgColor} !important;
            }
            `
        } if (userConfig.progressBarBgColor !== null) {
            outputCssCustomTheme += `
            :root {
                --pt-progress-bar-bg: ${userConfig.progressBarBgColor} !important;
            }
            `
        } if (userConfig.volumeSliderBack !== null) {
            outputCssCustomTheme += `
            #container .ytp-volume-slider-handle::before {
                background: ${userConfig.volumeSliderBack} !important;
            }
            `
        } if (userConfig.scrubberIcon !== null) {
            outputCssCustomTheme += `
            #container .ytp-scrubber-button {
                background: url(${userConfig.scrubberIcon}) no-repeat center !important;
                border-radius: 0 !important;
            }
            `
        } if (userConfig.scrubberIconHover == null && userConfig.scrubberIcon !== null) {
            outputCssCustomTheme += `
            #container .ytp-scrubber-button:hover {
                background: url(${userConfig.scrubberIcon}) no-repeat center !important;
                border-radius: 0 !important;
            }
            `
        } if (userConfig.scrubberIconHover !== null) {
            outputCssCustomTheme += `
            #container .ytp-scrubber-button:hover {
                background: url(${userConfig.scrubberIconHover}) no-repeat center !important;
                border-radius: 0 !important;
            }
            `
        } if (userConfig.scrubberPosition !== null) {
            outputCssCustomTheme += `
            #container .ytp-scrubber-button {
                background-position: ${userConfig.scrubberPosition} !important;
            }
            `
        } if (userConfig.scrubberSize !== null) {
            outputCssCustomTheme += `
            #container .ytp-scrubber-button {
                background-size: ${userConfig.scrubberSize}px !important;
            }
            #container .ytp-scrubber-button:hover {
                background-size: ${userConfig.scrubberSize}px !important;
            }
            `
        } if (userConfig.scrubberHeight !== null) {
            outputCssCustomTheme += `
            /* default */
            #container .ytp-scrubber-button {
                height: ${userConfig.scrubberHeight}px !important;
            }
            #container .ytp-scrubber-button:hover {
                height: ${userConfig.scrubberHeight}px !important;
            }
            `
        } if (userConfig.scrubberWidth !== null) {
            outputCssCustomTheme += `
            /* default */
            #container .ytp-scrubber-button {
                width: ${userConfig.scrubberWidth}px !important;
            }
            #container .ytp-scrubber-button:hover {
                width: ${userConfig.scrubberWidth}px !important;
            }
            `
        } if (userConfig.scrubberWidth == null && userConfig.scrubberHeight !== null) {
            outputCssCustomTheme += `
            /* default */
            #container .ytp-scrubber-button {
                width: ${userConfig.scrubberHeight}px !important;
            }
            #container .ytp-scrubber-button:hover {
                width: ${userConfig.scrubberHeight}px !important;
            }
            `
        } if (userConfig.scrubberWidth !== null && userConfig.scrubberHeight == null) {
            outputCssCustomTheme += `
            /* default */
            #container .ytp-scrubber-button {
                height: ${userConfig.scrubberWidth}px !important;
            }
            #container .ytp-scrubber-button:hover {
                height: ${userConfig.scrubberWidth}px !important;
            }
            `
        } if (userConfig.scrubberTop !== null) {
            outputCssCustomTheme += `
            #container .ytp-scrubber-container {
                top: ${userConfig.scrubberTop}px !important;
            }
            `
        } if (userConfig.scrubberLeft !== null) {
            outputCssCustomTheme += `
            #container .ytp-scrubber-container {
                left: ${userConfig.scrubberLeft}px !important;
            }
            `
        }
        // output css
        document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-custom-theme" type="text/css">${outputCssCustomTheme}</style>`);

        didCustomTheme = true;
    }
}

// User settings toggles
function extraStyles() {
    // toggles
    var outputCssToggles = `/* hi this is the custom settings you set lolz */`;
    if (userConfig.endScreenToggle == false) {
        outputCssToggles += `
        /* TOGGLE END SCREEN (disabled) */
        .ytp-ce-element.ytp-ce-element-show {
            display: none !important;
        }
        `
    } if (userConfig.embedOtherVideos == false) {
        outputCssToggles += `
        /* EMBED SHOW "Other Videos" (disabled) */
        .ytp-expand-pause-overlay .ytp-pause-overlay {
            display: none !important;
        }
        `
    } if (userConfig.autoplayButton !== true) {
        outputCssToggles += `
        /* AUTO PLAY BUTTON (disabled / not set) */
        .ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"] {
            display: none !important;
        }
        `
    } if (userConfig.heatMapToggle !== true) {
        outputCssToggles += `
        /* PROGRESS BAR HEAT MAP (disabled) */
        .ytp-progress-bar-container .ytp-heat-map-container {
            display: none !important;
        }
        `
    } if (userConfig.toggleWatermark == false) {
        outputCssToggles += `
        /* CHANNEL WATERMARK (disabled) */
        .annotation.annotation-type-custom.iv-branding {
            display: none;
        }
        `
    } if (userConfig.toggleRoundedCorners !== true) {
        outputCssToggles += `
        /* ROUNDED CORNERS (disabled / not set) */
        #ytd-player.ytd-watch-flexy {
            border-radius: 0 !important;
        }
        `
    } else if (userConfig.toggleRoundedCorners == true) {
        outputCssToggles += `
        /* ROUNDED CORNERS (enabled) */
        #ytd-player.ytd-watch-flexy {
            border-radius: 12px !important;
        }
        `
    } if (userConfig.togglePaidContent !== true) {
        outputCssToggles += `
        /* PAID CONTENT (disabled / not set) */
        .ytp-suggested-action-badge[aria-label="View products"], .ytp-paid-content-overlay-link {
            display: none !important;
        }
        `
    } if (userConfig.toggleInfoCards == false) {
        outputCssToggles += `
        /* INFO CARDS (disabled) */
        .ytp-button.ytp-cards-button, .iv-drawer, .ytp-cards-teaser {
            display: none !important;
        }
        `
    } if (userConfig.fullyExtendBar == true) {
        outputCssToggles += `
        /* FULLY EXTEND PROGRESS BAR (enabled) */
        .ytp-chrome-bottom .ytp-progress-bar-container .ytp-progress-bar {
            height: var(--pt-progress-bar-full-height) !important;
            margin-bottom: 1px !important;
        }

        .ytp-autohide .ytp-chrome-bottom .ytp-progress-bar-container .ytp-progress-bar {
            height: 4px !important;
        }
        
        .ytp-chrome-bottom .ytp-progress-bar .ytp-progress-list {
            transform: scaleY(1) !important;
        }
        
        .ytp-chrome-bottom .ytp-progress-bar .ytp-scrubber-container .ytp-scrubber-button {
            transform: scale(1) !important;
        }

        .ytp-autohide:not(.ytp-watch-controls) .ytp-scrubber-container .ytp-scrubber-button {
            transform: scale(0) !important;
        }
        
        .ytp-chrome-bottom .ytp-progress-bar:after {
            transform: scale(1) !important;
        }

        /* 3rd-party stuff for setting */
        .ytp-autohide #previewbar {
            transform: scaleY(0.5);
            top: -8px;
        }
        `

        if (userConfig.year == '2010') {
            outputCssToggles += `
            #previewbar {
                transform: scale(1) !important;
            }
            `
        }
    } if (userConfig.toggleFadeOut == true) {
        outputCssToggles += `
        /* TOGGLE FADE OUT (enabled) */
        #movie_player.ytp-autohide:not(.ytp-watch-controls) .ytp-chrome-bottom, .ytp-chrome-bottom[aria-hidden=true] {
            opacity: 0 !important;
            bottom: 0 !important;
        }
        `
    }
    // output css
    document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-toggles" type="text/css">${outputCssToggles}</style>`);

    // Import 3rd-party CSS
    var thirdPartyCSS = runtime.getURL(`css/3rd-party-style.css`);
    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-3rd-party" rel="stylesheet" type="text/css" href="${thirdPartyCSS}">`);
    // Import 3rd-party CSS for 2010
    if (userConfig.year == "2010") {
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
        if (userConfig.alternateMode == false) thirdPartyCSS2010 += 
        `
        
        .skipButtonControlBarContainer div {
            color: black;
        }
        `

        document.body.insertAdjacentHTML('afterbegin', 
        `
        <style id="playertube-css" class="playertube-3rd-party-2010" type="text/css">
        ${thirdPartyCSS2010}
        </style>
        `
        )
    } else if (userConfig.year == "2006") {
        var thirdPartyCSS2006 = 
        `
        /* This is 3rd-party CSS for those using the 2006 theme */

        #previewbar {
            transform: scaleY(1);
        }
        `

        document.body.insertAdjacentHTML('afterbegin', 
        `
        <style id="playertube-css" class="playertube-3rd-party-2006" type="text/css">
        ${thirdPartyCSS2006}
        </style>
        `
        )
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
                title="Watch later"
            >
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
function startPlayer() {
    // Keep going 'til we get a hit & are able to "inject".
    const starter = setInterval(async function () {
        switch (userConfig.year) {
            case '2012':
                // IMPORT CSS (if it wasn't already loaded)
                if (loadedPlayerStyle == false) {
                    // Base
                    var baselink = runtime.getURL(`css/${userConfig.year}.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${baselink}">`);
                    
                    // Alt mode stuff
                    if (userConfig.alternateMode == true) {
                        var colorlink = runtime.getURL(`css/${userConfig.year}-white.css`);
                        document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                    } else {
                        var colorlink = runtime.getURL(`css/${userConfig.year}-dark.css`);
                        document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                    }
                    loadedPlayerStyle = true;

                    // IMPORT THE OTHER CSS
                    extraStyles();

                    // Custom watch later button
                    watchLaterButtonAdd();
                }

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    enableCustomTheme();
                    // .ytp-scrubber-button.ytp-swatch-background-color {
                    //     background-color: transparent !important;
                    // }
                }
            break;

            case '2011':
                // IMPORT CSS (if it wasn't already loaded)
                if (loadedPlayerStyle == false) {
                    // Base
                    var link = runtime.getURL(`css/${userConfig.year}.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${link}">`);
                    loadedPlayerStyle = true;

                    // IMPORT THE OTHER CSS
                    extraStyles();

                    // Custom watch later button
                    watchLaterButtonAdd();
                }

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    enableCustomTheme();
                }
            break;

            case '2010':
                // IMPORT CSS (if it wasn't already loaded)
                if (loadedPlayerStyle == false) {
                    var baselink = runtime.getURL(`css/${userConfig.year}.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${baselink}">`);
                    // Alt mode stuff
                    if (userConfig.alternateMode == true) {
                        var colorlink = runtime.getURL(`css/${userConfig.year}-dark.css`);
                        document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                    } else {
                        var colorlink = runtime.getURL(`css/${userConfig.year}-white.css`);
                        document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-alternateMode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                    }
                    loadedPlayerStyle = true;
                    // IMPORT THE OTHER CSS
                    extraStyles();
                }

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    enableCustomTheme();

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
                if (loadedPlayerStyle == false) {
                    var link = runtime.getURL(`css/${userConfig.year}.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${link}">`);
                    loadedPlayerStyle = true;
                    // IMPORT THE OTHER CSS
                    extraStyles();
                }

                // IMPORT USER CUSTOMIZATION
                if (customTheme === true) {
                    enableCustomTheme();
                }

                // Move stuffs
                setInterval(() => {
                    // Move volume area to right side
                    var VolumePanel = document.querySelector("span.ytp-volume-area");
                    if (VolumePanel && VolumePanel.parentNode.className !== 'ytp-right-controls') {
                        if (VolumePanel) {
                            pastDiv1 = document.querySelector(".ytp-right-controls").childNodes[0];
            
                            moveElement(VolumePanel, pastDiv1);
                        }
                        // Do the same for the time display
                        var TimePanel = document.querySelector("div.ytp-time-display");
                        if (TimePanel) {
                            pastDiv1 = document.querySelector(".ytp-right-controls").childNodes[0];
            
                            moveElement(TimePanel, pastDiv1);
                        }
                        // Move the panel ahead of the actual volume button
                        var VolumeButton = document.querySelector(".ytp-volume-panel");
                        if (VolumeButton) {
                            pastDiv1 = document.querySelector(".ytp-mute-button.ytp-button");
            
                            moveElement(VolumeButton, pastDiv1);
                        }
                    } else {}
                }, 500);
            break; 

            default:
                console.error(`PLAYERTUBE ERROR:`, `no userConfig.year is selected, please fix that.`);
            break;
        };

        // Make fake bar
        // No need to load the JS for fake bar here, that's at the top of this script.
        if (userConfig.fakeBarToggle !== false) {
            if (!document.getElementsByClassName('video-stream html5-main-video')[0] || document.getElementsByClassName('video-stream html5-main-video')[0].paused == true || document.getElementById('playertube-fake-bar')) {
                return;
            } else {
                /// Load fake bar CSS
                var link = runtime.getURL(`css/fakebar.css`);
                document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-fakebar" rel="stylesheet" type="text/css" href="${link}">`);
                /// Load fake bar HTML
                document.getElementsByClassName('ytp-chrome-bottom')[0].insertAdjacentHTML('afterend', 
                    `
                    <div id="playertube-fake-bar">
                        <div class="current"></div>
                        <div class="loaded"></div>
                    </div>
                    `
                )
            }
        }

        // We're done! End Start Checker.
        clearInterval(starter);
    }, 1000);
}