// Shortcuts
if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

// Default config
var def_pt_config = {
    // Basic settings.
    year: '2015',
    showReleaseNotes: true,
    darkMode: false,
    autoplayButton: false,
    heatMapToggle: false,
    fullyExtendBar: false,
    toggleFadeOut: false,
    endScreenToggle: true,
    embedOtherVideos: true,
    toggleWatermark: true,
    toggleRoundedCorners: false,
    togglePaidContent: false,
    toggleInfoCards: true,
    customTheme: false,

    // Only for custom themes.
    controlsBack: null,
    settingsBgColor: null,
    progressBarColor: null,
    progressBarBgColor: null,
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
	storage.get(['PTConfig'], async function(result) {
		if (result == undefined || Object.keys(result).length == 0) {
			await storage.set({PTConfig: def_pt_config});
			userConfig = await storage.get(['PTConfig']);
            console.log(`PLAYERTUBE USER DATA (reset to default):`, userConfig);
            window.location.reload();
		} else {
			userConfig = result.PTConfig;
            console.log(`PLAYERTUBE USER DATA:`, userConfig);
		}
	});
}