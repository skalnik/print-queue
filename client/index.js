var $ = require('jquery');
var tipsy = require('tipsy-browserify')($);
require('./common/livestamp.min');

$(function () {
  $('form.delete input[type=submit]').tipsy({ gravity: 'e' });
});
