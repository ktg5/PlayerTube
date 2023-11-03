// Shortcuts
var browser = browser;
if (navigator.userAgent.includes("Chrome")) { 
    browser = chrome 
};
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

/// Version
var version = runtime.getManifest().version;

setTimeout(() => {
    // Add version number to page title
    var pageName = document.getElementById('page-name').innerHTML;
    document.title = `PlayerTube v${version} : ${pageName}`;
    
    // Add version number to document
    var slides = document.getElementsByClassName("showVersion");
    for (var i = 0; i < slides.length; i++) {
        slides.item(i).innerHTML += "v" + version;
    }
}, 50);