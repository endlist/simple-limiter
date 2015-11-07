'use strict';

const _ = require('lodash');

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

    // return requests left
  }

  checkRequest(opts) {

    if (opts == null) {
      throw new Error('Error: opts are required.');
    }

    const request  = opts.request;
    const response = opts.response;
  }

}
module.exports = Limiter;

