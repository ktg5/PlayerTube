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


setTimeout(async () => {
    // Add version number to page title
    var pageName = document.getElementById('page-name').innerHTML;
    document.title = `PlayerTube v${version} : ${pageName}`;
    
    // Add version number to document
    var slides = document.getElementsByClassName("showVersion");
    for (var i = 0; i < slides.length; i++) {
        slides.item(i).innerHTML += "v" + version;
    }


    // Add event listeners to "page-selection" elements
    var pageSelectors = document.querySelectorAll('.page-selection');
    pageSelectors.forEach(selector => {
        selector.addEventListener('click', async () => {
            // Check for ".selected" element
            if (document.querySelector('.selected')) {
                document.querySelector('.selected').classList.remove('selected');
            }
            // Add ".selected" to element
            if (selector.href && selector.href.includes('#')) {
                document.getElementById(selector.href.split('#')[1]).classList.add('selected');
            }
        });
    });

    // Also check if # is already in page
    if (document.location.href.includes("#")) {
        console.log(`Is href linking to element? '${document.location.href.includes("#")}'`)

        document.getElementById(document.location.href.split("#")[1]).classList.add('selected');
    }
}, 50);