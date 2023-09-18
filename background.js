if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

function handleInstalled(reason) {
	storage.get(['PTConfig'], function(result) {
		if (Object.keys(result).length > 0 && !result.PTConfig.releaseNote) {
			return;
		} else if (reason == "update") {
			browser.tabs.create({
				url: `./html/release-note.html`
			});
		} else {
			browser.tabs.create({
				url: `./html/${reason}.html`
			});
		}
	});
}

runtime.onInstalled.addListener(reason => {
	handleInstalled(reason.reason);
});