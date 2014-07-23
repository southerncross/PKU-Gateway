/*
 * PKU-Gateway
 * popup.js
 */


$(document).ready(function() {
    var background = chrome.extension.getBackgroundPage();
    var connector = background['connector'];
    console.log(connector);
    var ops = ['connect_free', 'connect_expensive', 'disconnect_me', 'disconnect_all', 'test'];

    Utils.forEach(ops, function(btnName) {
	var funcName = btnName.replace(/(\w+)_(\w+)/g, function(match, v, adj) {
	    if (adj) {
		return v + adj.substring(0, 1).toUpperCase() + adj.substring(1);
	    }
	    else {
		return v;
	    }
	});

	console.log('btnName:' + btnName + ', funcName: ' + funcName);

	$('#' + btnName).click(connector[funcName]);
    });
});
