const fs = require('fs-extra');
const path = require('path');
const Zip = require('adm-zip');
const v3Process = require('./v3Maker');
const process = require('process');
const readline = require('readline');


// Before starting, make sure that the other folders don't exist.
var chromeDir = 'dist/PlayerTube-Chrome';
var firefoxDir = 'dist/PlayerTube-Firefox';
if (fs.existsSync(`dist`)) {
    console.log(`Deleting past dist folder`);
    fs.rmSync(`dist`, { recursive: true });
    console.log(`Deleted past dist folder`);
}
fs.mkdirSync(`dist`);


// Function to copy all the dirs but not REALLY all of them.
async function copyDir(sourceDir, newDir) {
    // Get dirs in the project folder.
    var dirs = fs.readdirSync(sourceDir, { withFileTypes: true });
    fs.mkdirSync(newDir);
    
    // now we finna do something with all of these dirs
    for (let entry of dirs) {
        // Folders & files that we AIN'T ALLOWIN'!
        if (
            entry.name === '.git' ||
            entry.name === '.github' ||
            entry.name === 'psds' ||
            entry.name === 'node_modules' ||
            entry.name === 'dist' ||
            entry.name === 'build.js' ||
            entry.name === 'v3Maker.js' ||
            entry.name === 'v3elmnts.json' ||
            entry.name === 'package-lock.json' ||
            entry.name === 'package.json'
        ) continue;

        // If the files passed the vibe check, we go.
        const sourcePath = path.join(sourceDir, entry.name);
        const newPath = path.join(newDir, entry.name);
        if (entry.isDirectory()) {
            await copyDir(sourcePath, newPath);
        } else {
            fs.copyFileSync(sourcePath, newPath);
        }
    }
}

console.log(`-------------`);

// Here's we build.
// So first, let's copy this folder for Chrome.
copyDir('./', chromeDir).then(async () => {
    console.log(`(Re)made the Chrome folder`);

    // If the zip already exists...
    if (fs.existsSync(`${chromeDir}.zip`)) {
        console.log("Deleting old Chrome zip");
        fs.unlinkSync(`${chromeDir}.zip`);
        console.log("Deleted old Chrome zip");
    }

    console.log("Zipping Chrome version...");
    // Try to zip up the extension
    try {
        const zip = new Zip();
        const outputDir = `${chromeDir}.zip`;
        zip.addLocalFolder(chromeDir);
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`WHAT THE FRICK! ${e}`);
    }
    console.log(`Zipped Chrome version into ${chromeDir}.zip`);
    console.log(`-------------`);
});

// Then we copy the same folder for Firefox.
copyDir('./', firefoxDir).then(async () => {
    console.log(`(Re)made the Firefox folder`);
    // Then we modify the Firefox extension a bit cuz no
    // browser developer can come up with extension
    // manifest standards like WHY.
    var firefoxManifest = JSON.parse(fs.readFileSync(`${firefoxDir}/manifest.json`, { encoding: 'utf8' }));
    firefoxManifest.manifest_version = 2;
    firefoxManifest.background = {
        "scripts": [
        "src/pt-background.js"
        ],
        "persistent": false,
        "type": "module"
    }; // Add this so Firefox extension can work
    firefoxManifest.browser_specific_settings = {
        "gecko": {  
            "id": "{925b0516-774d-469d-bb0e-2b94f199b29a}"
        }
    };
    firefoxManifest.browser_action = {
        "default_popup": "html/popup.html",
        "default_icon": "img/playertube/icon.png"
    }; // Popups
    firefoxManifest.web_accessible_resources = [
        "css/*"
    ],
    delete firefoxManifest.action; // Manifest v2 moment
    delete firefoxManifest.background.service_worker; // This is only for Chrome, Firefox will freak out if this isn't deleted lol.
    // Write the manifest file for Firefox
    fs.writeFileSync(`${firefoxDir}/manifest.json`, JSON.stringify(firefoxManifest, null, 2));

    // Since v1.6, we also have to replace all the "chrome-extension://" with "moz-extension://"
    // WHY CAN'T IT JUST BE "extension://" OR SOMETHING??????
    console.log('Replacing all css files that include "chrome-extension://" with "moz-extension://"');
    // For each CSS file, do the replacing moment for both vanilla css and v3 css
    async function replaceChromewithMoz(cssFiles) {
        let fsCssFiles = fs.readdirSync(cssFiles);
        fsCssFiles.forEach(cssFileName => {
            let cssPath = `${firefoxDir}/css/${cssFileName}`;
            // Make sure cssPath has an extension
            if (cssPath.endsWith('.css')) {
                process.stdout.write(`> ${cssPath}`);
                // Read the CSS file
                let cssFile = fs.readFileSync(cssPath, { encoding: 'utf8' });
                // Replace all chrome-extension:// with moz-extension://
                cssFile = cssFile.replaceAll('chrome-extension://', 'moz-extension://');
                // Then write the CSS file with "cssFile"
                fs.writeFileSync(cssPath, cssFile);
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(`✓ ${cssPath}\n`);
            }
        });
    };
    await replaceChromewithMoz(`${firefoxDir}/css/`);
    await replaceChromewithMoz(`${firefoxDir}/css/v3/`);

    console.log(`Replace complete.`);

    // If the zip already exists...
    if (fs.existsSync(`${firefoxDir}.zip`)) {
        console.log("Deleting old Firefox zip");
        fs.unlinkSync(`${firefoxDir}.zip`);
        console.log("Deleted old Firefox zip");
    }

    console.log("Zipping Firefox version...");
    // Try to zip up the extension
    try {
        const zip = new Zip();
        const outputDir = `${firefoxDir}.zip`;
        zip.addLocalFolder(firefoxDir);
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`WHAT THE FRICK! ${e}`);
    }
    console.log(`Zipped Firefox version into ${firefoxDir}.zip`);
    // End
    console.log(`-------------`);
});