// TODO This data structure is not very suitable.
var data = Save.createNew();

function saveOptions() {
    var username = $("#username").val();
    var password = $("#password").val();
    var school = $("#school").val();

    switch (school) {
    case "PKU":
	data.userInfo.PKU.username = username;
	data.userInfo.PKU.password = password;
	break;
    case "BJMU":
	data.userInfo.BJMU.username = username;
	data.userInfo.BJMU.password = password;
	break;
    }
    
    data.protectionInterval = $("#protection_interval").val();

    data.statusInfo.defaultSchool = $("#default_school").val();
    chrome.storage.sync.set(data, function() {
	$("#status").html("保存成功");
	setTimeout(function() {$("#status").html("");}, 1000);
    });
    
}

function restoreOptions() {
    console.log("restore school");
    var school = $("#school").val();
    
    chrome.storage.sync.get(data, function(items) {
	data = items;
	switch (school) {
	case "PKU":
	    $("#username").val(data.userInfo.PKU.username);
	    $("#password").val(data.userInfo.PKU.password);
	    break;
	case "BJMU":
	    $("#username").val(data.userInfo.BJMU.username);
	    $("#password").val(data.userInfo.BJMU.password);
	    break;
	}
	$("#default_school").val(data.statusInfo.defaultSchool);

	$("#protection_interval").val(data.protectionInterval);
    });
}

$(document).ready(function() {
    restoreOptions();
    $("#save").click(saveOptions);
    $("#school").change(restoreOptions);
});


