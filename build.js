const fs = require('fs-extra');
const fsPromises = require('fs/promises');
const path = require('path');
const Zip = require('adm-zip');


// Before starting, make sure that the other
// folders don't exist.
var chromeDir = '../PlayerTube-Chrome';
var firefoxDir = '../PlayerTube-Firefox';
if (fs.existsSync(chromeDir)) {
    console.log(`Deleting past Chrome folder`);
    fs.rmSync(chromeDir, { recursive: true });
    console.log(`Deleted past Chrome folder`);
}
if (fs.existsSync(firefoxDir)) {
    console.log(`Deleting past Firefox folder`);
    fs.rmSync(firefoxDir, { recursive: true });
    console.log(`Deleted past Firefox folder`);
}

// Function to copy all the dirs but not REALLY all of them.
async function copyDir(sourceDir, newDir) {
    // Get dirs in the project folder.
    var dirs = await fsPromises.readdir(sourceDir, { withFileTypes: true });
    await fsPromises.mkdir(newDir);
    
    // now we finna do something with all of these dirs
    for (let entry of dirs) {
        // Folders & files that we AIN'T ALLOWIN'!
        if (
            entry.name === '.git' ||
            entry.name === '.github' ||
            entry.name === 'psds' ||
            entry.name === 'node_modules' ||
            entry.name === 'build.js' ||
            entry.name === 'package-lock.json'
        ) continue;

        // If the files passed the vibe check, we go.
        const sourcePath = path.join(sourceDir, entry.name);
        const newPath = path.join(newDir, entry.name);
        if (entry.isDirectory()) {
            await copyDir(sourcePath, newPath);
        } else {
            await fsPromises.copyFile(sourcePath, newPath);
        }
    }
}

// Here's we build.
// So first, let's copy this folder for Chrome.
copyDir('./', chromeDir).then(async () => {
    console.log(`(Re)made the Chrome folder`);
});

// Then we copy the same folder for Firefox.
copyDir('./', firefoxDir).then(async () => {
    console.log(`(Re)made the Firefox folder`);
    // Then we modify the Firefox extension a bit cuz no
    // browser developer can come up with extension
    // manifest standards like WHY.
    var firefoxManifest = JSON.parse(fs.readFileSync('../PlayerTube-Firefox/manifest.json', 'utf8'));
    firefoxManifest.background.scripts = ['scripts/background.js']; // Add this so Firefox extension can work
    firefoxManifest.browser_specific_settings = { // Manifest v3 moment
        "gecko": {  
            "id": "addon@example.com"
        }
    };
    delete firefoxManifest.background.service_worker; // This is for Chrome, Firefox will freak out if this isn't delete lol.
    // Write the manifest file for Firefox
    fs.writeFileSync('../PlayerTube-Firefox/manifest.json', JSON.stringify(firefoxManifest, null, 2));

    // And then we should be done lol
    console.log(`This is good! Really good!`);
});