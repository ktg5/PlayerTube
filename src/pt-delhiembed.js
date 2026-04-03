/**
 * YouTube's new embed ui uses a entirely new HTML structure, meaning any of the changes
 * PlayerTube makes already can not be used with this new UI, which is why this script
 * exists. What is does is move elements around to try to make the new UI look like the
 * it's older self. It's a bit hacky, but it works for the moment.
 * 
 * If you're interesting the entirely bringing back the old UI, look at the
 * `pt-delhiembed-alt.js` script. I've already made a proof of concept that simply
 * pastes a string with the older UI HTML into the already existing '#ytd-player'
 * element--since it's still there in the new embed UI.
 * 
 * If YouTube merges this to the main page, I'm archiving this extension. Deadass.
 * 
 * Okay well that is if anything comes out of the alt script. But still, I won't be
 * dealing with reworking fuckin' everything I worked on for the past 4 years lmao.
 * 
 * -ktg5 2026
 */


// Shortcuts
if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;


/**
 * Inserts `element` next to `paste`. Will search for element infinitely until it succeeds
 * @param {string} element The element query name to move
 * @param {string} paste The element query name for the `element` value to be moved next to
 * @returns {void}
 */
function moveElementInf(element, paste) {
    let moveInt;

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
                clearInterval(moveInt);
                return console.error('moveElement: pasteDiv already has element', logData);
            } else if (elementDiv.parentElement.contains(elementDiv)) {
                pasteDiv.parentNode.insertBefore(elementDiv, pasteDiv.parentNode.firstElementChild);
                clearInterval(moveInt);
                return console.log('moveElement: move successful', logData)
            } else {
                return console.log('moveElement: something else failed', logData);
            }
        // } else {
        //     return console.error('moveElement: elements can\'t be found.', logData);
        }
    }

    moveInt = setInterval(imove, 500);
};


window.addEventListener('load', () => {
    // load CSS
    const cssLink = runtime.getURL(`css/delhiembed.css`);
    document.body.insertAdjacentHTML('afterbegin', `<link id="playertube-css" class="playertube-delhiembed" rel="stylesheet" type="text/css" href="${cssLink}">`);


    // move elements
    moveElementInf('.player-controls-top-right', '.quick-actions-wrapper');             // move ctrls on top right
    moveElementInf('.player-settings-icon', '.watch-on-youtube-button-wrapper');        // move settings icon to right
    moveElementInf('.player-control-play-pause-icon', '.quick-actions-wrapper');        // move play/pause btn
    moveElementInf('yt-closed-captions-toggle-button', '.player-settings-icon');        // captions btn


    // custom moving stuffs
    let rightCtrlsDiv, fullscreenBtn;
    function reInitIntReqs() {
        rightCtrlsDiv = document.querySelector('.quick-actions-wrapper');
        fullscreenBtn = document.querySelector('button.fullscreen-icon');
    }
    reInitIntReqs();
    const customMoveInt = setInterval(() => {
        if (
            rightCtrlsDiv
            && fullscreenBtn) 
        {
            // clear interval
            clearInterval(customMoveInt);


            // button's here--move elmnts
            /// buttons
            rightCtrlsDiv.insertAdjacentElement('beforeend', document.querySelector('.action-menu-engagement-buttons-wrapper'));
            rightCtrlsDiv.insertAdjacentElement('beforeend', document.querySelector('.watch-on-youtube-button-wrapper'));
            rightCtrlsDiv.insertAdjacentElement('beforeend', document.querySelector('button.fullscreen-icon'));

            /// time display
            let ctrlsInsert = document.querySelector('.ytwPlayerTopControlsPlayerControlsTopRight');
            if (!ctrlsInsert) ctrlsInsert = document.querySelector('.icon-button.player-control-play-pause-icon');
            ctrlsInsert.insertAdjacentElement('afterend', document.querySelector('player-time-display'));


            // config stuff
            let configCSSOutput = '/* hi this is the custom settings you set lolz */';
            if (userConfig.embedOtherVideos !== true) {
                configCSSOutput += `

.ytmFullscreenRelatedVideosEntryPointViewModelHost {
    display: none !important;
}
                `;
            } if (userConfig.togglePaidContent !== true) {
                configCSSOutput += `

ytm-paid-content-overlay-renderer {
    display: none !important;
}
                `;
            }
            /// make css div with config changes
            document.body.insertAdjacentHTML('afterbegin', `<style id="playertube-css" class="playertube-toggles" type="text/css">${configCSSOutput}</style>`);
        } else reInitIntReqs();
    }, 500);
});
