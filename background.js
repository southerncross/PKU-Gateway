/*
 * PKU-Gateway
 * backgrounds.js
 */

var connector = {}; // global variable

(function init() {
    chrome.storage.sync.get(new Data(), function(data) {
	var shcool;
	var account = {};
	var protection = {};

	school = data['default_school'];
	account['username'] = data[school.toLowerCase() + '_username'];
	account['password'] = data[school.toLowerCase() + '_password'];
	protection['on'] = data['protection_on'];
	protection['interval'] = data['protection_interval'] > 0 ? data['protection_interval'] * 60000 : 30 * 60000;

	if (school.match(/PKU/)) {
	    connector = new PKUConnector(account, protection);
	}
	else if (school.match(/BJMU/)){
	    connector = new BJMUConnector(account, protection);
	}
    });

    chrome.webNavigation.onBeforeNavigate.addListener(function() {connector.renewProtection()});

    chrome.runtime.onInstalled.addListener(function() {
	chrome.tabs.create({
	    url: "options.html",
	    active: true
	});
    });

} ());

