/*
 * PKU-Gateway
 * utils.js
 */

var Utils = (function() {
    const BASE_DIR = 'resource/';
    const EMOTION_DIR = BASE_DIR + 'emotion/';
    const ICON_DIR = BASE_DIR + 'icon/';

    var utils = {};

    utils['Icon'] = {
	'FREE': 'free.png',
	'EXPENSIVE': 'expensive.png',
	'DISCONNECTED': 'disconnected.png',
	'TRANSFERING': 'transfering.png'
    };

    utils['Emotion'] = {
	'GOOD': 'good',
	'BAD': 'bad'
    };

    utils.notify = function(msg, option) {
	option['duration'] = option['duration'] || -1;
	option['type'] = option['type'] || Emotion['GOOD'];

	chrome.notifications.create("",{
	    type: "basic",
	    title: "PKU-Gateway",
	    message: msg,
	    iconUrl: (function(type) {
		return BASE_DIR + "emotion/" + type +  "_" + Math.floor(Math.random() * 6 + 1) + ".png";} (option['type']))
	}, function(nid) {
	    if (option['duration'] > 0) {
		setTimeout(function() {
		    chrome.notifications.clear(nid, function(wasCleared) {});
		}, option['duration']);
	    }
	});
    };

    utils.changeIcon = function(icon) {
	chrome.browserAction.setIcon({
	    'path': BASE_DIR + 'icon/' + icon});
    };

    utils.tryTo = function(task, option, testOver, over) {
	option['delay'] = option['delay'] || 1000;
	option['times'] = option['times'] || 1;

	setTimeout(function() {
	    var ret = task();
	    option['times'] -= 1;

	    if (true === testOver(ret) || option['times'] <= 0) {
		over(ret);
	    }
	    else {
		tryTo(task, option, success, fail);
	    }
	}, option['delay']);
    };

    utils.forEach = function(array, action) {
	for (var i = 0, len = array.length; i < len; i++) {
	    action(array[i]);
	}
    };

    utils.reduce = function(combine, base, array) {
	forEach(array, function(element) {
	    base = combine(base, element);
	});

	return base;
    };

    utils.map = function(func, array) {
	var result = [];

	forEach(array, function(element) {
	    result.push(func(element));
	});
	
	return result;
    }
    
    return utils;
} ());
