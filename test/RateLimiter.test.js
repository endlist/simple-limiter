'use strict';
const chai       = require('chai');
const sinon      = require('sinon');
const sinonChai  = require('sinon-chai');
const proxyquire = require('proxyquire');
const _          = require('lodash');
const START_TIME = 140000;

chai.use(sinonChai);

const expect = chai.expect;

describe('RateLimiter', () => {
  let RateLimiter;
  let rateLimiter;
  let config;
  let key;
  let TokenBucketStub;
  let sandbox;
  let clock;

  beforeEach(() => {
    config = {
      limit             : 20,
      incrementInterval : 5000,
      increment         : 2,
    };
    const TokenBucket = require('../src/TokenBucket.js');
    const mockTokenBucket = sinon.createStubInstance(TokenBucket);
    TokenBucketStub = sinon.stub().returns(mockTokenBucket);

    RateLimiter = proxyquire('../src/RateLimiter.js', {
      './TokenBucket': TokenBucketStub,
    });
    clock = sinon.useFakeTimers(START_TIME);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('#constructor', () => {
    it('should not error if not given a config', () => {
      expect(() => { return new RateLimiter(); }).not.to.throw(Error);
    });

    describe('without config', () => {

      beforeEach(() => {
        rateLimiter = new RateLimiter();
      });

      afterEach(() => {
        rateLimiter.destroy();
      });

      it('should return an object', () => {
        expect(rateLimiter).to.be.an('object');
      });

      it('should default config.limit to null', () => {
        expect(rateLimiter.config.limit).to.not.exist;
      });

      it('should default config.incrementInterval to null', () => {
        expect(rateLimiter.config.incrementInterval).to.not.exist;
      });

      it('should default config.increment to null', () => {
        expect(rateLimiter.config.increment).to.not.exist;
      });

      it('should create tokenBuckets', () => {
        expect(rateLimiter.tokenBuckets).to.exist;
      });

    });

    describe('with config', () => {

      beforeEach(() => {
        config = {
          limit             : 200,
          incrementInterval : 8000,
          increment         : 2,
        };
        rateLimiter = new RateLimiter(config);
      });

      afterEach(() => {
        rateLimiter.destroy();
      });

      it('should return an object', () => {
        expect(rateLimiter).to.be.an('object');
      });

      it('should assign given incrementInterval to config.limit', () => {
        expect(rateLimiter.config.limit).to.equal(config.limit);
      });

      it('should assign given incrementInterval to config.incrementInterval', () => {
        expect(rateLimiter.config.incrementInterval).to.equal(config.incrementInterval);
      });

      it('should assign given incrementInterval to config.increment', () => {
        expect(rateLimiter.config.increment).to.equal(config.increment);
      });

      it('should create tokenBuckets', () => {
        expect(rateLimiter.tokenBuckets).to.exist;
      });

    });

  });

  describe('#destroy', () => {
    let destroyOne;
    let destroyTwo;
    let destroyThree;
    let sandbox;

    beforeEach(() => {
      rateLimiter = new RateLimiter(config);
      rateLimiter.getTokensRemaining('one');
      rateLimiter.getTokensRemaining('two');
      rateLimiter.getTokensRemaining('three');
      destroyOne = rateLimiter.tokenBuckets.one.destroy;
      destroyTwo = rateLimiter.tokenBuckets.two.destroy;
      destroyThree = rateLimiter.tokenBuckets.three.destroy;
      rateLimiter.destroy();
    });

    it('should call destroy() on each key in tokenBuckets', () => {
      expect(destroyOne).to.have.been.called;
      expect(destroyTwo).to.have.been.called;
      expect(destroyThree).to.have.been.called;
    });

    it('should null out the objects', () => {
      expect(rateLimiter.tokenBuckets.one).to.not.exist;
      expect(rateLimiter.tokenBuckets.two).to.not.exist;
      expect(rateLimiter.tokenBuckets.three).to.not.exist;
    });

  });

  describe('#decrementTokens', () => {
    let amount;

    beforeEach(() => {
      rateLimiter = new RateLimiter(config);
      key = 'testorama';
      amount = 5;
    });

    afterEach(() => {
      rateLimiter.destroy();
    });

    describe('key validation', () => {

      it('should error if nothing is given', () => {
        expect(() => { rateLimiter.decrementTokens(); }).to.throw(Error);
      });

      describe('when key is not on an object', () => {

        it('should error on int', () => {
          expect(() => { rateLimiter.decrementTokens(3); }).to.throw(Error);
        });

        it('should error on function', () => {
          expect(() => { rateLimiter.decrementTokens(() => {}); }).to.throw(Error);
        });

        it('should error on object', () => {
          expect(() => { rateLimiter.decrementTokens({ key }); }).to.throw(Error);
        });

      });

      it('should not error on valid key', () => {
        expect(() => { rateLimiter.decrementTokens(key); }).to.not.throw(Error);
      });

    });

    it('should call TokenBucket if the key is new', () => {
      rateLimiter.decrementTokens(key);
      expect(TokenBucketStub).to.have.been.calledWith(config);
    });

    it('should not call TokenBucket if the key already exists', () => {
      rateLimiter.decrementTokens(key);
      rateLimiter.decrementTokens(key);
      rateLimiter.decrementTokens(key);
      rateLimiter.decrementTokens(key);
      expect(TokenBucketStub).to.have.been.calledOnce;
    });

    it('should call decrementTokens on TokenBucket instance', () => {
      rateLimiter.decrementTokens(key);
      expect(rateLimiter.tokenBuckets[key].decrementTokens).to.have.been.called;
    });

    it('should call decrementTokens with an amount if given one', () => {
      rateLimiter.decrementTokens(key, 5);
      expect(rateLimiter.tokenBuckets[key].decrementTokens).to.have.been.calledWith(5);
    });

  });

  describe('#getTokensRemaining', () => {

    describe('when request within limits', () => {

      beforeEach(() => {
        rateLimiter = new RateLimiter(config);
        key = 'test';
      });

      afterEach(() => {
        rateLimiter.destroy();
      });

      describe('key validation', () => {

        it('should error if no key is given', () => {
          expect(() => { rateLimiter.getTokensRemaining(); }).to.throw(Error);
        });

        describe('when key is not a string', () => {

          it('should error on int', () => {
            expect(() => { rateLimiter.getTokensRemaining(3); }).to.throw(Error);
          });

          it('should error on function', () => {
            expect(() => { rateLimiter.getTokensRemaining(() => {}); }).to.throw(Error);
          });

          it('should error on object', () => {
            expect(() => { rateLimiter.getTokensRemaining({ test: 'object' }) }).to.throw(Error);
          });

        });

        it('should do nothing if a key is given', () => {
          expect(() => { rateLimiter.getTokensRemaining('anything'); }).to.not.throw(Error);
        });

      });

      it('should call TokenBucket if the key is new', () => {
        rateLimiter.getTokensRemaining(key);
        expect(TokenBucketStub).to.have.been.calledWith(config);
      });

      it('should not call TokenBucket if the key already exists', () => {
        rateLimiter.getTokensRemaining(key);
        rateLimiter.getTokensRemaining(key);
        rateLimiter.getTokensRemaining(key);
        rateLimiter.getTokensRemaining(key);
        expect(TokenBucketStub).to.have.been.calledOnce;
      });

      it('should call getTokensRemaining on TokenBucket instance', () => {
        rateLimiter.getTokensRemaining(key);
        expect(rateLimiter.tokenBuckets[key].getTokensRemaining).to.have.been.called;
      });

    });

    it('should clean up tokenBuckets every incrementInterval', () => {
      rateLimiter = new RateLimiter(config);
      rateLimiter.getTokensRemaining('one');
      rateLimiter.getTokensRemaining('two');
      rateLimiter.getTokensRemaining('three');
      clock.tick(config.incrementInterval);
      expect(rateLimiter.tokenBuckets).to.be.empty;
    });

    it('should not clean up tokenBuckets that are active', () => {
      rateLimiter = new RateLimiter(config);
      rateLimiter.tokenBuckets = {
        'one' : { tokens : config.limit, limit : config.limit, destroy : () => {} },
        'two' : { tokens : config.limit, limit : config.limit, destroy : () => {} },
      };
      rateLimiter.getTokensRemaining('three');
      const bucketThree = rateLimiter._getTokenBucket('three');
      bucketThree.tokens = 9;
      clock.tick(config.incrementInterval);
      expect(rateLimiter.tokenBuckets).to.eql({ 'three' : bucketThree });
    });

  });

});
