'use strict';

const TokenBucket = require('./TokenBucket');
const _           = require('lodash');

/**
 * RateLimiter Class
 *
 * Handles creation and destruction of TokenBuckets by key.
 */
class RateLimiter {

  /**
   * Creates a RateLimiter object.
   *
   * @param {object} config configuration values
   * @property {integer} limit The max amount of tokens per period.
   * @property {integer} period The time in ms before tokens will increment.
   * @property {integer} increment The amount of tokens that will increment each period.
   */
  constructor(config) {
    let limit     = null;
    let period    = null;
    let increment = null;

    if (config != null) {
      limit     = config.limit;
      period    = config.period;
      increment = config.increment;
    }

    this.config = { limit, period, increment };
    this.tokenBuckets = {};
  }

  /**
   * Cleans up each TokenBucket and nulls the array.
   */
  destroy() {
    _.each(this.tokenBuckets, (value, key) => {
      this.tokenBuckets[key].destroy();
      delete this.tokenBuckets[key];
    });
  }

  /**
   * Helper to throw an error if the key is invalid.
   *
   * @param {key} key The identifier for the request
   * @throws {Error} throw error when key is invalid
   * @private
   */
  _errorCheckForKey(key) {
    if (key == null || typeof(key) != 'string') {
      throw new Error('Error: key is required.');
    }
  }

  /**
   * Helper to create a new TokenBucket if needed.
   *
   * @param {string} key The identifier for the request
   * @private
   */
  _createTokenBucket(key) {
    this._errorCheckForKey(key);

    if (this.tokenBuckets[key] == null) {
      const limit = this.config.limit;
      const period = this.config.period;

      this.tokenBuckets[key] = new TokenBucket({ limit, period });
    }
  }

  /**
   * Appropriately decrements the remaining token availability
   * when called and returns the remainder.
   *
   * @param {string} key The identifier for the request
   * @param {integer} [amount] The number to decrement by
   * @return {integer} Remaining request count
   */
  decrementTokens(key, amount) {
    this._errorCheckForKey(key);
    this._createTokenBucket(key);
    this.tokenBuckets[key].decrementTokens(amount);

    return this.tokenBuckets[key].getTokensRemaining();
  }

  /**
   * Returns the remaining request count for the given key.
   * If the key doesn't already exist, it will create it.
   *
   * @param {string} key The identifier for the request
   * @return {integer} Remaining request count
   */
  getTokensRemaining(key) {
    this._errorCheckForKey(key);
    this._createTokenBucket(key);

    return this.tokenBuckets[key].getTokensRemaining();
  }

}

module.exports = RateLimiter;
