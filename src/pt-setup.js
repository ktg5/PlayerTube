// cool-ass ascii art i guess lmao
var styles1 = [
    'background: linear-gradient(#D33106, #571402)'
    , 'color: white'
    , 'display: block'
    , 'font-size: 18px'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
    , 'line-height: 25px'
    , 'font-weight: bold'
].join(';');
var styles2 = [
    'background: linear-gradient(#0629d3, #022c57)'
    , 'border: 5px solid rgb(255 255 255 / 10%)'
    , 'color: white'
    , 'display: block'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
].join(';');
var styles3 = [
    'background: linear-gradient(#06d316, #075702)'
    , 'border: 5px solid rgb(255 255 255 / 10%)'
    , 'color: white'
    , 'display: block'
    , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
    , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
].join(';');
console.log(`%c░█▀▀█ █── █▀▀█ █──█ █▀▀ █▀▀█ ▀▀█▀▀ █──█ █▀▀▄ █▀▀ `, styles1)
console.log(`%c░█▄▄█ █── █▄▄█ █▄▄█ █▀▀ █▄▄▀ ─░█── █──█ █▀▀▄ █▀▀ `, styles1)
console.log(`%c░█─── ▀▀▀ ▀──▀ ▄▄▄█ ▀▀▀ ▀─▀▀ ─░█── ─▀▀▀ ▀▀▀─ ▀▀▀ ... is up and running!`, styles1)
console.log(`%cIf you enabled some of the debug stuff, or wanna look at what the extension is doing, search for "pt-" in the console to get everything!`, styles2)

// Shortcuts
if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

// Default config
var def_pt_config = {
    // Basic settings.
    year: '2013',
    showReleaseNotes: true,
    alternateMode: false,
    autoplayButton: false,
    heatMapToggle: false,
    fullyExtendBar: false,
    fakeBarToggle: true,
    toggleFadeOut: false,
    endScreenToggle: true,
    embedOtherVideos: true,
    toggleWatermark: true,
    toggleRoundedCorners: false,
    togglePaidContent: false,
    toggleInfoCards: true,
    toggleSpinner: true,
    toggleMoreVids: false,
    toggleFSButtons: false,
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

// Start (config stuff)
start();
function start() {
	storage.get(['PTConfig'], async function(result) {
		if (result == undefined || Object.keys(result).length == 0) {
			await storage.set({PTConfig: def_pt_config});
			userConfig = await storage.get(['PTConfig']);
            console.log(`%cPLAYERTUBE USER DATA (reset to default):`, styles3, userConfig);
            window.location.reload();
		} else {
			userConfig = result.PTConfig;
            console.log(`%cPLAYERTUBE USER DATA:`, styles3, userConfig);
		}
	});
}