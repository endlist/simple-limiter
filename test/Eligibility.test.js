'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonStubPromise = require('sinon-stub-promise');
const chaiAsPromised = require('chai-as-promised');

sinonStubPromise(sinon);
chai.use(chaiAsPromised);
chai.use(sinonChai);

const expect = chai.expect;

describe('Eligiblility', () => {
  let Eligibility;
  let config;
  let clock;
  let eligibility;

  beforeEach(() => {
    Eligibility = require('../src/Eligibility.js');
    config = {
      period : 5000,
      limit  : 20,
    };
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('#constructor', () => {

    it('should be able to init without a config', () => {
      expect(new Eligibility).not.to.throw;
    });

    describe('without config', () => {

      beforeEach(() => {
        eligibility = new Eligibility();
      });

      it('should return an object', () => {
        expect(typeof(eligibility)).to.equal('object');
      });

      it('should create a limit', () => {
        expect(eligibility._limit).to.exist;
      });

      it('should create a period', () => {
        expect(eligibility._period).to.exist;
      });

      it('should create a startTime', () => {
        // TODO: can check the time is accurate?
        expect(eligibility._startTime).to.exist;
      });

      it('should create a requestCount', () => {
        expect(eligibility._requestCount).to.exist;
      });

    });

    describe('with config', () => {

      beforeEach(() => {
        eligibility = new Eligibility(config);
      });

      it('should return an object', () => {
        expect(typeof(eligibility)).to.equal('object');
      });

      it('should create a limit', () => {
        expect(eligibility._limit).to.exist;
      });

      it('should create a period', () => {
        expect(eligibility._period).to.exist;
      });

      it('should create a startTime', () => {
        // TODO: can check the time is accurate?
        expect(eligibility._startTime).to.exist;
      });

      it('should create a requestCount', () => {
        expect(eligibility._requestCount).to.exist;
      });

    });
    
  });

  describe('#_getPeriodRemaining', () => {

    beforeEach(() => {
      eligibility = new Eligibility(config);
    });

    describe('when in the period', () => {
      it('should return 3068 if 1932 ms have passed', () => {
        clock.tick(1932);
        expect(eligibility._getPeriodRemaining()).to.equal(3068);
      });

      it('should return 0 if 5000 ms have passed', () => {
        clock.tick(5000);
        expect(eligibility._getPeriodRemaining()).to.equal(0);
      });

      it('should not change the startTime', () => {
        clock.tick(200);
        eligibility._getPeriodRemaining();
        expect(eligibility._startTime).to.equal(0);
      });

      it('should not reset _requestCounter', () => {
        clock.tick(200);
        eligibility._requestCount = 35;
        eligibility._getPeriodRemaining();
        expect(eligibility._requestCount).to.equal(35);
      });

    });

    describe('when past the period', () => {
      beforeEach(() => {
        clock.tick(5001);
      });

      it('should return 5000 if 5001 ms have passed', () => {
        expect(eligibility._getPeriodRemaining()).to.equal(5000);
      });

      it('should update startTime', () => {
        eligibility._getPeriodRemaining();
        expect(eligibility._startTime).to.equal((new Date()).valueOf());
      });

      it('should reset _requestCount if period is reset', () => {
        eligibility._requestCount = 10;
        eligibility._getPeriodRemaining();
        expect(eligibility._requestCount).to.equal(0);
      });

    });

  });

  describe('check', () => {

    beforeEach(() => {
      eligibility = new Eligibility(config);
    });

    it('should call _getPeriodRemaining', () => {
      sinon.spy(eligibility, '_getPeriodRemaining');
      eligibility.check();

      expect(eligibility._getPeriodRemaining).to.have.been.called;
    });

    it('should increment _requestCount', () => {
      expect(eligibility._requestCount).to.equal(0);
      eligibility.check();
      expect(eligibility._requestCount).to.equal(1);
    });

    it('should return true if _requestCount is less than _limit', () => {
      expect(eligibility.check()).to.be.true;
    });

    it('should return false if _requestCount is higher than _limit', () => {
      eligibility._requestCount = 20;
      expect(eligibility.check()).to.be.false;
    });

  });

});
