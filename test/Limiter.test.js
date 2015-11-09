'use strict';
const chai       = require('chai');
const sinon      = require('sinon');
const sinonChai  = require('sinon-chai');

chai.use(sinonChai);

const expect = chai.expect;

describe('Limiter', () => {
  let Limiter;
  let limiter;
  let config;
  let key;

  beforeEach(() => {
    config = {
      limit     : 20,
      period    : 5000,
      increment : 2,
    };
    Limiter = require('../src/Limiter.js');
  });

  describe('#constructor', () => {
    it('should not error if not given a config', () => {
      expect(() => { return new Limiter(); }).not.to.throw(Error);
    });

    describe('without config', () => {

      beforeEach(() => {
        limiter = new Limiter();
      });

      it('should default config.limit to null', () => {
        expect(limiter._config.limit).to.not.exist;
      });

      it('should default config.period to null', () => {
        expect(limiter._config.period).to.not.exist;
      });

      it('should default config.increment to null', () => {
        expect(limiter._config.increment).to.not.exist;
      });

      it('should create _requestCounters', () => {
        expect(limiter._requestCounters).to.exist;
      });

    });

    describe('with config', () => {

      beforeEach(() => {
        config = {
          limit     : 200,
          period    : 8000,
          increment : 2,
        };
        limiter = new Limiter(config);
      });

      it('should assign given period to config.limit', () => {
        expect(limiter._config.limit).to.equal(config.limit);
      });

      it('should assign given period to config.period', () => {
        expect(limiter._config.period).to.equal(config.period);
      });

      it('should assign given period to config.increment', () => {
        expect(limiter._config.increment).to.equal(config.increment);
      });

      it('should create _requestCounters', () => {
        expect(limiter._requestCounters).to.exist;
      });

    });

  });

  describe('#_errorCheckForKey', () => {

    it('should error if no key is given', () => {
      expect(() => { limiter._errorCheckForKey(); }).to.throw(Error);
    });

    it('should do nothing if a key is given', () => {
      expect(() => { limiter._errorCheckForKey('anything'); }).to.not.throw(Error);
    });

  });

  describe('#_createRequestCounter', () => {

    beforeEach(() => {
      limiter = new Limiter(config);
      key = 'test';
    });

    it('should call _errorCheckForKey', () => {
      sinon.spy(limiter, '_errorCheckForKey');
      limiter.getRemainingRequests(key);
      expect(limiter._errorCheckForKey).to.have.been.called;
    });

    it('should register a new RequestCounter model if one doesn\'t exist', () => {
      limiter._createRequestCounter(key);

      expect(limiter._requestCounters[key]).to.exist;
    });

    it('should use the same RequestCounter instance with the same key', () => {
      limiter._createRequestCounter(key);
      limiter._requestCounters[key]._limit = config.limit - 2;
      limiter._createRequestCounter(key);

      expect(limiter._requestCounters[key]._limit).to.equal(config.limit - 2);
    });

  });

  describe('#addRequest', () => {

    beforeEach(() => {
      limiter = new Limiter(config);
      key = 'test';
    });

    it('should call _errorCheckForKey', () => {
      sinon.spy(limiter, '_errorCheckForKey');
      limiter.getRemainingRequests(key);
      expect(limiter._errorCheckForKey).to.have.been.called;
    });

    it('should call _createRequestCounter', () => {
      sinon.spy(limiter, '_createRequestCounter');
      limiter.getRemainingRequests(key);
      expect(limiter._createRequestCounter).to.have.been.called;
    });

    it('should return the altered limit after a request', () => {
      let result;
      result = limiter.addRequest(key);
      expect(result).to.equal(config.limit - 1);

      limiter.addRequest(key);
      result = limiter.addRequest(key);
      expect(result).to.equal(config.limit - 3);
    });

  });

  describe('#getRemainingRequests', () => {

    describe('when request within limits', () => {

      beforeEach(() => {
        limiter = new Limiter(config);
        key = 'test';
      });

      it('should call _errorCheckForKey', () => {
        sinon.spy(limiter, '_errorCheckForKey');
        limiter.getRemainingRequests(key);
        expect(limiter._errorCheckForKey).to.have.been.called;
      });

      it('should call _createRequestCounter', () => {
        sinon.spy(limiter, '_createRequestCounter');
        limiter.getRemainingRequests(key);
        expect(limiter._createRequestCounter).to.have.been.called;
      });

      it('should return limit minus the number of requests', () => {
        let request;
        request = limiter.getRemainingRequests(key);
        expect(request).to.equal(config.limit);

        limiter.addRequest(key);
        limiter.addRequest(key);
        request = limiter.getRemainingRequests(key);
        expect(request).to.equal(config.limit - 2);
      });

    });

    describe('when request outside of limits', () => {

      beforeEach(() => {
        limiter = new Limiter({
          limit  : 0,
          period : 0,
        });
        key = 'test';
        limiter.addRequest(key);
        limiter._requestCounters[key]._limit = 0;
      });

      it('should return 0 if request limit is reached', () => {
        expect(limiter.getRemainingRequests(key)).to.equal(0);
      });

    });

  });

});
