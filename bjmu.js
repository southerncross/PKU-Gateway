/*
 * PKU-Gateway
 * bjmu.js
 */

function BJMUConnector(account) {
    const Constant = {
	'MAGIC_STRING': '|;kiDrqvfi7d$v0p5Fg72Vwbv2;|',
	'CONNECT_URL': 'http://srun.bjmu.edu.cn/cgi-bin/do_login',
	'DISCONNECT_URL': 'http://srun.bjmu.edu.cn/cgi-bin/do_logout',
    };

    const Operation = {
	'CONNECT_FREE': '1',
	'CONNECT_EXPENSIVE': '0',
	'DISCONNECT_ME': '?', // TODO
	'DISCONNECT_ALL': '?' // TODO
    };

    this.connectFree = function() {
	_execute(Operation['CONNECT_FREE']);
    };

    this.connectExpensive = function() {
	_execute(Operation['CONNECT_EXPENSIVE']);
    };

    this.disconnectMe = function() {
	_execute(Operation['DISCONNECT_ME']);
    };

    this.disconnectAll = function() {
	_execute(Operation['DISCONNECT_ALL']);
    };

    var _connect = function(operation) {
	operation = operation || Operation['CONNECT_FREE'];

	var url = _operation2Url(operation);
	var ret = {'success': false, 'error': ''};
	var request = $.ajax(url, {
	    type: 'POST', data: {
		'username': account['username'],
		'password': '{TEXT}' + account['password'],
		'drop': operation,
		'type': '1',
		'n': '100'
	    }
	});

	request.done(function(data, textStatus) {
	    var reg=/^[\d]+$/;

	    if(data.match(reg)) {
		ret['success'] = true;
	    }
	    else {
		ret['success'] = false;
		ret['error'] = data;
	    }
	});

	request.fail(function(jqXHR, textStatus) {
	    ret['success'] = false;
	    ret['error'] = 'network_error';
	});

	return ret;
    };

    // TODO: Disconnect me and all.
    var _disconnect = function(operation) {
	operation = operation || Operation['DISCONNECT_ME'];

	var url = _operation2Url(operation);
	var request = $.ajax(url, {type: 'GET'});
	var ret = false;

	request.done(function(data, textStatus) {
	    ret = true;
	});

	request.fail(function(jqXHR, textStatus) {
	    ret = false;
	});

	return ret;
    };

    var _execute = function(operation) {
	if (operation === Operation['CONNECT_FREE'] || operation === Operation['CONNECT_EXPENSIVE']) {
	    if (!_disconnect()) {
		_notifyBad(':( Connect failed: Network error.');
		return;
	    }

	    Utils.tryTo(function() {return _connect(operation);},
			{'delay': 500},
			function(data) {
			    if (data['success'] || data['error'] != 'ip_exist_error') {
				return true;
			    }
			    else {
				return false;
			    }
			}, 
			function(data) {
			    if (data['success']) {
				_notifyGood(':) Connect ok.');
			    }
			    else {
				_notifyBad(':( ' + _error2Message(data['error']));
			    }
			});
	}
	else {
	    if (_disconnect(operation)) {
		_notifyGood(':) Disconnect ok.');
	    }
	    else {
		_notifyBad(':( Disconnect failed.');
	    }
	}
    };

    this.test = function() {
	console.log('test');

	Utils.notify(
	    'BAD', {
		'duration': 3000, 
		'type': Utils['Emotion']['BAD']
	    });

	Utils.notify(
	    'GOOD', {
		'duration': 3000, 
		'type': Utils['Emotion']['GOOD']
	    });

	Utils.notify(
	    'GOOD', {
		'type': Utils['Emotion']['GOOD']
	    });
    };

    var _notifyGood = function(msg) {
	_notify(Utils['Emotion']['GOOD'], msg);
    };

    var _notifyBad = function(msg) {
	_notify(Utils['Emotion']['BAD'], msg);
    };

    var _notify = function(type, msg) {
	Utils.notify(
	    msg, {
		'duration': 3000, 
		'type': type
	    });
    };

    var _error2Message = function(error) {
	switch (error) {
	case 'minutes_error':
	    return '糟糕！无法打开收费网关，收费网关的可用时间已经木有了.';
	case 'ip_exist_error':
	    return '糟糕！你的ip地址尚未下线，请稍后尝试.';
	case 'status_error':
	    return '糟糕！无法代开网络连接，账户余额不足哦.';
	case 'usernum_error':
	    return '糟糕！已经有两个独立ip登录此网关，他们不让我登录T-T';
	default:
	    return error;
	}
    };

    var _operation2Url = function(operation) {
	if (operation === Operation['CONNECT_FREE'] || operation === Operation['CONNECT_EXPENSIVE']) {
	    return Constant['CONNECT_URL'];
	}
	else {
	    return Constant['DISCONNECT_URL'];
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

