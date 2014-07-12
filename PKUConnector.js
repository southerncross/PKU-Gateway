/*
 * PKU-Gateway
 * PKUConnector.js
 */

var PKUConnector = {

    newInstance: function() {
	var c = {};

	const MAGICSTRING = "|;kiDrqvfi7d$v0p5Fg72Vwbv2;|";	
	const BASE_URL = "http://its.pku.edu.cn";

	const OP_SIGNIN = "login";
	const OP_FREE = "ipgwopen";
	const OP_GLOBAL = "ipgwopenall";
	const OP_DISCONNECT_ME = "ipgwclose";
	const OP_DISCONNECT_ALL = "ipgwcloseall";

	var username = "";
	var password = "";
	var status = "";
	
	c.init = function() {
	    var data = Save.createNew();
	    var msg = "";
	    
	    chrome.storage.sync.get(data, function(items) {
		data = items;
		username = data.userInfo.PKU.username;
		password = data.userInfo.PKU.password;
		msg = "initialize: " + username + " " + password;
		console.log(msg);
	    });

	    return true;
	    // TODO: return failed if something wrong.
	};

	c.connectFree = function() {
	    console.log("connectFree");
	    c.__execute(OP_FREE);
	};

	c.connectGlobal = function() {
	    console.log("connectGlobal");
	    c.__execute(OP_GLOBAL);
	};

	c.disconnectMe = function() {
	    console.log("disconnectMe");
	    c.__execute(OP_DISCONNECT_ME);
	};

	c.disconnectAll = function() {
	    console.log("disconnectAll");
	    c.__execute(OP_DISCONNECT_ALL);
	};

	c.__signIn = function() {
	    console.log("signIn");
	    var url = c.__op2Url(OP_SIGNIN);
	    var msg = "";
	    var ret = false;

/*
	    chrome.cookies.get({
		url: BASE_URL,
		name: "authUser"
	    }, function(cookie) {
		console.log("SignIn before, get cookie");
		console.log(cookie);
	    });

	    chrome.cookies.get({
		url: BASE_URL,
		name: "JSESSIONID"
	    }, function(cookie) {
		console.log("SignIn before, get cookie");
		console.log(cookie);
	    });
*/

	    $.ajax(url, {
		type: "POST",
		async: false,
		cache: false,
		data: {
		    username1: username,
		    password: password,
		    fwrd: "free",
		    pwd_t: "密码",
		    username: username + MAGICSTRING + password + MAGICSTRING + "12"
		},
		error: function(request, status, error) {
		    console.log(error);
		    c.__notify(IMG_BAD, error);
		    ret = false;
		},
		success: function(data, status) {
		    // TODO: Add cookie support
		    if (data.indexOf("ipgwopen") > 0) {
			msg = "SignIn successfully";
			console.log(msg);
			ret = true;
			/*
			  chrome.cookies.get({
			  url: "http://its.pku.edu.cn",
			  name: "authUser"
			  }, function(cookie) {
			  console.log("SignIn successfully, get cookie");
			  console.log(cookie);
			  var d = {};
			  d.url = "http://its.pku.edu.cn";
			  d.name = cookie.name;
			  d.value = cookie.value;
			  d.domain = cookie.domain;
			  d.path = cookie.path;
			  d.secure = cookie.secure;
			  d.httpOnly = cookie.httpOnly;
			  d.expirationDate = cookie.expirationDate;
			  chrome.cookies.set(d, function(cookie) {
			  console.log("SignIn set cookie");
			  console.log(cookie);
			  //console.log(chrome.runtime.lastError);
			  });
			  });

			  chrome.cookies.get({
			  url: "http://its.pku.edu.cn",
			  name: "JSESSIONID"
			  }, function(cookie) {
			  console.log("SignIn successfully, get cookie");
			  console.log(cookie);
			  var d = {};
			  d.url = "http://its.pku.edu.cn";
			  d.name = cookie.name;
			  d.value = cookie.value;
			  d.domain = cookie.domain;
			  d.path = cookie.path;
			  d.secure = cookie.secure;
			  d.httpOnly = cookie.httpOnly;
			  d.expirationDate = cookie.expirationDate;
			  chrome.cookies.set(d, function(cookie) {
			  console.log("SignIn set cookie");
			  console.log(cookie);
			  //console.log(chrome.runtime.lastError);
			  });
			  });
			*/
		    }
		    else {
			msg = "SignIn not successfully"
			console.log(msg);
			console.log(data);
			c.__notify(IMG_BAD, msg);
			ret = false;
		    }
		}
	    });

	    return ret;
	};

	c.__execute = function(operation) {
	    var url = op2Url(operation);
	    var msg = "";
	    var newStatus = "";

	    // TODO operation check!

	    if (false === c.__hasSignIn()) {
		if (false == c.__signIn()) {
		    return;
		}
	    }

	    $.ajax(url, {
		type: "GET",
		async: false,
		cache: false,
		error: function(request, status, error) {
		    console.log(error);
		    c.__notify(IMG_BAD, error);
		},
		success: function(data, status) {
		    // There will be a "Succeeded" word when disconnect finished.
		    // There will be "successfully" word when connect finished.
		    if (data.indexOf("Succeeded") > 0 || data.indexOf("successfully") > 0) {
			msg = operation + " succeeded.";
			newStatus = c.__op2Status(operation);
			c.__notify(IMG_GOOD, msg);
			c.__update(newStatus);
			console.log(msg);
		    }
		    else {
			msg = operation + " failed, something else.";
			// TODO: Show the detailed reason.
			console.error(msg);
			console.log(data);
			c.__notify(IMG_BAD, msg);
		    }
		    console.log("status: ", status);
		}
	    });
	};

	c.__hasSignIn = function() {
	    var url = BASE_URL + "/netportal/";
	    var msg = "";
	    var hasSignIn = false;

	    $.ajax(url, {
		type: "GET",
		async: false,
		cache: false,
		error: function(rquest, status, error) {
		    hasSignIn = false;
		},
		success: function(data, status) {
		    // TODO: Add English language support
		    if (data.indexOf("您来自校外") > 0 || data.indexOf("来自校内") > 0) {
			msg = "Has logged";
			console.log(msg);
			hasSignIn = true;
		    }
		    else {
			msg = "Not logged";
			hasSignIn = false;
		    }
		}
	    });

	    return hasSignIn;
	};

	c.__notify = function(img, msg) {
	    const title = "PKU-Gateway";
	    const icon = img + "_" + Math.floor(Math.random() * 6 + 1) + ".png";

	    var notification = webkitNotifications.createNotification(
		icon,
		title,
		msg
	    );

	    notification.show();
	    setTimeout(function() {
		notification.cancel();
	    }, 3000);
	};
	
	c.__update = function(status) {
	    if (status === this.status) {
		return;
	    }

	    var icon = "";

	    this.status = status;
	    switch (status) {
	    case STATE_DISCONNECTED:
		icon = ICON_DISCONNECTED;
		break;
	    case STATE_FREE:
		icon = ICON_FREE;
		break;
	    case STATE_GLOBAL:
		icon = ICON_GLOBAL;
		break;
	    default:
		console.log("default?");
		break;
	    }

	    chrome.browserAction.setIcon({path: icon});
	};

	c.test = function() {
	    console.log("test");
	    // TODO: Experiment
	    /*
	      chrome.cookies.get({
	      url: "http://its.pku.edu.cn",
	      name: "authUser"
	      }, function(cookie) {
	      console.log("Get cookie");
	      console.log(cookie);
	      });

	      chrome.cookies.get({
	      url: "http://its.pku.edu.cn",
	      name: "JSESSIONID"
	      }, function(cookie) {
	      console.log("Get cookie");
	      console.log(cookie);
	      });
	    */
	    /*
	    chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
		console.log("before navigate");
	    });

	    chrome.webNavigation.onCommitted.addListener(function(details) {
		console.log("on committed");
	    });

	    chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
		console.log("on DOM content loaded");
	    });

	    chrome.webNavigation.onCompleted.addListener(function(details) {
		console.log("on completed");
	    });
	    */

	    c.__notify(IMG_GOOD, "test");
	    c.__notify(IMG_BAD, "test");
	    c.__update(STATE_FREE);
	};

	c.__op2Status = function(operation) {
	    switch (operation) {
	    case OP_DISCONNECT_ME:
	    case OP_DISCONNECT_ALL:
		return STATE_DISCONNECTED;
	    case OP_FREE:
		return STATE_FREE;
	    case OP_GLOBAL:
		return STATE_GLOBAL;
	    default:
		return STATE_UNKNOWN;
	    }
	};
	
	c.__op2Url = function(operation) {
	    switch (operation) {
	    case OP_DISCONNECT_ME:
	    case OP_DISCONNECT_ALL:
	    case OP_FREE:
	    case OP_GLOBAL:
		return BASE_URL + "/netportal/" + operation;
	    case OP_SIGNIN:
		return BASE_URL + "/login";
	    }
	};

	return c;
    }
};

