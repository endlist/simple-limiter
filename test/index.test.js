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

describe('lib', () => {

  it('should exist', () => {
    expect(true).to.be.true;
  });
});
