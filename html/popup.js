// Shortcuts
var browser = browser;
if (navigator.userAgent.includes("Chrome")) { 
    browser = chrome 
};
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

// Default config
var def_pt_config = {
    // Basic settings.
    year: '2015',
    showReleaseNotes: true,
    darkMode: false,
    fullyExtendBar: false,
    toggleFadeOut: false,
    autoplayButton: false,
    heatMapToggle: false,
    endScreenToggle: true,
    embedOtherVideos: true,
    toggleWatermark: true,
    toggleRoundedCorners: false,
    togglePaidContent: false,
    toggleInfoCards: true,
    customTheme: false,

    // Only for custom themes.
    controlsBack: null,
    settingsBgColor: null,
    progressBarColor: null,
    progressBarBgColor: null,
    volumeSliderBack: null,
    scrubberIcon: null,
    scrubberIconHover: null,
    scrubberPosition: null,
    scrubberSize: null,
    scrubberHeight: null,
    scrubberWidth: null,
    scrubberTop: null,
    scrubberLeft: null,
};

// Init document
document.head.insertAdjacentHTML(
    'afterend',

    `
    <div id="content"></div>
    `
)

// Get config
storage.get(['PTConfig'], async function(result) {
    if (result.PTConfig == undefined) {
        storage.set({PTConfig: def_pt_config}, async function(newResult) {
            var newConfig = await storage.get(['PTConfig']);
            var userConfig = newConfig.PTConfig;
            start(userConfig);
        });
    } else {
        var userConfig = result.PTConfig;
        start(userConfig);
    }
});

/// Version
var version = runtime.getManifest().version;

