'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var useHttps = require('use-https');

/**
 * Expose `Comscore` integration.
 */

var Comscore = module.exports = integration('comScore')
  .assumesPageview()
  .global('_comscore')
  .global('COMSCORE')
  .option('c1', '2')
  .option('c2', '')
  .tag('http', '<script src="http://b.scorecardresearch.com/beacon.js">')
  .tag('https', '<script src="https://sb.scorecardresearch.com/beacon.js">');

/**
 * Initialize.
 *
 * @api public
 */

Comscore.prototype.initialize = function() {
  var comScoreOptions = { c1: this.options.c1, c2: this.options.c2 };
  window._comscore = window._comscore || [comScoreOptions];
  var tagName = useHttps() ? 'https' : 'http';
  this.load(tagName, this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Comscore.prototype.loaded = function() {
  return !!window.COMSCORE;
};

/**
 * Page.
 *
 * @api public
 * @param {Object} page
 */

Comscore.prototype.page = function(page) {
  var beaconParamMap = this.options.beaconParamMap;
  var properties = page.properties();

  var comScoreOptions = {};

  Object.keys(beaconParamMap).forEach(function(property) {
    if (property in properties) {
      var key = beaconParamMap[property];
      var value = properties[property];
      comScoreOptions[key] = value;
    }
  });

  comScoreOptions.c1 = this.options.c1;
  comScoreOptions.c2 = this.options.c2;

  window.COMSCORE.beacon(comScoreOptions);
};
