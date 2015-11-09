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
  let validOpts;
  let Eligibility;

  beforeEach(() => {
    config = {
      key    : 'user.id',
      limit  : 20,
      period : 5000,
    };
    validOpts = {
      request : {
        user : {
          id : 'something'
        }
      },
      response : {},
    }
    Eligibility = require('./mocks/Eligibility.mock.js');
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

      it('should assign DEFAULT_KEY to config.key', () => {
        expect(limiter._config.key).to.equal('ip');
      });

      it('should default config.limit to null', () => {
        expect(limiter._config.limit).to.not.exist;
      });

      it('should default config.period to null', () => {
        expect(limiter._config.period).to.not.exist;
      });

      it('should create _eligibility', () => {
        expect(limiter._eligibility).to.exist;
      });

    });

    describe('with only key in config', () => {

      beforeEach(() => {
        limiter = new Limiter({ key : 'user' });
      });

      it('should assign given key to config.key', () => {
        expect(limiter._config.key).to.equal('user');
      });

      it('should default config.limit to null', () => {
        expect(limiter._config.limit).to.not.exist;
      });

      it('should default config.period to null', () => {
        expect(limiter._config.period).to.not.exist;
      });

      it('should create _eligibility', () => {
        expect(limiter._eligibility).to.exist;
      });

    });

    describe('with config', () => {

      beforeEach(() => {
        limiter = new Limiter({ 
          key    : 'something.else',
          limit  : 200,
          period : 8000,
        });
      });

      it('should assign given key to config.key', () => {
        expect(limiter._config.key).to.equal('something.else');
      });

      it('should assign given period to config.limit', () => {
        expect(limiter._config.limit).to.equal(200);
      });

      it('should assign given period to config.period', () => {
        expect(limiter._config.period).to.equal(8000);
      });

      it('should create _eligibility', () => {
        expect(limiter._eligibility).to.exist;
      });

    });

  });

  describe('#checkRequest', () => {
    let request;
    let response;

    beforeEach(() => {
      request = validOpts.request;
      response = validOpts.response;
    });

    describe('when request within limits', () => {

      beforeEach(() => {
        limiter = new Limiter(config);
      });

      it('should error if no opts are given', () => {
        expect(limiter.checkRequest).to.throw('Error');
      });

      it('should register a new Eligibility model if one doesn\'t exist', () => {
        limiter.checkRequest({ request, response })

        expect(limiter._eligibility[request.user.id]).to.exist;
        expect(limiter._eligibility[request.user.id]._requestCount).to.equal(1);
      });

      it('should use the same Eligibility instance with the same key', () => {
        limiter.checkRequest({ request, response });
        limiter.checkRequest({ request, response });
        expect(limiter._eligibility[request.user.id]._requestCount).to.equal(2);
      });

    });

    describe('when request outside of limits', () => {

      beforeEach(() => {
        limiter = new Limiter({
          key    : 'user.id',
          limit  : 0,
          period : 0,
        });
      });

      xit('should throw error if eligibility is false', () => {
        expect(() => { limiter.checkRequest({ request, response }) }).to.throw(Error);
      });

    });

  });

});
