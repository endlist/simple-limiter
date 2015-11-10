'use strict';
const chai       = require('chai');
const sinon      = require('sinon');
const sinonChai  = require('sinon-chai');
const START_TIME = 140000;

chai.use(sinonChai);

const expect = chai.expect;

describe('TokenBucket', () => {
  let TokenBucket;
  let config;
  let clock;
  let tokenBucket;

  beforeEach(() => {
    TokenBucket = require('../src/TokenBucket.js');
    config = { // default config
      period    : 5000,
      limit     : 25,
      increment : 1,
    };
    clock = sinon.useFakeTimers(START_TIME);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('#constructor', () => {

    it('should not error if not given a config', () => {
      expect(() => { return new TokenBucket(); }).not.to.throw(Error);
    });

    describe('without config', () => {

      beforeEach(() => {
        tokenBucket = new TokenBucket();
        sinon.spy(tokenBucket, '_incrementTokens');
      });

      afterEach(() => {
        tokenBucket.destroy();
      });

      it('should return an object', () => {
        expect(tokenBucket).to.be.an('object');
      });

      it('should create maxLimit', () => {
        expect(tokenBucket.limit).to.exist;
      });

      it('should create limit', () => {
        expect(tokenBucket.tokens).to.exist;
      });

      it('should create a increment', () => {
        expect(tokenBucket.increment).to.exist;
      });

      it('should set up an interval calling _incrementTokens', () => {
        clock.tick(config.period + 1);
        expect(tokenBucket._incrementTokens).to.have.been.called;
      });

    });

    describe('with config', () => {

      beforeEach(() => {
        tokenBucket = new TokenBucket(config);
        sinon.spy(tokenBucket, '_incrementTokens');
      });

      afterEach(() => {
        tokenBucket.destroy();
      });

      it('should return an object', () => {
        expect(tokenBucket).to.be.an('object');
      });

      it('should create maxLimit', () => {
        expect(tokenBucket.limit).to.exist;
      });

      it('should create limit', () => {
        expect(tokenBucket.tokens).to.exist;
      });

      it('should create a increment', () => {
        expect(tokenBucket.increment).to.exist;
      });

      it('should set up an interval calling _incrementTokens', () => {
        clock.tick(config.period + 1);
        expect(tokenBucket._incrementTokens).to.have.been.calledOnce;

        clock.tick(config.period);
        expect(tokenBucket._incrementTokens).to.have.been.calledTwice;
      });

    });

  });

  describe('#destroy', () => {
    let destroyToken;

    beforeEach(() => {
      tokenBucket = new TokenBucket();
      destroyToken = sinon.spy(tokenBucket, '_incrementTokens');
      tokenBucket.destroy();
    });

    it('should clear the interval', () => {
      clock.tick(config.period + 1);
      expect(tokenBucket._incrementTokens).to.not.be.called;
    });

    it('should destroy the interval', () => {
      expect(tokenBucket.interval).to.not.exist;
    });

  });

  describe('#_incrementTokens', () => {

    beforeEach(() => {
      tokenBucket = new TokenBucket(config);
    });

    afterEach(() => {
      tokenBucket.destroy();
    });

    it('should increment _currentLimit if not at limit', () => {
      tokenBucket.tokens = 0;
      tokenBucket._incrementTokens();
      expect(tokenBucket.tokens).to.equal(1);
    });

    it('should not increment _currentLimit past limit', () => {
      tokenBucket._incrementTokens();
      expect(tokenBucket.tokens).to.equal(config.limit);
    });

  });

  describe('#decrementTokens', () => {

    beforeEach(() => {
      tokenBucket = new TokenBucket(config);
    });

    afterEach(() => {
      tokenBucket.destroy();
    });

    it('should decrement limit when below limit', () => {
      tokenBucket.decrementTokens();
      expect(tokenBucket.tokens).to.equal(config.limit - 1);
    });

    it('should not decrement limit if already at limit', () => {
      tokenBucket.tokens = 0;
      tokenBucket.decrementTokens();
      expect(tokenBucket.tokens).to.equal(0);
    });

    it('should reset at the end of the period', () => {
      tokenBucket.decrementTokens();
      clock.tick(config.period + 1);
      expect(tokenBucket.tokens).to.equal(config.limit);
    });

    it('should take an amount', () => {
      tokenBucket.decrementTokens(5);
      expect(tokenBucket.tokens).to.equal(config.limit - 5);
    });

  });

  describe('#getTokensRemaining', () => {

    beforeEach(() => {
      tokenBucket = new TokenBucket(config);
    });

    afterEach(() => {
      tokenBucket.destroy();
    });

    it('should return the limit', () => {
      expect(tokenBucket.getTokensRemaining()).to.equal(tokenBucket.tokens);
    });

  });

});
