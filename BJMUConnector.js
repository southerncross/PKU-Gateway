/*
 * PKU-Gateway
 * BJMUConnector.js
 */

var BJMUConnector = {

    newInstance: function() {
	var c = {};

	const MAGICSTRING = "|;kiDrqvfi7d$v0p5Fg72Vwbv2;|";	
	const BASE_URL = "http://srun.bjmu.edu.cn/cgi-bin";
	const CONNECT_URL = BASE_URL + "/do_login";
	const DISCONNECT_URL = BASE_URL + "/do_logout";

	const PERM_FREE = "1";
	const PERM_GLOBAL = "0";
	// TODO disconnect all.
	const PERM_DISCONNECT_ME = "TODO";
	const PERM_DISCONNECT_ALL = "TODO_ALL";

	const ERR_NO_GLOBAL_REMAINING = "minutes_error";
	const ERR_IP_EXISTS = "ip_exist_error";
	const ERR_BALANCE_INSUFFICIENT = "status_error";
	const ERR_USER_NUMBER = "usernum_error";
	
	const RETRY_COUNT = 15;
	const RETRY_INTERVAL = 500;
	
	const NOTIFICATION_DURATION = 3000;

	var username = "";
	var password = "";
	var status = STATE_DISCONNECTED;
	var protectionId = -1;
	var PROTECTION_DURATION = -1;

	c.init = function() {
	    var data = Save.createNew();
	    var msg = "";

	    chrome.storage.sync.get(data, function(items) {
		data = items;
		username = data.userInfo.BJMU.username;
		password = data.userInfo.BJMU.password;
		PROTECTION_DURATION = data.protectionInterval * 1000 * 60;
		msg = "initialize: " + username + " " + password + " " + PROTECTION_DURATION;
		console.log(msg);
	    });

	    chrome.webNavigation.onBeforeNavigate.addListener(c.__startProtection);

	    return true;
	    // TODO: return failed if something wrong.
	};

	c.uninit = function() {
	    //chrome.webNavigation.onBeforeNavigate.removeListener(c.__startProtection);
	};

	c.connectFree = function() {
	    var ret = {};

	    ret = c.__disconnect();
	    if (false === ret.success) {
		c.__notify(ret, NOTIFICATION_DURATION);
		return;
	    }

	    c.__try(RETRY_COUNT, RETRY_INTERVAL, function() {
		return c.__connect(PERM_FREE);
	    });
	};

	c.connectGlobal = function() {
	    var ret = {};

	    ret = c.__disconnect();

	    if (false === ret.success) {
		c.__notify(ret, NOTIFICATION_DURATION);
		return;
	    }

	    c.__try(RETRY_COUNT, RETRY_INTERVAL, function() {
		var result = c.__connect(PERM_GLOBAL);
		if (true === result.success) {
		    c.__startProtection();
		}
		return result;
	    });
	};

	c.disconnectMe = function() {
	    var ret = c.__disconnect(PERM_DISCONNECT_ME);
	    c.__stopProtection();
	    c.__notify(ret, NOTIFICATION_DURATION);
	};

	c.disconnectAll = function() {
	    var ret = c.__disconnect(PERM_DISCONNECT_ALL);
	    c.__stopProtection();
	    c.__notify(ret, NOTIFICATION_DURATION);
	};

	c.__startProtection = function() {
	    if (protectionId > 0) {
		clearInterval(protectionId);
		protectionId = -1;
	    }

	    if (STATE_GLOBAL === status) {
		protectionId = setInterval(function() {
		    c.__notify({success: true, msg: "咦?似乎好半天没动静了唉，怎么还开着国际网关呢?让我来切回免费网关~"}, -1);
		    c.connectFree();
		    clearInterval(protectionId);
		}, PROTECTION_DURATION);
	    }
	};

	c.__stopProtection = function(interval) {
	    if (protectionId > 0) {
		clearInterval(protectionId);
		protectionId = -1;
	    }
	};

	// TODO: Disconnect me and all.
	c.__disconnect = function() {
	    var ret = {success: false, msg: ""};

	    $.ajax(DISCONNECT_URL, {
		type: "GET",
		async: false,
		cache: false,
		error: function(request, status, error) {
		    ret.success = false;
		    ret.msg = "糟糕！无法断开连接，似乎粗线网络错误，请检查网络连接是否正常.";
		},
		success: function(data, status) {
		    ret.success = true;
		    ret.msg = "连接已断开."
		    c.__update(STATE_DISCONNECTED);
		}
	    });

	    return ret;
	};
	
	c.__connect = function(permission) {
	    var ret = {success: false, msg: "", error: ""};
	    
	    $.ajax(CONNECT_URL, {
		type: "POST",
		async: false,
		cache: false,
		data: {
		    username: username,
		    password: "{TEXT}" + password,
		    drop: permission,
		    type: "1",
		    n: "100"
		},
		error: function(request, status, error) {
		    ret.success = false;
		    ret.msg = "糟糕！无法打开网关，似乎粗线了网络错误.请检查网络连接是否正常.";
		},
		success: function(data, status) {
		    var reg=/^[\d]+$/;

		    if(reg.test(data)) {
			ret.success = true;

			switch (permission) {
			case PERM_FREE:
			    ret.msg = "免费网关已打开.";
			    c.__update(STATE_FREE);
			    break;
			case PERM_GLOBAL:
			    // TODO: Add some information, such as how many hours left.
			    ret.msg = "收费网关已打开.";
			    c.__update(STATE_GLOBAL);
			    break;
			default:
			    break;
			}
		    }
		    else {
			ret.success = false;
			ret.error = data;
			
			switch (data) {
			case ERR_NO_GLOBAL_REMAINING:
			    ret.msg = "糟糕！无法打开收费网关，收费网关的可用时间已经木有了.";
			    break;
			case ERR_IP_EXISTS:
			    ret.msg = "糟糕！你的ip地址尚未下线，请稍后尝试.";
			    break;
			case ERR_BALANCE_INSUFFICIENT:
			    ret.msg = "糟糕！无法代开网络连接，账户余额不足哦.";
			    break;
			case ERR_USER_NUMBER:
			    ret.msg = "糟糕！已经有两个独立ip登录此网关，他们不让我登录T-T";
			    break;
			default:
			    break;
			}
		    }
		}
	    });

	    return ret;
	};

	c.__notify = function(info, duration) {
	    var img = "";

	    if (true === info.success) {
		img = IMG_GOOD;
	    }
	    else {
		img = IMG_BAD;
	    }

	    const title = "PKU-Gateway: " + school;
	    const icon = img + "_" + Math.floor(Math.random() * 6 + 1) + ".png";

	    var notification = webkitNotifications.createNotification(
		icon,
		title,
		info.msg
	    );

	    notification.show();

	    if (duration > 0) {
		setTimeout(function() {
		    notification.cancel();
		}, duration);
	    }
	};
	
	c.__update = function(newStatus) {
	    if (status === newStatus) {
		return;
	    }

	    var icon = "";

	    status = newStatus;
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
	    
	    c.__notify({success: true, msg: "haha"}, -1);
	    c.__notify({success: false, msg: "hoho"}, 3000);
	    c.__update(STATE_FREE);
	};

	c.__try = function(times, interval, task) {
	    var ret = {};

	    setTimeout(function() {
		ret = task();
		if (false === ret.success && times > 0) {
		    c.__try(times - 1, interval, task);
		}
		else {
		    c.__notify(ret, NOTIFICATION_DURATION);
		}
	    }, interval);
	}

	return c;
    }
};

