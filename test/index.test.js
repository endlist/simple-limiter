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

// filter?
describe('Limiter', () => {
  let Limiter;

  beforeEach(() => {
    Limiter = require('../src/index.js');
  });

  it('should take a config', () => {
    const config = {
      hi : 'yo'
    };
    Limiter.init(config);
    expect(Limiter.config).to.eql(config);
  });

});
