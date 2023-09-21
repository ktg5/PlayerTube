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
    // First-time ppl & release note checking.
    releaseNote: 0,

    // Basic settings.
    year: '2015',
    autoplayButton: false,
    heatMapToggle: true,
    endScreenToggle: true,
    embedOtherVideos: true,
    customTheme: false,

    // Only for custom themes.
    controlsBack: null,
    progressBarColor: null,
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

    /// Make opinions in menu
    function makeMenuOption(type, opinion, desc, values) {
        switch (type) {
            case 'selection':
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <select class="menu-select menu-action" name="${opinion}">
                        ${values}
                    </select>
                </div>
                `
            case 'toggle':
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <button class="menu-toggle menu-action" name="${opinion}">
                        <div class="light ${userConfig[opinion]}"></div>
                    </button>
                </div>
                `
            case 'input':
                if (values == 'color') {
                    return `
                    <div class="menu-option">
                        <div class="menu-name">${desc}</div>
                        <div style="position: relative; left: 12px;">
                            <input type="text" data-coloris class="menu-color-picker menu-action" name="${opinion}" value="${userConfig[opinion] ?? '#ffffff'}">
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
                            <input type="text" class="menu-input menu-action" name="${opinion}" value="${userConfig[opinion] ??  ''}">
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
                            <input type="text" style="width: 4em;" class="menu-input menu-action" name="${opinion}" value="${userConfig[opinion] ??  ''}">px
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
                            <input type="text" class="menu-input menu-action" name="${opinion}" value="${userConfig[opinion] ??  ''}">
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

            <h3>General Settings</h3>

            ${makeMenuOption(`selection`, `year`, `Change year of Player`, yearOptions)}

            ${makeMenuOption(`toggle`, `autoplayButton`, `Toggle the Autoplay toggle on the right-side of the player`)}

            ${makeMenuOption(`toggle`, `heatMapToggle`, `Toggle the Heat Map on the top of the Progress Bar`)}

            ${makeMenuOption('toggle', 'endScreenToggle', 'Toggle end screen (The buttons that display at the end of a video)')}

            ${makeMenuOption('toggle', 'embedOtherVideos', 'Toggle the "Show other videos" box in embeds')}

            <br>

            <h3>Custom Theme Settings</h3>

            ${makeMenuOption('toggle', 'customTheme', 'Toggle Custom Theme')}

            <div id='menu-custom-opinions'></div>

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
    }, 1);

    if (userConfig.customTheme === true) {
        document.getElementById(`menu-custom-opinions`).insertAdjacentHTML(
            `afterbegin`,

            `
            <b>
                Note: You're editing raw CSS values. If something like
                the Scrubber doesn't seem to appear, try changing the
                Scrubber size. Else, open up your browser's Developer Tools.
            </b>
            ${makeMenuOption('input', 'controlsBack', 'Change the color of the player\'s background', 'color')}

            ${makeMenuOption('input', 'progressBarColor', 'Change the color of the Progress Bar', 'color')}

            ${makeMenuOption('input', 'volumeSliderBack', 'Change the color of the Volume Silder', 'color')}
            <div class='menu-opinion-note'>If you want to use the exact same color as the Progress Bar for the Volume Silder, you don't need to change this value.</div>

            ${makeMenuOption('input', 'scrubberIcon', 'Change the image of the Scrubber', 'url')}

            ${makeMenuOption('input', 'scrubberIconHover', 'Change the image of the Scrubber <b>when hovering</b>', 'url')}
            <div class='menu-opinion-note'>If you want to use the same image for the value above, you don't need to change this value.</div>

            ${makeMenuOption('input', 'scrubberSize', 'Change the size of the Scrubber', 'pxs')}
            <div class='menu-opinion-note'>It is recommended to change this if you change the Scrubber icon; start low (Something like <kbd>12</kbd>) then go up</div>

            ${makeMenuOption('input', 'scrubberHeight', 'Change the height of the Scrubber', 'pxs')}
            <div class='menu-opinion-note'>If you want to use the same width value on here, don't change this value.</div>

            ${makeMenuOption('input', 'scrubberWidth', 'Change the width of the Scrubber', 'pxs')}
            <div class='menu-opinion-note'>If you want to use the same height value on here, don't change this value.</div>

            ${makeMenuOption('input', 'scrubberTop', 'Move the Scrubber down (Make value negative to move up)', 'pxs')}

            ${makeMenuOption('input', 'scrubberLeft', 'Move the Scrubber right (Make value negative to move left)', 'pxs')}

            ${makeMenuOption('input', 'scrubberPosition', 'If needed, change the Scrubber image position.', 'text')}
            <div class='menu-opinion-note'>
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

    document.getElementById(`menu-config-selection`).insertAdjacentHTML(
        `afterend`,
        
        `
        <button class="menu-apply-overwrite-button">
            Apply settings
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
    console.log(buttons)
    for (let element of buttons) {
        console.log(element);
        switch (element.classList[0]) {
            case 'menu-select':
                element.addEventListener('click', async () => {
                    changeUserDB(element.name, element.value);
                });
            break;

            case 'menu-toggle':
                element.addEventListener('click', async () => {
                    changeUserDB(element.name, '', element);
                });
            break;

            case 'menu-input':
                element.addEventListener('change', async () => {
                    changeUserDB(element.name, element.value);
                });
            break;

            case 'menu-color-picker':
                element.addEventListener('change', async () => {
                    changeUserDB(element.name, element.value);
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