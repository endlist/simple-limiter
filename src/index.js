'use strict';

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
    this.config = config;
  }

}
module.exports = Limiter;

