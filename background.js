if (navigator.userAgent.includes("Chrome")) browser = chrome;
function handleInstalled(reason) {
	browser.storage.sync.get(['PTConfig'], function(result) {
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

browser.runtime.onInstalled.addListener(reason => {
	handleInstalled(reason.reason);
});