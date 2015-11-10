'use strict';

const DEFAULT_LIMIT     = 25;
const DEFAULT_PERIOD    = 5000;
const DEFAULT_INCREMENT = 1;

/**
 * TokenBucket
 *
 * Handles how many tokens are available at any given time based on
 * the configuration set and the token bucket algorithm.
 *
 * @see https://en.wikipedia.org/wiki/Token_bucket
 */
class TokenBucket {

  /**
   * Creates a TokenBucket object.
   *
   * @param {object} config configuration values
   * @property {integer} [limit=25] The max amount of tokens per period.
   * @property {integer} [period=5000] The time in ms before tokens will increment.
   * @property {integer} [increment=1] The amount of tokens that will increment each period.
   */
  constructor(config) {
    config = config || {};

    const period    = config.period || DEFAULT_PERIOD;

    this.limit = this.tokens = config.limit || DEFAULT_LIMIT;
    this.increment = config.increment || DEFAULT_INCREMENT;

    this._interval = setInterval(() => {
      this._incrementTokens();
    }, period);
  }

  /**
   * Cleans up the interval set by the constructor.
   */
  destroy() {
    clearInterval(this._interval);
    this._interval = null;
  }

  /**
   * Helper to increment tokens on the interval.
   *
   * @private
   */
  _incrementTokens() {
    if (this.tokens < this.limit) {
      this.tokens += this.increment;
    }
  }

  /**
   * Decrements the amount of tokens available based on amount
   * and returns the value.
   *
   * @param {integer} [amount=1] The number to decrement by
   * @return {integer} The remaining available requests for the identifier
   */
  decrementTokens(amount) {
    amount = amount || 1;

    if (this.tokens > 0) {
      this.tokens -= amount;
    }

    return this.tokens; 
  }

  /**
   * Returns the currently available tokens.
   *
   * @return {integer} The remaining available requests for the identifier
   */
  getTokensRemaining() {
    return this.tokens;
  }

};

module.exports = TokenBucket;
