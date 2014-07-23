/*
 * PKU-Gateway
 * pku.js
 */

function PKUConnector(account, protection) {
    const Constant = {
	'MAGIC_STRING': '|;kiDrqvfi7d$v0p5Fg72Vwbv2;|',
	'BASE_URL': 'http://its.pku.edu.cn/'
    };

    const Operation = {
	'LOGIN': 'login',
	'LOGOUT': 'logout',
	'CONNECT_FREE': 'ipgwopen',
	'CONNECT_EXPENSIVE': 'ipgwopenall',
	'DISCONNECT_ME': 'ipgwclose',
	'DISCONNECT_ALL': 'ipgwcloseall'
    };

    const Status = {
	'UNKNOWN': 'UNKNOWN',
	'FREE': 'FREE',
	'EXPENSIVE': 'EXPENSIVE',
	'DISCONNECTED': 'DISCONNECTED'
    };

    this['status'] = Status['UNKNOWN'];

    this.connectFree = function() {
	_execute(Operation['CONNECT_FREE']);
    };

    this.connectExpensive = function() {
	_execute(Operation['CONNECT_EXPENSIVE']);
	_startProtection();
    };

    this.disconnectMe = function() {
	_execute(Operation['DISCONNECT_ME']);
    };

    this.disconnectAll = function() {
	_execute(Operation['DISCONNECT_ALL']);
    };

    this.renewProtection = function() {
	if (!protection['on']) {return;}

	if (status === Status['EXPENSIVE']) {
	    _stopProtection();
	    _startProtection();
	}
	else {
	    _stopProtection();
	}
    }

    var _startProtection = function() {
	if (!protection['on'] || status != Status['EXPENSIVE']) {return;}
	
	if (timerId > 0) {
	    clearTimeout(timerId);
	    timerId = -1;
	}

	timerId = setTimeout(function() {
	    connector.connectFree();

	    Utils.notify(
		':) PKU-Gateway检测到您开启了收费网关但是长时间未访问网络，已自动切换至免费地址.', {
		    'type': Utils['Emotion']['GOOD']
		});
	}, protection['interval']);
    };

    var _stopProtection = function() {
	if (!protection['on']) {return;}
	
	if (timerId > 0) {
	    clearTimeout(timerId);
	    timerId = -1;
	}
    }

    var timerId = -1;

    var _login = function() {
	console.log('login');

	var url = _operation2Url(Operation['LOGIN']);
	var ret = false;
	var data = {
	    'username1': account['username'],
	    'password': account['password'],
	    'fwrd': 'free',
	    'pwd_t': '密码',
	    'username': account['username'] + Constant['MAGIC_STRING'] + account['password'] + Constant['MAGIC_STRING'] + '12'
	};

	var request = $.ajax(url, {'type': 'POST', 'data': data});
	
	request.done(function(data, textStatus) {
	    var reg = /ipgwopen/;

	    if (data.match(reg)) {
		console.log('login success');
		ret = true;
	    }
	    else {
		console.log(data);
		ret = false;
	    }
	});

	request.fail(function(jqXHR, textStatus) {
	    console.log(textStatus);
	    ret = false;
	});

	return ret;
    };

    var _execute = function(operation) {
	var url = _operation2Url(operation);

	if (!_loginTest() && !_login()) {
	    var msg = ':( Operation failed: Login error.';

	    Utils.notify(
		msg, {
		    'duration': 3000, 
		    'type': Utils['Emotion']['BAD']
		});

	    return;
	}

	console.log(url);
	
	var request = $.ajax(url, {'type': 'GET'});

	request.done(function(data, textStatus) {
	    var msg = '';
	    var reg = /Succeeded|successfully/;

	    if (data.match(reg)) {
		msg = ':) ' + operation + ' successfully.';
		console.log(msg);

		Utils.notify(
		    msg, {
			'duration': 3000, 
			'type': Utils['Emotion']['GOOD']
		    });

		_updateStatus(_operation2Status(operation));
	    }
	    else if (data.match(/当前连接数超过预定值/)) {
		msg = ':( ' + operation + ' failed: 当前连接数超过预定值.';

		Utils.notify(
		    msg, {
			'duration': 3000, 
			'type': Utils['Emotion']['BAD']
		    });
	    }
	    else {
		msg = ':( ' + operation + ' failed: Unkown error.';
		console.error(msg);
		console.log(data);

		Utils.notify(
		    msg, {
			'duration': 3000, 
			'type': Utils['Emotion']['BAD']
		    });
	    }
	});

	request.fail(function(jqXHR, textStatus) {
	    var msg = ':( ' + operation + ' failed: ' + textStatus;

	    console.log(textStatus);

	    Utils.notify(
		msg, {
		    'duration': 3000, 
		    'type': Utils['Emotion']['BAD']
		});
	});
    };

    var _loginTest = function() {
	var url = Constant['BASE_URL'];
	var isLogin = false;

	var request = $.ajax(url, {type: 'GET'});

	request.done(function(data) {
	    // TODO: Add English support.
	    var reg = /您来自校外|来自校内/;
	    if (data.match(reg)) {
		isLogin = true;
	    }
	    else {
		isLogin = false;
	    }
	});

	request.fail(function() {
	    isLogin = false;
	});

	return isLogin;
    };

    this.test = function() {
	console.log('test');
    };

    var _updateStatus = function(newStatus) {
	if (newStatus === status) {
	    return;
	}

	status = newStatus;
	Utils.changeIcon(_status2Icon(status));
    };

    var _status2Icon = function(s) {
	switch (s) {
	case Status['FREE']:
	    return Utils['Icon']['FREE'];
	case Status['EXPENSIVE']:
	    return Utils['Icon']['EXPENSIVE'];
	case Status['DISCONNECTED']:
	    return Utils['Icon']['DISCONNECTED'];
	default:
	    console.log('What?');
	}
    };

    var _operation2Url = function(operation) {
	switch (operation) {
	case Operation['CONNECT_FREE']:
	case Operation['CONNECT_EXPENSIVE']:
	case Operation['DISCONNECT_ME']:
	case Operation['DISCONNECT_ALL']:
	    return Constant['BASE_URL'] + 'netportal/' + operation;
	case Operation['LOGIN']:
	case Operation['LOGOUT']:
	    return Constant['BASE_URL'] + 'cas/' + operation;
	}

    };

    var _operation2Status = function(operation) {
	switch (operation) {
	case Operation['CONNECT_FREE']:
	    return Status['FREE'];
	case Operation['CONNECT_EXPENSIVE']:
	    return Status['EXPENSIVE'];
	case Operation['DISCONNECT_ME']:
	case Operation['DISCONNECT_ALL']:
	    return Status['DISCONNECTED'];
	}
    };

    (function() {
	$.ajaxSetup({
	    'async': false,
	    'cache': false
	});

	account['username'] = account['username'] || 'unknwon';
	account['password'] = account['password'] || 'unknown';
    } ());
}

