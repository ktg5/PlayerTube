// hi this is playertube...
// Vars
var currentPath = window.location.href;
var progressbar = document.getElementsByClassName('ytp-progress-bar')[0];
var customTheme = userConfig.customTheme;

// #################################

// LOADING / SPINNER / BUFFER thingy whatever
document.getElementsByClassName('ytp-spinner-container')[0].style.display = 'none';
var spinner = document.getElementsByClassName('ytp-spinner')[0];
spinner.style.background = `url('https://raw.githubusercontent.com/ktg5/PlayerTube/main/img/loading.gif')`;
spinner.style.backgroundSize = 'contain';
spinner.style.height = '64px';

// MOVING ELEMENTS
function moveElement(element, targetDiv, pasteDiv) {
    console.log(`%cPlayerTube moveElement function: ${targetDiv.contains(element)}`, styles2)
    if (pasteDiv.contains(element)) {
        return;
    } else if (targetDiv.contains(element)) {
        pasteDiv.parentNode.insertBefore(targetDiv.removeChild(element), pasteDiv.parentNode.firstElementChild);
        return;
    } else {
        return;
    }
};

// Heartbeats
/// Make sure script reruns on page update.
/// And make check progress bar value in case to change it.
setInterval(() => {
    // Check window href
    if (window.location.href == currentPath) {
        return;
    } else {
        startPlayer();
        progressBarChanger();
        currentPath = window.location.href;
    }
}, 1000);
/// Fake bar heartbeat
if (userConfig.toggleFadeOut !== true || userConfig.fakeBarToggle !== false) {
    setInterval(() => {
        if (!document.getElementsByClassName('video-stream html5-main-video')[0] || document.getElementsByClassName('video-stream html5-main-video')[0].paused == true) {
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
    }, 1000);
}

// This is used to make the progress look like
// it goes all the way.
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

// You might be asking, "why is this a thing?"
// You'd only understand if you were dealing
// CSS.
var loadedPlayerStyle = false;

// Custom theme stuff
function enableCustomTheme() {
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
        }
        `
    } if (userConfig.scrubberIconHover == null && userConfig.scrubberIcon !== null) {
        outputCssCustomTheme += `
        #container .ytp-scrubber-button:hover {
            background: url(${userConfig.scrubberIcon}) no-repeat center !important;
        }
        `
    } if (userConfig.scrubberIconHover !== null) {
        outputCssCustomTheme += `
        #container .ytp-scrubber-button:hover {
            background: url(${userConfig.scrubberIconHover}) no-repeat center !important;
        }
        `
    } if (userConfig.scrubberPosition !== null) {
        outputCssCustomTheme += `
        #container .ytp-scrubber-button {
            background-position: ${userConfig.scrubberPosition} !important;
        }
        .ytp-scrubber-button:hover {
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
            height: 10px !important;
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

        #previewbar {
            top: 0.5px !important;
        }
        
        .ytp-chrome-bottom .playerButton.ytp-button {
            background: none !important;
            border: none !important;
        }

        #sbSkipIconControlBarImage {
            background: none !important;
            border: none !important;
        }
        `
        if (userConfig.darkMode == false) thirdPartyCSS2010 += 
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
    }
}

// Load everything else.
// Includes year theme & fake bar.
// This function will keep going until it's happy.
function startPlayer() {
    // Keep going until we hit it.
    const starter = setInterval(function () {
        switch (userConfig.year) {
            case '2015':
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
                    // .ytp-scrubber-button.ytp-swatch-background-color {
                    //     background-color: transparent !important;
                    // }
                }

                // #################################    
                /// WATCH LATER BUTTON
                var WatchLaterButton = document.getElementsByClassName("ytp-watch-later-button")[0];
                if (WatchLaterButton) {
                    var targetDiv1 = WatchLaterButton.parentElement;
                    var pastDiv1 = document.getElementsByClassName("ytp-subtitles-button")[0];
    
                    moveElement(WatchLaterButton, targetDiv1, pastDiv1);
                }
            break;

            case '2012':
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

                // #################################

                /// WATCH LATER BUTTON
                var WatchLaterButton = document.getElementsByClassName("ytp-watch-later-button")[0];
                if (WatchLaterButton) {
                    var targetDiv1 = WatchLaterButton.parentElement;
                    var pastDiv1 = document.getElementsByClassName("ytp-subtitles-button")[0];
    
                    moveElement(WatchLaterButton, targetDiv1, pastDiv1);
                }
            break;

            case '2010':
                // IMPORT CSS (if it wasn't already loaded)
                if (loadedPlayerStyle == false) {
                    var baselink = runtime.getURL(`css/${userConfig.year}.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${baselink}">`);
                    // Dark mode stuff
                    if (userConfig.customTheme !== true && userConfig.darkMode == true) {
                        var colorlink = runtime.getURL(`css/${userConfig.year}-dark.css`);
                        document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-darkmode" rel="stylesheet" type="text/css" href="${colorlink}">`);
                    } else {
                        var colorlink = runtime.getURL(`css/${userConfig.year}-white.css`);
                        document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-darkmode" rel="stylesheet" type="text/css" href="${colorlink}">`);
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
            break;

            default:
                console.error(`PLAYERTUBE ERROR:`, `no userConfig.year is selected, please fix that.`);
            break;
        };

        // Make fake bar
        if (userConfig.toggleFadeOut !== true || userConfig.fakeBarToggle !== false) {
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