/**
 * PKU-Gateway
 * option.js
 */

$(document).ready(function() {
    var items = ['pku_username', 'pku_password', 'bjmu_username', 'bjmu_password', 'default_school', 'protection_interval'];

    function store() {
	var data = new Data();

	Utils.forEach(items, function(item) {
	    data[item] = $('#' + item).val();
	});

	data['protection_on'] = $('#protection_on').is(':checked');

	chrome.storage.sync.set(data, function() {
	    $('#status').html('保存成功');
	    setTimeout(function() {$('#status').html('');}, 1000);
	});
    }

    function load() {
	chrome.storage.sync.get(new Data(), function(data) {
	    Utils.forEach(items, function(item) {
		$('#' + item).val(data[item]);
	    });
	});
    }

    load();
    $('#save').click(store);
});


