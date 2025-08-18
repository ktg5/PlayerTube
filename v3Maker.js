const fs = require('fs-extra');
const fsPromises = require('fs/promises');
const v3elmnts = require('./v3elmnts.json');
const process = require('process');
const readline = require('readline');


// Make the v3 folder in the css folder
var v3Dir = 'css/v3';
if (fs.existsSync(v3Dir)) {
    console.log(`Deleting past V3 folder`);
    fs.rmSync(v3Dir, { recursive: true });
    console.log(`Deleted past V3 folder`);
}
fs.mkdirSync(v3Dir);

// Now we'll replace all the strings in the the v3 elements file with their replacements for v3.
console.log('Making V3 copies of css files...');
var cssFiles = fs.readdirSync('css/');
cssFiles.forEach(cssFileName => {
    // Make sure the file is an actual css file
    if (cssFileName.endsWith('.css') && cssFileName !== 'forv3.css') {
        process.stdout.write(`> ${cssFileName}`);

        // Get the css file & path
        let cssPath = `css/${cssFileName}`;
        let cssFile = fs.readFileSync(cssPath, { encoding: 'utf8' });

        // Add comment to file
        cssFile = cssFile = `/* ##################### */
/* THIS FILE WAS EDITED USING PLAYERTUBE'S CUSTOM V3MAKER SCRIPT LOL */
/* ##################### */

${cssFile}`;

        // Replace any of the keys in v3elmnts with their value
        for (const [key, value] of Object.entries(v3elmnts)) {
            cssFile = cssFile.replaceAll(key, value);
        }
        // Write to a new css file in the v3 folder
        fs.writeFileSync(`css/v3/${cssFileName}`, cssFile);
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, null);
        process.stdout.write(`✓ ${cssFileName}\n`);
    };
});

console.log(`V3 copies complete!`);


module.exports = true;