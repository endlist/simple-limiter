'use strict';

const RequestCounter = require('./RequestCounter');

/**
 * Limiter
 */
class Limiter {

  /**
   * @param {object} config Object of values
   * @return empty
   */
  constructor(config) {
    let limit = null;
    let period = null;
    let increment = null;

    if (config != null) {
      limit     = config.limit;
      period    = config.period;
      increment = config.increment;
    }

    this._config = { limit, period, increment };
    this._requestCounters = {};
  }

  /**
   * @param {key} key The identifier for the request
   * @return empty
   */
  _errorCheckForKey(key) {
    if (key == null) {
      throw new Error('Error: key is required.');
    }
  }

  /**
   * @param {string} key The identifier for the request
   * @return empty
   */
  _createRequestCounter(key) {
    this._errorCheckForKey(key);

    if (this._requestCounters[key] == null) {
      const limit = this._config.limit;
      const period = this._config.period;

      this._requestCounters[key] = new RequestCounter({ limit, period });
    }
  }

  /**
   * @param {string} key The identifier for the request
   * @return {integer} Remaining request count
   */
  addRequest(key) {
    this._errorCheckForKey(key);
    this._createRequestCounter(key);
    this._requestCounters[key].add();

    return this._requestCounters[key].getRemaining();
  }

  /**
   * @param {string} key The identifier for the request
   * @return {integer} Remaining request count
   */
  getRemainingRequests(key) {
    this._errorCheckForKey(key);
    this._createRequestCounter(key);

    return this._requestCounters[key].getRemaining();
  }

}
module.exports = Limiter;

