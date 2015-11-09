'use strict';

const DEFAULT_LIMIT     = 25;
const DEFAULT_PERIOD    = 500;
const DEFAULT_INCREMENT = 1;

/**
 * RequestCounter
 */
class RequestCounter {

  /**
   * @param {object} config Object of values
   * @return {object} An instance of the request counter object
   */
  constructor(config) {
    let limit     = DEFAULT_LIMIT;
    let period    = DEFAULT_PERIOD;
    let increment = DEFAULT_INCREMENT;

    if (config != null) {
      if (config.limit != null) {
        limit = config.limit;
      }
      if (config.period != null) {
        period = config.period;
      }
      if (config.increment != null) {
        increment = config.increment;
      }
    }

    this._maxLimit  = this._limit             = limit;
    this._period    = period;
    this._increment = increment;
    this._startTime = (new Date()).valueOf();

    this.interval = setInterval(() => {
      this.incrementLimit();
    }, period);

    return this;
  }

  /**
   * @return empty
   */
  destroy() {
    clearInterval(this.interval);
    this.interval = null;
  }

  /**
   * @return empty
   */
  incrementLimit() {
    if (this._limit < this._maxLimit) {
      this._limit += this._increment;
    }
  }

  /**
   * @return {int} The remaining available requests for the identifier
   */
  add() {
    if (this._limit > 0) {
      this._limit--;
    }

    return this._limit; 
  }

  /**
   * @return {int} The remaining available requests for the identifier
   */
  getRemaining() {
    return this._limit;
  }

};

module.exports = RequestCounter;
