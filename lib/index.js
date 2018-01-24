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
  this.pageCalledYet = false;
  this._ready = true; // temporarily switch ready to true so single page call can fire
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
  this.updateComscoreOptions(page);
  if (!this.pageCalledYet) {
    this._ready = false;
    this.pageCalledYet = true;
    this._initialize();
  } else {
    window.COMSCORE.beacon(window.comScoreOptions);
  }
};

Comscore.prototype._initialize = function() {
  window._comscore = window._comscore || [window.comScoreOptions];
  var tagName = useHttps() ? 'https' : 'http';
  this.load(tagName, this.ready);
};


Comscore.prototype.updateComscoreOptions = function(page) {
  var beaconParamMap = this.options.beaconParamMap;
  var properties = page.properties();

  window.comScoreOptions = {};

  Object.keys(beaconParamMap).forEach(function(property) {
    if (property in properties) {
      var key = beaconParamMap[property];
      var value = properties[property];
      window.comScoreOptions[key] = value;
    }
  });

  window.comScoreOptions.c1 = this.options.c1;
  window.comScoreOptions.c2 = this.options.c2;
};
