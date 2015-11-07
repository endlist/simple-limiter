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

describe.only('Limiter', () => {
  let Limiter;
  let limiter;
  let config;
  let validOpts;

  beforeEach(() => {
    config = {
      key    : 'usesr.id',
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
    Limiter = require('../src/index.js');
  });

  describe('#constructor', () => {
    it('should not error if not given a config', () => {
      expect(() => { return new Limiter(); }).not.to.throw('Error');
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

    });

  });

  describe('#checkRequest', () => {

    beforeEach(() => {
      limiter = new Limiter(config);
    });

    it('should error if no opts are given', () => {
      expect(limiter.checkRequest).to.throw('Error');
    });

    it('should ')

  });
    
});
