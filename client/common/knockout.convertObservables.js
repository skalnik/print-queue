var ko = require('knockout');

module.exports = function(item, callback) {

    // cache the bloody hell out of the bits
    var status = item.status,
        notified = item.notified,
        url = item.url,
        thumbnail = item.thumbnail,
        amount = item.amount,
        notes = item.notes;

    // make status, notified, url, and thumbnail observable
    item.status = ko.observable(status); 
    item.notified = ko.observable(notified); 
    item.url = ko.observable(url);
    item.thumbnail = ko.observable(thumbnail);
    item.amount = ko.observable(amount);
    item.notes = ko.observable(notes);

    return item;

};