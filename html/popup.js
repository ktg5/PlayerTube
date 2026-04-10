var styles3 = [
    'background: linear-gradient(#06d316, #075702)'
    , 'border: 5px solid rgb(255 255 255 / 10%)'
    , 'color: white'
    , 'display: block'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
].join(';');


// Shortcuts
var browser = browser;
if (navigator.userAgent.includes("Chrome")) { 
    browser = chrome 
};
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;


// Default config
var def_pt_config;

var userConfig;
var langJson;


// Init document
document.head.insertAdjacentHTML(
    'afterend',

    `
    <div id="content"></div>
    `
)


/**
 * @param {Error} error must be a Error class
 */
function logError(error) {
    const errorLogDiv = document.querySelector('#error-log');
    errorLogDiv.style.display = 'block';

    const stackLine = error.stack?.split("\n")[1]?.trim();
    console.log(stackLine);
    const textArea = errorLogDiv.querySelector('textarea');
    textArea.innerHTML = textArea.innerHTML + `${textArea.innerHTML !== '' ? '\n\n' : ''}${error}\n` + stackLine;

    return console.error(new Error(error));
}


// Get config
storage.get(['PTConfig'], async function(result) {
    // Also get default config
    await fetch(`${location.origin}/default-config.json`).then(async (d) => {
        const json = await d.json();
        def_pt_config = json;
    });


    if (result.PTConfig == undefined) {
        storage.set({PTConfig: def_pt_config}, async function(newResult) {
            var newConfig = await storage.get(['PTConfig']);
            userConfig = newConfig.PTConfig;
            start(userConfig);
        });
    } else {
        userConfig = result.PTConfig;
        start(userConfig);
    }
});


/**
 * Get normal option values but also sub-options too
 * @param {string} option 
 * @param {boolean} [useDef] if true, pull info from the default config
 * @returns { { parent: object, key: string } | null }
 */
function getSetting(option, useDef = false) {
    try {
        const keys = option.split('.');
        const last = keys.pop();
        
        const parent = keys.reduce((acc, key) => acc?.[key], useDef ? def_pt_config : userConfig);

        if (
            parent === undefined
            || last === undefined
        ) throw new Error(`getSetting(): could not get "parent" or "last". data: ${JSON.stringify({
            parent: parent === undefined ? "undefined" : parent,
            last: last === undefined ? "undefined" : last
        })}`);

        return { parent, key: last };
    } catch (error) {
        logError(error);
        logError(new Error(`getSetting(): failed!! option tried to get: ${option}`));

        if (option.includes('.')) {
            const optionSplit = option.split('.');

            if (typeof def_pt_config[optionSplit[0]] !== 'object') return;

            console.log(userConfig);
            if (typeof userConfig[optionSplit[0]] !== 'object') userConfig[optionSplit[0]] = structuredClone(def_pt_config[optionSplit[0]]);
            storage.set({PTConfig: userConfig});
            location.reload();
        }

        return null;
    }
}


/// Version
var version = runtime.getManifest().version;