async function start(userConfig) {

    /// Update User DB
    async function changeUserDB(option, newValue, lightElement) {
        if (newValue == "") newValue = null;
        if (lightElement) {
            if (lightElement.children[0].classList.contains('true')) {
                lightElement.children[0].classList.remove('true');
                lightElement.children[0].classList.add('false');
                userConfig[option] = false;
                await storage.set({PTConfig: userConfig});
            } else if (lightElement.children[0].classList.contains('false')) {
                lightElement.children[0].classList.remove('false');
                lightElement.children[0].classList.add('true');
                userConfig[option] = true;
                await storage.set({PTConfig: userConfig});
            } else {
                lightElement.children[0].classList.add('true');
                userConfig[option] = true;
                await storage.set({PTConfig: userConfig});
            }
        } else {
            userConfig[option] = newValue;
            await storage.set({PTConfig: userConfig});
        }
        console.log(`PLAYERTUBE USER DATA CHANGED:`, await storage.get(['PTConfig']));
    }

    /// Reset settings cuz I've been having to manually do it so many times YOU DON'T KNOW BRO IT GETS TO ME MAN!!!!!!!!!
    function resetConfig() {
        storage.set({PTConfig: def_pt_config});
        console.log(`PLAYERTUBE USER DATA RESET:`, storage.get(['PTConfig']));
        alert(`Your PlayerTube config has been reset, please refresh the page!!!`);
    }

    /// Make options in menu
    function makeMenuOption(type, option, desc, values, disableOpinions) {
        switch (type) {
            case 'selection':
                var disabledOutput = ``;
                if (disableOpinions) {
                    disabledOutput = `aria-disabled='${disableOpinions}'`
                }
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <select class="menu-select menu-action" name="${option}" ${disabledOutput}>
                        ${values}
                    </select>
                </div>
                `
            case 'toggle':
                var disabledOutput = ``;
                if (disableOpinions) {
                    disabledOutput = `aria-disabled='${disableOpinions}'`
                }
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <button class="menu-toggle menu-action" name="${option}" ${disabledOutput}>
                        <div class="light ${userConfig[option]}"></div>
                    </button>
                </div>
                `
            case 'input':
                var disabledOutput = ``;
                if (disableOpinions) {
                    disabledOutput = `aria-disabled='${disableOpinions}'`
                }
                if (values == 'color') {
                    return `
                    <div class="menu-option">
                        <div class="menu-name">${desc}</div>
                        <div style="position: relative; left: 12px;">
                            <input type="text" data-coloris class="menu-color-picker menu-action" name="${option}" value="${userConfig[option] ?? '#ffffff'}" ${disabledOutput}>
                            <button class='menu-input-reset menu-action'>
                                <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                            </button>
                        </div>
                    </div>
                    `
                } else if (values == 'text') {
                    return `
                    <div class="menu-option">
                        <div class="menu-name">${desc}</div>
                        <div>
                            <input type="text" class="menu-input menu-action" name="${option}" value="${userConfig[option] ??  ''}" ${disabledOutput}>
                            <button class='menu-input-reset menu-action' style="width: 2em;">
                                <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                            </button>
                        </div>
                    </div>
                    `
                } else if (values == 'pxs') {
                    return `
                    <div class="menu-option">
                        <div class="menu-name" style="max-width: 12em;">${desc}</div>
                        <div style="position: relative; left: 12px;">
                            <input type="text" style="width: 4em;" class="menu-input menu-action" name="${option}" value="${userConfig[option] ??  ''}" ${disabledOutput}>px
                            <button class='menu-input-reset menu-action' style="width: 2em;">
                                <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                            </button>
                        </div>
                    </div>
                    `
                } else if (values == 'url') {
                    return `
                    <div class="menu-option">
                        <div class="menu-name">${desc} (Must be an <kbd>https</kbd> link!)</div>
                        <div>
                            <input type="text" class="menu-input menu-action" name="${option}" value="${userConfig[option] ??  ''}" ${disabledOutput}>
                            <button class='menu-input-reset menu-action' style="width: 2em;">
                                <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                            </button>
                        </div>
                    </div>
                    `
                }
        }
    }

    /// Get year options for menu
    var years = [2015, 2012, 2010];
    var yearOptions = '';
    years.forEach(element => {
        if (element == userConfig['year']) {
            yearOptions += `<option value="${element}" selected>${element}</option> `
        } else {
            yearOptions += `<option value="${element}">${element}</option> `
        }
    });

    /// Get user config to display
    function getUserConfigText() {
        var output = '{';
        var count = 0;
        for (let element in userConfig) {
            count++;
        };
        var counted = 0;
        for (let element in userConfig) {
            counted++
            if (counted == count) {
                if (typeof userConfig[element] !== 'string') {
                    output += `\n "${element}": ${userConfig[element]}`
                } else if (userConfig[element]) {
                    output += `\n "${element}": "${userConfig[element]}"`
                }
            } else {
                if (typeof userConfig[element] !== 'string') {
                    output += `\n "${element}": ${userConfig[element]},`
                } else if (userConfig[element]) {
                    output += `\n "${element}": "${userConfig[element]}",`
                }
            }
        }
        output += '\n}'
        console.log(`getUserConfigText`, `${output}`)
        return output;
    };

    /// Set user config from input element at the bottom of the settings menu
    function overWriteUserConfig(input) {
        // Starting vars
        var completedCount = 0;
        var unknownCount = 0;

        var jsonInput;
        try {
            jsonInput = JSON.parse(input);
        } catch (error) {
            alert(`A error happened when trying to set the config! Did you put any extra characters?`)
        }
        
        // Check 
        for (let element in jsonInput) {
            if (def_pt_config[element] === undefined) {
                unknownCount++;
            } else {
                userConfig[element] = jsonInput[element];
                completedCount++;
            }
        }
        storage.set({PTConfig: userConfig});

        // Finish
        alert(`User config completed. ${completedCount} settings were written, ${unknownCount} settings were not written`);
        console.log(`overWriteUserConfig input:`, jsonInput);
        console.log(`overWriteUserConfig current config:`, userConfig);
    }

    // Start menu
    var collectedUserConfig = getUserConfigText();
    // Base content
    document.getElementById(`content`).insertAdjacentHTML(
        `beforebegin`,

        `
        <!-- Menu -->
        <div id="yt-html5-menu">
            <a><div class="warning">
                <h3>Reload page for changes to take effect!</h3>
            </div></a>

            <img src="../img/playertube/logo-dark.png" style="width: 200px;">
            <div class="version"> v${version}</div>

            <br>

            <div class="links">
                <a href="release-note.html" target="_blank">Release Notes</a>
                <a href="https://ktg5.online" target="_blank">ktg5.online</a>
            </div>

            <br>

            <h3>General Settings</h3>

            ${makeMenuOption(`selection`, `year`, `Change year of Player`, yearOptions)}

            ${makeMenuOption('toggle', 'showReleaseNotes', 'Toggle Release Notes when reloading or updating PlayerTube')}

            <div id="menu-if-dark-mode"></div>

            ${makeMenuOption('toggle', 'toggleRoundedCorners', 'Toggle rounded corners around a YouTube video')}

            ${makeMenuOption(`toggle`, `autoplayButton`, `Toggle the <a href="https://www.youtube.com/howyoutubeworks/user-settings/autoplay/" target="_blank">Autoplay toggle</a> on the right-side of the player`)}

            ${makeMenuOption(`toggle`, `heatMapToggle`, `Toggle the <a href="https://twitter.com/TeamYouTube/status/1527024322359005189" target="_blank">Heat Map</a> on the top of the Progress Bar (Shows you the most played parts of a video)`)}

            ${makeMenuOption(`toggle`, `fullyExtendBar`, `Fully extend the Progress Bar's height at all times`, null, ['toggleFadeOut'])}

            <div id="menu-toggle-fadeout"></div>

            ${makeMenuOption('toggle', 'toggleWatermark', 'Toggle a <a href="https://support.google.com/youtube/answer/10456525" target="_blank">YouTube channel\'s watermark</a> that displays at the bottom right of YouTube videos')}

            ${makeMenuOption('toggle', 'togglePaidContent', 'Toggle the <a href="https://support.google.com/youtube/answer/154235" target="_blank">Paid Products / Sponsorships</a> popups on videos that are sponsored')}

            ${makeMenuOption('toggle', 'toggleInfoCards', 'Toggle the ability to open the <a href="https://support.google.com/youtube/answer/6140493" target="_blank">Info Cards tab</a>')}

            ${makeMenuOption('toggle', 'endScreenToggle', 'Toggle <a href="https://support.google.com/youtube/answer/6388789" target="_blank">End Screen</a> at the end of videos')}

            ${makeMenuOption('toggle', 'embedOtherVideos', 'Toggle the "Show other videos" box in embeds')}

            <br>

            <h3>Custom Theme Settings</h3>

            ${makeMenuOption('toggle', 'customTheme', 'Toggle Custom Theme', null, ['darkMode'])}

            <div id='menu-custom-options'></div>

            <br>

            <h3>Import, Copy, or Reset Settings</h3>

            <textarea
            id="menu-config-selection"
            style="width: 21.2em; height: 8em; resize: vertical;"
            >${collectedUserConfig}
            </textarea>
        </div>
        `
    )

    // Move everything to the body element
    setTimeout(() => {
        document.body.appendChild(document.getElementById('yt-html5-menu'));
    }, 10);

    // Checks
    if (userConfig.year == "2010") {
        if (userConfig.customTheme !== true) {
            // If Custom Themes aren't enabled, allow dark theme
            document.getElementById('menu-if-dark-mode').insertAdjacentHTML(
                `afterbegin`,
                
                `
                ${makeMenuOption(`toggle`, `darkMode`, `Toggle Dark Mode for your current theme`)}
                <div class='menu-option-note'>Some themes may have dark themes, this one does! <b>Dark Mode will be disabled when custom themes are enabled.</b></div>
                `
            )
        }
        // Remove these when the 2010 theme is enabled
        document.getElementById(`menu-toggle-fadeout`).remove();
    }
    if (userConfig.fullyExtendBar == false && document.getElementById(`menu-toggle-fadeout`)) {
        document.getElementById(`menu-toggle-fadeout`).insertAdjacentHTML(
            `afterbegin`,

            `
            ${makeMenuOption(`toggle`, `toggleFadeOut`, `Fade out YouTube player controls instead of moving them down`)}
            <div class='menu-option-note'>Can't be changed when "Fully extend the Progress Bar" is enabled.</div>
            `
        )
    }

    // Custom Themes Buttons
    if (userConfig.customTheme == true) {
        document.getElementById(`menu-custom-options`).insertAdjacentHTML(
            `afterbegin`,

            `
            <p>
                If you'd like to see some examples of some custom themes,
                <a href='https://github.com/ktg5/PlayerTube#user-customization' target="_blank">
                please check out this page on our ReadMe!</a>
            </p>
            <b>
                Note: You're editing raw CSS values. If something like
                the Scrubber doesn't seem to appear, try changing the
                Scrubber size. Else, open up your browser's Developer Tools.
            </b>

            <br>
            <br>

            <b>Base Color Settings</b>
            ${makeMenuOption('input', 'controlsBack', 'Change the color of the player\'s background', 'color')}

            ${makeMenuOption('input', 'settingsBgColor', 'Change the color of the player\'s settings background', 'color')}

            ${makeMenuOption('input', 'progressBarColor', 'Change the color of the Progress Bar', 'color')}

            ${makeMenuOption('input', 'progressBarBgColor', 'Change the background color of the Progress Bar', 'color')}

            ${makeMenuOption('input', 'volumeSliderBack', 'Change the color of the Volume Silder', 'color')}
            <div class='menu-option-note'>If you want to use the exact same color as the Progress Bar for the Volume Silder, you don't need to change this value.</div>

            <br>
            <b>Scrubber Base Settings</b>
            ${makeMenuOption('input', 'scrubberIcon', 'Change the image of the Scrubber', 'url')}

            ${makeMenuOption('input', 'scrubberIconHover', 'Change the image of the Scrubber <b>when hovering</b>', 'url')}
            <div class='menu-option-note'>If you want to use the same image for the value above, you don't need to change this value.</div>

            <br>
            <b>Scrubber Size</b>
            ${makeMenuOption('input', 'scrubberSize', 'Change the size of the Scrubber', 'pxs')}
            <div class='menu-option-note'>It is recommended to change this if you change the Scrubber icon; start low (Something like <kbd>12</kbd>) then go up</div>

            ${makeMenuOption('input', 'scrubberHeight', 'Change the height of the Scrubber', 'pxs')}
            <div class='menu-option-note'>If you want to use the same width value on here, don't change this value.</div>

            ${makeMenuOption('input', 'scrubberWidth', 'Change the width of the Scrubber', 'pxs')}
            <div class='menu-option-note'>If you want to use the same height value on here, don't change this value.</div>

            <br>
            <b>Scrubber Position</b>
            ${makeMenuOption('input', 'scrubberTop', 'Move the Scrubber down (Make value negative to move up)', 'pxs')}

            ${makeMenuOption('input', 'scrubberLeft', 'Move the Scrubber right (Make value negative to move left)', 'pxs')}

            ${makeMenuOption('input', 'scrubberPosition', 'If needed, change the Scrubber image position.', 'text')}
            <div class='menu-option-note'>
                Example: <kbd>10px (for x) 5px (for y)</kbd>
                <br>
                Note this <b>does not</b> change where the
                Scrubber will be moved to, you still have to
                play off of all the other sizing settings
                above.
            </div>
            `
        )
    }

    // Ending stuffs
    document.getElementById(`menu-config-selection`).insertAdjacentHTML(
        `afterend`,
        
        `
        <button class="menu-apply-overwrite-button">
            Apply Settings
        </button>

        <br>
        <br>

        <button class="menu-nuke-all">
            THE BIG NUKE BUTTON. (aka reset all settings) NO TURNING BACK WHEN THIS IS PRESSED.
        </button>

        <div class="blank"></div>
    `)

    // Event listener to make the BUTTONS ACTUALLY WORK LIKE WHY
    var buttons = document.getElementsByClassName('menu-action');
    console.log(`buttons:`, buttons)
    for (let element of buttons) {
        console.log(element);

        // For disabling opinions that conflict with others
        function disableAria(element) {
            if (element.ariaDisabled !== null) {
                var disableThese = element.ariaDisabled.split(',');
                disableThese.forEach(target => {
                    var targetElement = document.getElementsByName(`${target}`)[0];
                    if (targetElement) {
                        if (element.childNodes[1].classList.contains('true')) {
                            targetElement.style.display = 'none';
                        } else if (element.childNodes[1].classList.contains('false')) {
                            targetElement.style.display = '';
                        }
                    }
                });
            };
        }

        switch (element.classList[0]) {
            case 'menu-select':
                element.addEventListener('click', async () => {
                    changeUserDB(element.name, element.value);
                    disableAria(element);
                });
            break;

            case 'menu-toggle':
                element.addEventListener('click', async () => {
                    changeUserDB(element.name, '', element);
                    if (element.childNodes[1].classList.contains("undefined")) element.childNodes[1].classList.remove('undefined')
                    disableAria(element);
                });
            break;

            case 'menu-input':
                element.addEventListener('change', async () => {
                    changeUserDB(element.name, element.value);
                    disableAria(element);
                });
            break;

            case 'menu-color-picker':
                element.addEventListener('change', async () => {
                    changeUserDB(element.name, element.value);
                    disableAria(element);
                });
            break;

            case 'menu-input-reset':
                element.addEventListener('click', async () => {
                    if (element.parentElement.children[0].classList.contains('clr-field')) {
                        var clr_field = element.parentElement.children[0];
                        changeUserDB(clr_field.children[1].name, null);
                        clr_field.children[1].value = '#ffffff';
                        clr_field.style.color = '#ffffff';
                        alert(`The "${clr_field.children[1].name}" setting has been reset.`);
                    } else {
                        changeUserDB(element.parentElement.children[0].name, null);
                        element.parentElement.children[0].value = '';
                        alert(`The "${element.parentElement.children[0].name}" setting has been reset.`);
                    }
                    disableAria(element);
                });
            break;

            default:
                alert(`One of the buttons for the settings can't find itself, please report this! "${element.classList}"`)
            break;
        }
    }
    // Event listeners for reset & overwrite config.
    document.getElementsByClassName('menu-apply-overwrite-button')[0]
    .addEventListener('click', async () => {
        overWriteUserConfig(document.getElementById(`menu-config-selection`).value)
    });

    document.getElementsByClassName('menu-nuke-all')[0]
    .addEventListener('click', async () => {
        resetConfig()
    });

}