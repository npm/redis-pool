'use strict';

const P = require('bluebird');
const redis = require('redis');

P.promisifyAll(redis.RedisClient.prototype);

module.exports = redis;
