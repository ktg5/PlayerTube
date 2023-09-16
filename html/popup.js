// Shortcuts
var browser = browser;
if (navigator.userAgent.includes("Chrome")) { 
    browser = chrome 
};
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

// Get config
storage.get(['PTConfig'], function(result) {
	if (result) {
		var userConfig = result.PTConfig;
        start(userConfig);
	}
});

/// Version
var version = runtime.getManifest().version;

function start(userConfig) {
    console.log(userConfig);

    /// Update User DB
    function changeUserDB(option, newValue, lightElement) {
        if (lightElement) {
            if (lightElement.children[0].classList.contains('true')) {
                lightElement.children[0].classList.remove('true');
                lightElement.children[0].classList.add('false');
                userConfig[option] = false;
                storage.set(userConfig);
            } else if (lightElement.children[0].classList.contains('false')) {
                lightElement.children[0].classList.remove('false');
                lightElement.children[0].classList.add('true');
                userConfig[option] = true;
                storage.set(userConfig);
            } else {
                lightElement.children[0].classList.add('true');
                userConfig[option] = true;
                storage.set(userConfig);
            }
        } else {
            userConfig[option] = newValue;
            storage.set(userConfig);
        }
        console.log(`YT-HTML5 USER DATA CHANGED:`, GM_getValue(`yt-html5`));
    }

    /// Reset settings cuz I've been having to manually do it so many times YOU DON'T KNOW BRO IT GETS TO ME MAN!!!!!!!!!
    function resetConfig() {
        GM_setValue(`yt-html5`, def_yt_html5);
        console.log(`YT-HTML5 USER DATA RESET:`, GM_getValue(`yt-html5`));
        alert(`Your YT-HTML5-Player config has been reset, please refresh the page!!!`);
    }

    /// Make opinions in menu
    function makeMenuOption(type, opinion, desc, values) {
        switch (type) {
            case 'selection':
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <select onchange="changeUserDB('${opinion}', this.value)">
                        ${values}
                    </select>
                </div>
                `
            case 'toggle':
                return `
                <div class="menu-option">
                    <div class="menu-name">${desc}</div>
                    <button class="menu-toggle" onclick="changeUserDB('${opinion}', '', this)">
                        <div class="light ${userConfig[opinion]}"></div>
                    </button>
                </div>
                `
            case 'input':
                if (values == 'color') {
                    return `
                    <div class="menu-option">
                        <div class="menu-name">${desc}</div>
                        <div style="position: absolute; right: 14px;">
                            <input type="color" class="menu-input" onchange="changeUserDB('${opinion}', this.value); this.style.background = this.value;" style="background: ${userConfig[opinion] ?? '#ffffff'};" value="${userConfig[opinion] ?? '#ffffff'}">
                            <button class='menu-input-reset' style="width: 2em;" onclick="changeUserDB('${opinion}', null); this.parentElement.children[0].value = '#ffffff'; this.parentElement.children[0].style.background = '#ffffff'; alert('The ${opinion} setting has been reset.')">
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
                            <input type="text" class="menu-input" onchange="changeUserDB('${opinion}', this.value)" value="${userConfig[opinion] ??  ''}">
                            <button class='menu-input-reset' style="width: 2em;" onclick="changeUserDB('${opinion}', null); this.parentElement.children[0].value = ''; alert('The ${opinion} setting has been reset.')">
                                <img src="https://raw.githubusercontent.com/ktg5/YT-HTML5-Player/main/img/reset.png" style="height: 1em;">
                            </button>
                        </div>
                    </div>
                    `
                } else if (values == 'pxs') {
                    return `
                    <div class="menu-option">
                        <div class="menu-name" style="max-width: 12em;">${desc}</div>
                        <div style="position: absolute; right: 14px;">
                            <input type="text" style="width: 4em;" class="menu-input" onchange="changeUserDB('${opinion}', this.value)" value="${userConfig[opinion] ??  ''}">px
                            <button class='menu-input-reset' style="width: 2em;" onclick="changeUserDB('${opinion}', null); this.parentElement.children[0].value = ''; alert('The ${opinion} setting has been reset.')">
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
                            <input type="text" class="menu-input" value="${userConfig[opinion] ??  ''}" onchange="
                            if (this.value.startsWith('https://')) {
                                changeUserDB('${opinion}', this.value)
                            } else {
                                alert(\`That link didn't start in 'https://'!\`)
                            }
                            ">
                            <button class='menu-input-reset' style="width: 2em;" onclick="changeUserDB('${opinion}', null); this.parentElement.children[0].value = ''; alert('The ${opinion} setting has been reset.')">
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
                    output += ` "${element}": ${userConfig[element]}`
                } else if (userConfig[element]) {
                    output += ` "${element}": "${userConfig[element]}"`
                }
            } else {
                if (typeof userConfig[element] !== 'string') {
                    output += ` "${element}": ${userConfig[element]},`
                } else if (userConfig[element]) {
                    output += ` "${element}": "${userConfig[element]}",`
                }
            }
        }
        output += '}'
        console.log(`getUserConfigText`, output)
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
            if (def_yt_html5[element] === undefined) {
                unknownCount++;
            } else {
                userConfig[element] = jsonInput[element];
                completedCount++;
            }
        }
        GM_setValue(`yt-html5`, userConfig);

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
            >
                ${collectedUserConfig}
            </textarea>
        </div>
        `
    )

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

            ${makeMenuOption('input', 'scrubberWidth', 'Change the width of the Scrubber', 'pxs')}

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
        <button onclick='overWriteUserConfig(document.getElementById(\`menu-config-selection\`).value)'>
            Apply settings
        </button>

        <br>
        <br>

        <button class="nuke-all" onclick="resetConfig()">
            THE BIG NUKE BUTTON. (aka reset all settings) NO TURNING BACK WHEN THIS IS PRESSED.
        </button>

        <div class="blank"></div>
    `)
}