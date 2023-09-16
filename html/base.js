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
    var slides = document.getElementsByClassName("showVersion");
    for (var i = 0; i < slides.length; i++) {
        slides.item(i).innerHTML += "v" + version;
    }
}, 50);