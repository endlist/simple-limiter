'use strict';

const _           = require('lodash');
const Eligibility = require('./Eligibility');

const DEFAULT_KEY = 'ip';

/**
 * TODO: describe
 */
class Limiter {

  // it will take a request & response and return either nothing or an error

  // create an eligibility check (function) per key
    // store in an object by key (e.g. eligibility[key] is the ref)
    // don't create a new key if one already exists

  // when request comes in
    // eligibility[key].check(), throw 429 error if false, otherwise return


  /**
   * @param {object} config Object of values
   * @return empty
   */
  constructor(config) {
    let key = DEFAULT_KEY; 
    let limit = null;
    let period = null;

    if (config != null) {

      if (config.key != null) {
        key = config.key;
      }

      limit  = config.limit;
      period = config.period;
    }

    this._config = { key, limit, period };
    this._eligibility = {};

    // return requests left
  }

  checkRequest(opts) {

    if (opts == null) {
      throw new Error('Error: opts are required.');
    }

    const request  = opts.request;
    const response = opts.response;
    const key = _.get(request, this._config.key);
    const limit = this._config.limit;
    const period = this._config.period;

    if (this._eligibility[key] == null) {
      this._eligibility[key] = new Eligibility({ limit, period });
    }

    return this._eligibility[key].check();
  }

}
module.exports = Limiter;

