var $ = require('jquery');
var tipsy = require('tipsy-browserify')($);

$(function () {
  $('.tipsy-e').tipsy({ gravity: 'e' });
});
