// Custom theme enabled
var customTheme = userConfig.customTheme;
// If you'd like to take a look at some examples,
// https://github.com/ktg5/PlayerTube#user-customization

// #################################

// MOVING ELEMENTS
function moveElement(element, targetDiv, pasteDiv) {
    console.log(`moveElement function: ${targetDiv.contains(element)}`)
    if (pasteDiv.contains(element)) {
        return;
    } else if (targetDiv.contains(element)) {
        pasteDiv.parentNode.insertBefore(targetDiv.removeChild(element), pasteDiv.parentNode.firstElementChild);
        return;
    } else {
        return;
    }
};


// Make sure script reruns on page update.
// And make check progress bar value in case to change it.
var currentPath = window.location.href;
var progressbar = document.getElementsByClassName('ytp-progress-bar')[0];

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

function progressBarChanger() {
    setInterval(() => {
        // Check progress bar
        if (progressbar) {
            if (progressbar.getAttribute('aria-valuemax') == progressbar.getAttribute('aria-valuenow')) {
                progressbar.classList.add('finished');
                console.log('PlayerTube', `video finished, progress bar should be all main color.`);
            } else {
                if (progressbar.classList.contains('finished')) {
                    progressbar.classList.remove('finished');
                    console.log(`PlayerTube`, `video started, reerting back.`);
                }
            }
        }
    }, 1000);
}

// Start
startPlayer();
progressBarChanger();

// You might be asking, "why is this a thing?"
// You'd only understand if you were dealing
// CSS.
var loadedPlayerStyle = false;
var loadedMenuStyle = false;

// Custom theme stuff
function enableCustomTheme() {
    var outputCssCustomTheme = `/* hi this is the custom theme you set lolz */`;
    if (userConfig.controlsBack !== null) {
        outputCssCustomTheme += `
        :root {
            --background: ${userConfig.controlsBack} !important;
        }
        `
    } if (userConfig.progressBarColor !== null) {
        outputCssCustomTheme += `
        :root {
            --main-colour: ${userConfig.progressBarColor} !important;
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


function extraStyles() {
    // toggles
    var outputCssToggles = `/* hi this is the custom settings you set lolz */`;
    if (userConfig.endScreenToggle == false) {
        outputCssToggles += `
        .ytp-ce-element.ytp-ce-element-show {
            display: none !important;
        }
        `
    } if (userConfig.embedOtherVideos == false) {
        outputCssToggles += `
        .ytp-expand-pause-overlay .ytp-pause-overlay {
            display: none !important;
        }
        `
    } if (userConfig.autoplayButton == false) {
        outputCssToggles += `
        .ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"] {
            display: none !important;
        }
        `
    } if (userConfig.heatMapToggle == false) {
        outputCssToggles += `
        .ytp-progress-bar-container .ytp-heat-map-container {
            display: none !important;
        }
        `
    }
    // output css
    document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-toggles" type="text/css">${outputCssToggles}</style>`);

    // Import 3rd-party CSS
    var thirdPartyCSS = runtime.getURL(`css/3rd-party-style.css`);
    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-3rd-party" rel="stylesheet" type="text/css" href="${thirdPartyCSS}">`);
}

function startPlayer() {    
    // Make sure player part of the script is loaded on "watch" pages.
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
                    var link = runtime.getURL(`css/${userConfig.year}.css`);
                    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-base" rel="stylesheet" type="text/css" href="${link}">`);
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

                    #container .ytp-chrome-bottom .ytp-chrome-controls:before {
                        position: absolute;
                        content:"";
                        height:100%;
                        width:100%;
                        top:0;
                        left:0;
                        background: linear-gradient(rgb(0 0 0 / 35%), rgb(255 255 255 / 35%));
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
                    // output css
                    document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-custom-theme-for-2010" type="text/css">${CustomThemeCss2010}</style>`);
                }
            break;

            default:
                console.error(`PLAYERTUBE ERROR:`, `no userConfig.year is selected, please fix that.`);
            break;
        };

        // End Start Checker
        clearInterval(starter);
    }, 1000);
}