async function start(userConfig) {
    try {

        console.log(`%cPLAYERTUBE USER DATA:`, styles3, userConfig);

        /// Set language if not set
        if (!userConfig.lang) {
            userConfig.lang = 'en';
            await storage.set({PTConfig: userConfig});
        }
        /// Get language file
        await fetch(`${location.origin}/lang/${userConfig.lang}/settings.json`).then(async (d) => {
            const json = await d.json();
            langJson = json;
        });

        /// Update User DB
        async function changeUserDB(option, newValue, lightElement) {
            console.log(option);
            const { parent, key } = getSetting(option);

            if (newValue == "") newValue = null;
            if (lightElement) {
                if (lightElement.children[0].classList.contains('true')) {
                    lightElement.children[0].classList.remove('true');
                    lightElement.children[0].classList.add('false');
                    parent[key] = false;
                    await storage.set({PTConfig: userConfig});
                } else if (lightElement.children[0].classList.contains('false')) {
                    lightElement.children[0].classList.remove('false');
                    lightElement.children[0].classList.add('true');
                    parent[key] = true;
                    await storage.set({PTConfig: userConfig});
                } else {
                    lightElement.children[0].classList.add('true');
                    parent[key] = true;
                    await storage.set({PTConfig: userConfig});
                }
            } else {
                parent[key] = newValue;
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
        function makeMenuOption(type, option, values, disableOpinions) {
            const { parent, key } = getSetting(option);

            const optionTxt = langJson[option];

            function makeOptionNote() {
                function escapeHTML(str) {
                    return str
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                }

                if (optionTxt.desc) return `<span class="menu-option-note">${escapeHTML(optionTxt.desc)}</span>`;
                else return '';
            }


            switch (type) {
                case 'selection':
                    var disabledOutput = ``;
                    if (disableOpinions) {
                        disabledOutput = `aria-disabled='${disableOpinions}'`
                    }
                    return `
                    <div class="menu-option">
                        <div class="menu-name">${optionTxt.title}</div>
                        <select class="menu-select menu-action" name="${option}" ${disabledOutput}>
                            ${values}
                        </select>
                    </div>
                    ${makeOptionNote()}
                    `
                case 'toggle':
                    var disabledOutput = ``;
                    if (disableOpinions) disabledOutput = `aria-disabled='${disableOpinions}'`;
                    return `
                    <div class="menu-option">
                        <div class="menu-name">${optionTxt.title}</div>
                        <button class="menu-toggle menu-action" name="${option}" ${disabledOutput}>
                            <div class="light ${parent[key]}"></div>
                        </button>
                    </div>
                    ${makeOptionNote()}
                    `
                case 'input':
                    var disabledOutput = ``;
                    if (disableOpinions) {
                        disabledOutput = `aria-disabled='${disableOpinions}'`
                    }
                    if (values == 'color') {
                        return `
                        <div class="menu-option">
                            <div class="menu-name">${optionTxt.title}</div>
                            <div class="menu-option-color" style="position: absolute; right: 0;">
                                <input type="text" data-coloris class="menu-color-picker menu-action" name="${option}" value="${parent[key] ?? '#ffffff'}" ${disabledOutput}>
                                <button class='menu-input-reset menu-action'>
                                    <img src="/img/reset.png" style="height: 1em;">
                                </button>
                            </div>
                        </div>
                        ${makeOptionNote()}
                        `
                    } else if (values == 'text') {
                        return `
                        <div class="menu-option">
                            <div class="menu-name">${optionTxt.title}</div>
                            <div style="position: absolute; right: 0;">
                                <input type="text" class="menu-input menu-action" placeholder="view desc." name="${option}" value="${parent[key] ??  ''}" ${disabledOutput}>
                                <button class='menu-input-reset menu-action' style="width: 2em;">
                                    <img src="/img/reset.png" style="height: 1em;">
                                </button>
                            </div>
                        </div>
                        ${makeOptionNote()}
                        `
                    } else if (values == 'pxs') {
                        return `
                        <div class="menu-option">
                            <div class="menu-name" style="max-width: 12em;">${optionTxt.title}</div>
                            <div style="position: absolute; right: 0;">
                                <input type="number" style="width: 4em;" class="menu-input menu-action" placeholder="0" name="${option}" value="${parent[key] ??  ''}" ${disabledOutput}>px
                                <button class='menu-input-reset menu-action' style="width: 2em;">
                                    <img src="/img/reset.png" style="height: 1em;">
                                </button>
                            </div>
                        </div>
                        ${makeOptionNote()}
                        `
                    } else if (values == 'url') {
                        return `
                        <div class="menu-option">
                            <div class="menu-name">${optionTxt.title} (Must be an <kbd>https</kbd> link!)</div>
                            <div>
                                <input type="url" class="menu-input menu-action" placeholder="https://" name="${option}" value="${parent[key] ??  ''}" ${disabledOutput}>
                                <button class='menu-input-reset menu-action' style="width: 2em;">
                                    <img src="/img/reset.png" style="height: 1em;">
                                </button>
                            </div>
                        </div>
                        ${makeOptionNote()}
                        `
                    }
            }
        }

        /// Get lang options from lang/index.json
        let langOptionsJson = [];
        // Get base langs
        var langOptions = () => {
            let result = '';

            return new Promise(async (resolve, reject) => {
                await fetch(`${location.origin}/lang/index.json`).then(async (d) => {
                    const baseLangs = (await d.json())['_'];

                    // Get index file from each lang folder
                    baseLangs.forEach(async (lang) => {
                        await fetch(`${location.origin}/lang/${lang}/index.json`).then(async (d) => {
                            langOptionsJson.push({ lang: lang, data: await d.json() });

                            // Create HTML options
                            langOptionsJson.forEach(element => {
                                if (element.lang == userConfig['lang']) {
                                    result += `<option value="${element.lang}" selected>${element.data.displayName}</option> `;
                                } else {
                                    result += `<option value="${element.lang}">${element.data.displayName}</option> `;
                                }
                            });

                            resolve(result);
                        });
                    });
                });
            });
        };

        /// Get year options for menu
        var years = [2015, 2013, 2012, 2010, 2006];
        var yearOptions = '';
        years.forEach(element => {
            if (element == userConfig['year']) {
                yearOptions += `<option value="${element}" selected>${element}</option> `;
            } else {
                yearOptions += `<option value="${element}">${element}</option> `;
            }
        });

        /// Get user config to display
        function getUserConfigText() {
            let output = '{';
            var count = 0;
            for (let element in userConfig) {
                count++;
            };
            var counted = 0;
            for (let element in userConfig) {
                const { parent, key } = getSetting(element);

                counted++;

                if (typeof parent[key] === 'object') output += `\n "${element}": ${JSON.stringify(parent[key])}`;
                else if (typeof parent[key] !== 'string') output += `\n "${element}": ${parent[key]}`;
                else if (parent[key]) output += `\n "${element}": "${parent[key]}"`;

                if (counted !== count) output += ',';
            }
            output += '\n}'
            return output;
        };

        /// Get user config but only values under the Custom Theme section
        async function getCustomThemeCfg() {
            let output = {
                controlsBack: userConfig.controlsBack,
                settingsBgColor: userConfig.settingsBgColor,
                progressBarColor: userConfig.progressBarColor,
                progressBarBgColor: userConfig.progressBarBgColor,
                volumeSliderBack: userConfig.volumeSliderBack,
                scrubberIcon: userConfig.scrubberIcon,
                scrubberIconHover: userConfig.scrubberIconHover,
                scrubberPosition: userConfig.scrubberPosition,
                scrubberSize: userConfig.scrubberSize,
                scrubberHeight: userConfig.scrubberHeight,
                scrubberWidth: userConfig.scrubberWidth,
                scrubberTop: userConfig.togglePaidContent,
                scrubberLeft: userConfig.scrubberLeft,
            }

            await navigator.clipboard.writeText(JSON.stringify(output));
            return alert('Custom theme config copied to clipboard!');
        }

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
                    const { parent, key } = getSetting(element);

                    parent[key] = jsonInput[element];
                    completedCount++;
                }
            }
            storage.set({PTConfig: userConfig});

            // Finish
            console.log(`overWriteUserConfig input:`, jsonInput);
            console.log(`overWriteUserConfig current config:`, userConfig);
            alert(`User config completed. ${completedCount} settings were written, ${unknownCount} settings were not written`);
            return;
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

                <div id="top">
                    <div class="about">
                        <img src="../img/playertube/logo-dark.png" style="width: 200px;">
                        <div class="version">v${version}</div>
                    </div>
                    <div class="links">
                        <a href="update.html" target="_blank">Release Notes</a>
                        <a href="https://github.com/ktg5/PlayerTube/issues" target="_blank">Report a Issue</a>
                        <a href="https://ktg5.online" target="_blank">ktg5.online</a>
                    </div>
                </div>


                <h3 class="spacer-top">General Settings</h3>

                ${makeMenuOption('toggle', 'showReleaseNotes')}

                ${makeMenuOption(`selection`, `lang`, await langOptions())}

                ${makeMenuOption(`selection`, `year`, yearOptions)}

                <div id="menu-if-alt-mode"></div>

                ${makeMenuOption('toggle', 'toggleRoundedCorners')}

                ${makeMenuOption(`toggle`, `autoplayButton`)}

                ${makeMenuOption(`toggle`, `heatMapToggle`)}

                ${makeMenuOption(`toggle`, `toggleScrubberThumbs`)}

                ${makeMenuOption(`toggle`, `toggleSpinner`)}

                ${makeMenuOption(`toggle`, `fullyExtendBar`)}

                ${makeMenuOption(`toggle`, `fakeBarToggle`)}

                ${makeMenuOption('toggle', 'toggleMoreVids')}

                ${makeMenuOption('toggle', 'embedOtherVideos')}

                ${makeMenuOption('toggle', 'toggleLessSettings._self')}

                <div id="menu-less-settings" class="sub-options" data-sub-option="toggleLessSettings"></div>

                ${makeMenuOption('toggle', 'toggleFSButtons')}

                ${makeMenuOption(`toggle`, `toggleFadeOut`)}

                ${makeMenuOption('toggle', 'toggleWatermark')}

                ${makeMenuOption('toggle', 'togglePaidContent')}

                ${makeMenuOption('toggle', 'toggleAlterInfo')}

                ${makeMenuOption('toggle', 'toggleInfoCards')}

                ${makeMenuOption('toggle', 'endScreenToggle')}

                <h3 class="spacer-top">Custom Theme Settings</h3>
                <p>
                    PlayerTube has the ability to change the look of it's multiple themes through
                    this menu. If you'd like to learn about how custom themes work & how to make
                    your own, check out the <a href="themes.html" target="_blank">
                    <i>Theme Guide</i></a> that is included with this extension. If you'd like to
                    see some examples of some custom themes,
                    <a href='https://github.com/ktg5/PlayerTube#user-customization' target="_blank">
                    please check out this page on our ReadMe!</a>
                </p>

                ${makeMenuOption('toggle', 'customTheme', null, ['alternateMode'])}

                <div id='menu-custom-options'></div>

                <h3 class="spacer-top">Import, Copy, or Reset Settings</h3>

                <textarea id="menu-config-selection">${collectedUserConfig}</textarea>
            </div>
        `);

        // Move everything to the body element
        setTimeout(() => {
            document.body.appendChild(document.getElementById('yt-html5-menu'));
        }, 10);

        // Checks
        // If theme is 2010 or 2013, show Alternate Theme opinion
        if (
            (userConfig.year == "2010" || userConfig.year == "2013")
            && userConfig.customTheme !== true
        ) {
            document.getElementById('menu-if-alt-mode').insertAdjacentHTML(
                `afterbegin`,
                
                `
                ${makeMenuOption(`toggle`, `alternateMode`)}
                `
            );
        };

        // Options for sub options
        const subOptionDivs = document.querySelectorAll('.sub-options');
        for (let i = 0; i < subOptionDivs.length; i++) {
            const elmnt = subOptionDivs[i];

            const dataSubOption = elmnt.getAttribute('data-sub-option');
            
            if (
                !userConfig[dataSubOption]
                || userConfig[dataSubOption]._self !== true
            ) continue;

            elmnt.setAttribute('active', '');
            const subOptions = getSetting(dataSubOption, true).parent[getSetting(dataSubOption, true).key];

            for (const key in subOptions) {
                if (!Object.hasOwn(subOptions, key)) continue;
                if (key === '_self') continue;
                
                elmnt.insertAdjacentHTML('afterbegin', `
                    ${makeMenuOption('toggle', `toggleLessSettings.${key}`)}
                `);
            }
        };

        // Custom Themes Buttons
        if (userConfig.customTheme == true) customThemeHTML();
        function customThemeHTML() {
            const customThemeDiv = document.querySelector('.menu-custom-theme');
            // Remove the custom theme menu stuff if found
            if (customThemeDiv) customThemeDiv.remove();
            // Else add it
            else document.getElementById(`menu-custom-options`).insertAdjacentHTML(
                `afterbegin`,

                `
                <div class="menu-custom-theme">
                    <b>
                        Note: You're editing raw CSS values. If something like
                        the scrubber doesn't seem to appear, try changing the
                        scrubber size. Else, open up your browser's Developer Tools.
                    </b>

                    <button class="menu-copy-theme spacer-top"><b>Copy Custom Theme Settings to Clipboard</b></button>

                    <b class="spacer-top">Base Color Settings</b>
                    ${makeMenuOption('input', 'controlsBack', 'color')}

                    ${makeMenuOption('input', 'settingsBgColor', 'color')}

                    ${makeMenuOption('input', 'progressBarColor', 'color')}

                    ${makeMenuOption('input', 'progressBarBgColor', 'color')}

                    ${makeMenuOption('input', 'volumeSliderBack', 'color')}

                    <b class="spacer-top">Scrubber Base Settings</b>
                    ${makeMenuOption('input', 'scrubberIcon', 'url')}

                    ${makeMenuOption('input', 'scrubberIconHover', 'url')}

                    <b class="spacer-top">Scrubber Size</b>
                    ${makeMenuOption('input', 'scrubberSize', 'pxs')}

                    ${makeMenuOption('input', 'scrubberHeight', 'pxs')}

                    ${makeMenuOption('input', 'scrubberWidth', 'pxs')}

                    <b class="spacer-top">Scrubber Position</b>
                    ${makeMenuOption('input', 'scrubberTop', 'pxs')}

                    ${makeMenuOption('input', 'scrubberLeft', 'pxs')}

                    ${makeMenuOption('input', 'scrubberPosition', 'text')}
                </div>
                `
            );
        };

        // Ending stuffs
        document.getElementById(`menu-config-selection`).insertAdjacentHTML(
            `afterend`,
            
            `
            <button class="menu-apply-overwrite-button">
                Apply Settings
            </button>

            <button class="menu-nuke-all">
                THE BIG NUKE BUTTON. (aka reset all settings) NO TURNING BACK WHEN THIS IS PRESSED.
            </button>

            <div class="blank"></div>
        `);


        // Event listener to make the BUTTONS ACTUALLY WORK LIKE WHY
        var buttons = document.getElementsByClassName('menu-action');
        for (let element of buttons) {
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
            };

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
                        // If the input is a "url" we should prob do some checks
                        let value = element.value;
                        let linkPassed = true;
                        if (element.getAttribute('type', 'url')) {
                            try {
                                let urlValue = new URL(value);
                                if (urlValue.host !== "i.imgur.com") linkPassed = false;
                            } catch (error) {
                                linkPassed = false;
                            }
                        }
                        if (linkPassed == false) return alert(`A URL option's value under, "${element.parentElement.parentElement.querySelector('.menu-name').innerText}" can not be used. Please make sure the URL is a "i.imgur.com" link.`)

                        changeUserDB(element.name, value);
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
            };
        };


        // Event listeners for reset & overwrite config.
        document.querySelector('.menu-apply-overwrite-button').addEventListener('click', async () => overWriteUserConfig(document.getElementById(`menu-config-selection`).value) );
        document.querySelector('.menu-nuke-all').addEventListener('click', async () => resetConfig() );
        if (document.querySelector('.menu-copy-theme')) document.querySelector('.menu-copy-theme').addEventListener('click', async () => getCustomThemeCfg() );


        // Event listener for showing custom theme buttons
        document.querySelector('.menu-toggle[name="customTheme"]').addEventListener('click', async () => customThemeHTML());
    
    } catch (error) {
        logError(error);
    }
}