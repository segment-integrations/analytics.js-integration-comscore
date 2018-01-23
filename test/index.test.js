'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Comscore = require('../lib/');

describe('comScore', function() {
  var analytics;
  var comscore;
  var options = {
    c2: 'x',
    autoUpdateInterval: '',
    beaconParamMap: {
      exampleParam: 'c5',
      anotherParam: 'c6'
    }
  };

  beforeEach(function() {
    analytics = new Analytics();
    comscore = new Comscore(options);
    analytics.use(Comscore);
    analytics.use(tester);
    analytics.add(comscore);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    comscore.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Comscore, integration('comScore')
      .global('_comscore')
      .option('c1', '2')
      .option('c2', ''));
  });

  describe('before loading', function() {
    describe('#initialize', function() {
      it('should set pageCalledYet to false and ready to true', function() {
        analytics.initialize();
        analytics.assert(!comscore.pageCalledYet);
        analytics.assert(comscore._ready);
      });
    });

    describe('first page', function() {
      beforeEach(function() {
        analytics.initialize();
      });

      it('should create window._comscore', function() {
        analytics.page();
        analytics.assert(window._comscore instanceof Array);
      });

      it('should call #load', function() {
        analytics.stub(comscore, 'load');
        analytics.page();
        analytics.called(comscore.load);
      });

      it('should set _ready from true to false to true', function(done) {
        analytics.once('ready', function() {
          analytics.assert(comscore._ready);
          done();
        });
        analytics.assert(comscore._ready);
        analytics.page();
        analytics.assert(!comscore._ready);
      });

      it('should not call comscore page', function(done) {
        analytics.once('ready', function() {
          analytics.stub(window.COMSCORE, 'beacon');
          analytics.didNotCall(window.COMSCORE.beacon);
          done();
        });
        analytics.page();
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(comscore, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', function() {
        analytics.stub(window.COMSCORE, 'beacon');
        done();
      });
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function() {
      it('should call page', function() {
        analytics.page();
        analytics.called(window.COMSCORE.beacon, { c1: '2', c2: 'x' });
      });

      it('should map properties in beaconParamMap', function() {
        analytics.page({ exampleParam: 'foo', anotherParam: 'bar' });
        analytics.called(window.COMSCORE.beacon, { c1: '2', c2: 'x', c5: 'foo', c6: 'bar' });
      });
    });
  });
});
