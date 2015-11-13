# simple-limiter
[![Build Status](https://travis-ci.org/endlist/simple-limiter.svg)](https://travis-ci.org/endlist/simple-limiter)

[Code Coverage Report](http://endlist.github.io/simple-limiter/coverage/lcov-report/)  
[Documentation](http://endlist.github.io/simple-limiter/doc/)

simple synchronous library to limit rate by any key using the [token-bucket algorithm](https://en.wikipedia.org/wiki/Token_bucket)

made to work with [super-router](http://github.com/autoric/super-router)

## Usage

This is made to work with Super Router, but can work with any middleware.  Simple Limiter doesn't handle request headers or response for you, but it does return values to make setting the headers and body easy:

```javascript
const SuperRouter = require('super-router');
const RateLimiter = require('simple-limiter').RateLimiter;

module.exports = function() {
  const limiter = New RateLimiter({
    limit             : 20,
    incrementInterval : 5000,
    increment         : 1,
  });

  app.use({
    path    : '/thispath',
    handler : (opts) => {
      const request = opts.request;
      const response = opts.response;
      const key = `${request.yourKey}`;
      const tokensRemaining = limiter.getTokensRemaining(key);

      response.setHeader('X-Rate-Limit-Limit', `${limiter.config.limit}`);
      response.setHeader('X-Rate-Limit-Remaining', `${tokensRemaining}`);

      limiter.decrementTokens(key, 5);
    },
  });
};
```

If you change the default increment and decrement amounts to suit your project, which is recommended, you will run into situations where the user will have tokens remaining, but not enough to cover the cost of a request.

In this case, Simple Limiter throws a default error, which can be caught in middleware and served to the user as-is, or can be transformed to suit your project's standards:

```javascript
try {
  limiter.decrementTokens(ip);
}
catch (error) {
  response.setBody({
    id      : 'RateLimitError',
    code    : 429,
    message : 'Too Many Requests',
  });
}
```
