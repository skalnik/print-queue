var $ = require('jquery');
var tipsy = require('tipsy-browserify')($);
require('./common/livestamp.min');

$(function () {
  $('.tipsy-me').tipsy({ gravity: 's' });
});
