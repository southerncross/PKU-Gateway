/*
 * PKU-Gateway
 * save.js
 */

var Save = {
    
    createNew: function() {
	var d = {};

	d.userInfo = {
	    PKU: {
		username: "",
		password: ""
	    },
	    BJMU: {
		username: "",
		password: ""
	    }
	};

	d.statusInfo = {
	    defaultSchool: ""
	};

	d.protectionInterval = 30;

	return d;
    }
}
