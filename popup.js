/*
 * PKU-Gateway
 * popup.js
 */


$(document).ready(function() {
    var background = chrome.extension.getBackgroundPage();
    var connector = background.connector;

    $("#connectFree").click(connector.connectFree);
    $("#connectGlobal").click(connector.connectGlobal);
    $("#disconnectMe").click(connector.disconnectMe);
    $("#disconnectAll").click(connector.disconnectAll);
    $("#test").click(connector.test);

    connector.init();
    console.log("hi");
});
