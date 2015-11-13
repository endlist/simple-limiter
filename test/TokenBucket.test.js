'use strict';
const chai       = require('chai');
const sinon      = require('sinon');
const sinonChai  = require('sinon-chai');
const START_TIME = 140000;

chai.use(sinonChai);

const expect = chai.expect;

describe('TokenBucket', () => {
  let TokenBucket;
  let defaultConfig;
  let config;
  let clock;
  let tokenBucket;

  beforeEach(() => {
    TokenBucket = require('../src/TokenBucket.js');
    defaultConfig = { // default config
      incrementInterval : 5000,
      limit             : 25,
      increment         : 1,
    };
    config = {
      incrementInterval : 500,
      limit             : 20,
      increment         : 2,
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
        clock.tick(defaultConfig.incrementInterval + 1);
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
        clock.tick(config.incrementInterval + 1);
        expect(tokenBucket._incrementTokens).to.have.been.calledOnce;

        clock.tick(config.incrementInterval);
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
      clock.tick(config.incrementInterval + 1);
      expect(tokenBucket._incrementTokens).to.not.be.called;
    });

    it('should destroy the interval', () => {
      expect(tokenBucket.interval).to.not.exist;
    });

  });

  // TODO : cleanup
  describe('#_incrementTokens', () => {

    beforeEach(() => {
      tokenBucket = new TokenBucket(config);
    });

    afterEach(() => {
      tokenBucket.destroy();
    });

    it('should increment tokens if not at limit', () => {
      tokenBucket.tokens = 0;
      tokenBucket._incrementTokens();
      expect(tokenBucket.tokens).to.equal(config.increment);
    });

    it('should not increment tokens past limit', () => {
      tokenBucket._incrementTokens();
      expect(tokenBucket.tokens).to.equal(config.limit);
    });

    it('should not increment tokens past limit by addition', () => {
      tokenBucket.tokens = config.limit - config.increment + 1;
      tokenBucket._incrementTokens();
      expect(tokenBucket.tokens).to.equal(config.limit);
    });

    it('should gain config.increment tokens at the end of the config.incrementInterval', () => {
      tokenBucket.tokens = 0;
      clock.tick(config.incrementInterval + 1);
      expect(tokenBucket.tokens).to.equal(config.increment);
    });

  });
  // END TODO: cleanup

  describe('#decrementTokens', () => {

    beforeEach(() => {
      tokenBucket = new TokenBucket(config);
    });

    afterEach(() => {
      tokenBucket.destroy();
    });

    it('should decrement tokens when enough tokens are available', () => {
      tokenBucket.decrementTokens();
      expect(tokenBucket.tokens).to.equal(config.limit - 1);
    });

    it('should throw error if tokens are less than the decrement amount', () => {
      tokenBucket.tokens = 0;
      expect(() => { tokenBucket.decrementTokens(); }).to.throw(Error);
    });

    it('should take an amount and decrement that given amount of tokens', () => {
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

    it('should return the tokens remaining', () => {
      expect(tokenBucket.getTokensRemaining()).to.equal(tokenBucket.tokens);
    });

  });

});
