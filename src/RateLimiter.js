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
   * @param {integer} config.limit The max amount of tokens per incrementInterval.
   * @param {integer} config.incrementInterval The time in ms before tokens will increment.
   * @param {integer} config.increment The amount of tokens that will increment each incrementInterval.
   */
  constructor(config) {
    let limit             = null;
    let incrementInterval = null;
    let increment         = null;

    if (config != null) {
      limit             = config.limit;
      incrementInterval = config.incrementInterval;
      increment         = config.increment;
    }

    this.config = { limit, incrementInterval, increment };
    this.tokenBuckets = {};

    this._interval = setInterval(() => {
      this._cleanup();
    }, incrementInterval);
  }

  /**
   * Cleans up unused TokenBuckets
   */
  _cleanup() {
    _.each(this.tokenBuckets, (value, key) => {
      const tokenBucket = this.tokenBuckets[key];
      if (tokenBucket.tokens == tokenBucket.limit) {
        tokenBucket.destroy();
        delete this.tokenBuckets[key];
      }
    });
  }

  /**
   * Cleans up all TokenBuckets and nulls the array.
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
    if (key == null) {
      throw new Error('key is required');
    }
    else if(typeof(key) != 'string') {
      throw new Error('key is not a string');
    }
  }

  /**
   * Helper to create a new TokenBucket if needed.
   *
   * @param {string} key The identifier for the request
   * @private
   */
  _getTokenBucket(key) {
    this._errorCheckForKey(key);

    if (this.tokenBuckets[key] == null) {
      const limit = this.config.limit;
      const increment = this.config.increment;
      const incrementInterval = this.config.incrementInterval;

      this.tokenBuckets[key] = new TokenBucket({ limit, increment, incrementInterval });
    }

    return this.tokenBuckets[key];
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
    const tokenBucket = this._getTokenBucket(key);

    return tokenBucket.decrementTokens(amount);
  }

  /**
   * Returns the remaining request count for the given key.
   * If the key doesn't already exist, it will create it.
   *
   * @param {string} key The identifier for the request
   * @return {integer} Remaining request count
   */
  getTokensRemaining(key) {
    const tokenBucket = this._getTokenBucket(key);

    return tokenBucket.getTokensRemaining();
  }

}

module.exports = RateLimiter;
