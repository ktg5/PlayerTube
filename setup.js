// Shortcuts
if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

// Default user config.
var def_pt_config = {
    // First-time ppl & release note checking.
    releaseNote: 0,

    // Basic settings.
    year: '2015',
    autoplayButton: false,
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

start();
function start() {
	storage.get(['PTConfig'], function(result) {
		if (result == undefined || Object.keys(result).length == 0) {
			storage.set({PTConfig: def_pt_config});
			userConfig = storage.get(['PTConfig']);
            console.log(`PLAYERTUBE USER DATA (reset to default):`, userConfig);
            window.location.reload();
		} else {
			userConfig = result.PTConfig;
            console.log(`PLAYERTUBE USER DATA:`, userConfig);
		}
	});
}