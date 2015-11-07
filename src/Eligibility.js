'use strict';

const DEFAULT_LIMIT = 20;
const DEFAULT_PERIOD = 5000;

/**
 * Eligibility
 */
class Eligibility {

  /**
   * @param {object} config Object of values
   * @return {object} An instance of the eligibility object
   */
  constructor(config) {
    let limit = DEFAULT_LIMIT;
    let period = DEFAULT_PERIOD;

    if (config != null) {
      if (config.limit != null) {
        limit = config.limit;
      }
      if (config.period != null) {
        period = config.period;
      }
    }

    this._limit           = limit;
    this._period          = period;
    this._startTime       = (new Date()).valueOf();
    this._requestCount    = 0;

    return this;
  }

  /**
   * @return {int} Time remaining expressed as an integer of ms
   */
  _getPeriodRemaining() {
    // convert to rolling instead of fixed buckets

    const dateNow = (new Date()).valueOf();
    let periodRemaining = this._period - dateNow;

    if (periodRemaining < 0) {
      periodRemaining = this._period;
      this._startTime = dateNow;
      this._requestCount = 0;
    }

    return periodRemaining;
  }

  /**
   * @return {boolean} The current eligibility of the request
   */
  check() {
    const periodRemaining = this._getPeriodRemaining();
    this._requestCount++;

    return (periodRemaining > 0 && this._requestCount <= this._limit);
  }

};

module.exports = Eligibility;
