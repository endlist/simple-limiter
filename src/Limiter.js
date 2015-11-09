'use strict';

const _           = require('lodash');
const Eligibility = require('./Eligibility');

const DEFAULT_KEY = 'ip';

/**
 * TODO: describe
 */
class Limiter {

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
    const key = _.get(request, this._config.key);
    const limit = this._config.limit;
    const period = this._config.period;

    if (this._eligibility[key] == null) {
      this._eligibility[key] = new Eligibility({ limit, period });
    }

    // const isEligibleRequest = this._eligibility[key].check();

    // if (!isEligibleRequest) {
    //   throw new Error('429');
    // }

    const requestStatus = {
      validity : this._eligibility[key].check(),
      // headers  : this._eligibility[key].getHeaders(),
    };

    return requestStatus;

  }

}
module.exports = Limiter;

