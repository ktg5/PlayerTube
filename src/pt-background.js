if (navigator.userAgent.includes("Chrome")) browser = chrome;
var storage = browser.storage.sync;
var extension = browser.extension;
var runtime = browser.runtime;

// On extension update
runtime.onInstalled.addListener(reason => {
	storage.get(['PTConfig'], function(result) {
		var userConfig = result.PTConfig;
		if (!userConfig) return browser.tabs.create({
			url: `./html/install.html`
		});

		// Check to see if user would like to get release notes
		if (userConfig.showReleaseNotes !== false) {
			// Check if previous version is not equal to current version
			if (reason.previousVersion !== runtime.getManifest().version) {
				// Make sure that only these specific reasons can create tabs
				switch (reason.reason) {
					case 'install':
					case 'update':
						browser.tabs.create({
							url: `./html/${reason.reason}.html`
						});
					break;
				}
			}
		}
	});
});
