'use strict';

const DEFAULT_LIMIT              = 25;
const DEFAULT_INCREMENT_INTERVAL = 5000;
const DEFAULT_INCREMENT          = 1;

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
   * @param {integer} [config.limit=25] The max amount of tokens per incrementInterval.
   * @param {integer} [config.incrementInterval=5000] The time in ms before tokens will increment.
   * @param {integer} [config.increment=1] The amount of tokens that will increment each incrementInterval.
   */
  constructor(config) {
    config = config || {};

    const incrementInterval = config.incrementInterval || DEFAULT_INCREMENT_INTERVAL;

    this.limit = this.tokens = config.limit || DEFAULT_LIMIT;
    this.increment = config.increment || DEFAULT_INCREMENT;

    this._interval = setInterval(() => {
      this._incrementTokens();
    }, incrementInterval);
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

      if (this.tokens > this.limit) {
        this.tokens = this.limit;
      }
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

    if (this.tokens >= amount) {
      this.tokens -= amount;
    }
    else {
      throw new Error('not enough tokens');
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
