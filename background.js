/*
 * PKU-Gateway
 * backgrounds.js
 */

const IMG_GOOD = "resource/good";
const IMG_BAD = "resource/bad";
const ICON_FREE = "resource/free.png";
const ICON_GLOBAL = "resource/global.png";
const ICON_DISCONNECTED = "resource/disconnected.png";
const STATE_FREE = "FREE";
const STATE_GLOBAL = "GLOBAL";
const STATE_DISCONNECTED = "DISCONNECTED";
const STATE_UNKNOWN = "UNKNOWN";
var school = "";

var data = Save.createNew();
var connector = {};
var protectionInterval = -1;

chrome.browserAction.setIcon({path: ICON_DISCONNECTED});

chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.create({
	url: "options.html",
	active: true
    });
});

chrome.storage.sync.get(data, function(items) {
    school = items.statusInfo.defaultSchool;

    switch (school) {
    case "PKU":
	alert("PKU");
	connector = PKUConnector.newInstance();
	break;
    case "BJMU":
	connector = BJMUConnector.newInstance();
	break;
    default:
	alert("default?");
	break;
    }
});


