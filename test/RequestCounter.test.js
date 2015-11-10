'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const START_TIME = 140000;

chai.use(sinonChai);

const expect = chai.expect;

describe('RequestCounter', () => {
  let RequestCounter;
  let config;
  let clock;
  let requestCounter;

  beforeEach(() => {
    RequestCounter = require('../src/RequestCounter.js');
    config = {
      period    : 500,
      limit     : 20,
      increment : 1,
    };
    clock = sinon.useFakeTimers(START_TIME);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('#constructor', () => {

    it('should be able to init without a config', () => {
      expect(new RequestCounter).not.to.throw;
    });

    describe('without config', () => {

      beforeEach(() => {
        requestCounter = new RequestCounter();
        sinon.spy(requestCounter, 'incrementLimit');
      });

      afterEach(() => {
        requestCounter.destroy();
      });

      it('should return an object', () => {
        expect(typeof(requestCounter)).to.equal('object');
      });

      it('should create maxLimit', () => {
        expect(requestCounter._maxLimit).to.exist;
      });

      it('should create limit', () => {
        expect(requestCounter._limit).to.exist;
      });

      it('should create a period', () => {
        expect(requestCounter._period).to.exist;
      });

      it('should create a increment', () => {
        expect(requestCounter._increment).to.exist;
      });

      it('should create a startTime', () => {
        // TODO: can check the time is accurate?
        expect(requestCounter._startTime).to.exist;
      });

      it('should set up an interval calling incrementLimit', () => {
        clock.tick(config.period + 1);
        expect(requestCounter.incrementLimit).to.have.been.called;
      });

    });

    describe('with config', () => {

      beforeEach(() => {
        requestCounter = new RequestCounter(config);
        sinon.spy(requestCounter, 'incrementLimit');
      });

      afterEach(() => {
        requestCounter.destroy();
      });

      it('should return an object', () => {
        expect(typeof(requestCounter)).to.equal('object');
      });

      it('should create maxLimit', () => {
        expect(requestCounter._maxLimit).to.exist;
      });

      it('should create limit', () => {
        expect(requestCounter._limit).to.exist;
      });

      it('should create a period', () => {
        expect(requestCounter._period).to.exist;
      });

      it('should create a increment', () => {
        expect(requestCounter._increment).to.exist;
      });

      it('should create a startTime', () => {
        // TODO: can check the time is accurate?
        expect(requestCounter._startTime).to.exist;
      });

      it('should set up an interval calling incrementLimit', () => {
        clock.tick(config.period + 1);
        expect(requestCounter.incrementLimit).to.have.been.calledOnce;

        clock.tick(config.period);
        expect(requestCounter.incrementLimit).to.have.been.calledTwice;
      });

    });

  });

  describe('#destroy', () => {

    beforeEach(() => {
      requestCounter = new RequestCounter();
      requestCounter.destroy();
    });

    it('should destroy the interval', () => {
      expect(requestCounter.interval).to.not.exist;
    });

  });

  describe('#incrementLimit', () => {

    beforeEach(() => {
      requestCounter = new RequestCounter(config);
    });

    afterEach(() => {
      requestCounter.destroy();
    });

    it('should increment _currentLimit if not at _maxLimit', () => {
      requestCounter._limit = 0;
      requestCounter.incrementLimit();
      expect(requestCounter._limit).to.equal(1);
    });

    it('should not increment _currentLimit past _maxLimit', () => {
      requestCounter.incrementLimit();
      expect(requestCounter._limit).to.equal(config.limit);
    });

  });

  describe('#add', () => {

    beforeEach(() => {
      requestCounter = new RequestCounter(config);
    });

    afterEach(() => {
      requestCounter.destroy();
    });

    it('should decrement limit when below limit', () => {
      requestCounter.add();
      expect(requestCounter._limit).to.equal(config.limit - 1);
    });

    it('should not decrement limit if already at limit', () => {
      requestCounter._limit = 0;
      requestCounter.add();
      expect(requestCounter._limit).to.equal(0);
    });

    it('should reset at the end of the period', () => {
      requestCounter.add();
      clock.tick(config.period + 1);
      expect(requestCounter._limit).to.equal(config.limit);
    });

  });

  describe('#getRemaining', () => {

    beforeEach(() => {
      requestCounter = new RequestCounter(config);
    });

    afterEach(() => {
      requestCounter.destroy();
    });

    it('should return the limit', () => {
      expect(requestCounter.getRemaining()).to.equal(requestCounter._limit);
    });

  });

});
