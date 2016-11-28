'use strict';

const P = require('bluebird');

const redis = require('@npmcorp/redis');

module.exports = require('generic-pool').createPool({
  create: function(){
    return new P((resolve, reject) => {
      const client = redis.createClient(process.env.REDIS_URL);
      client.on('connect', function() {
        client.removeListener('error', reject);
        resolve(client);
      });

      client.once('error', reject);
    })
  },
  destroy: function(client){
    client.end()
  }
}, {
  max: 10,
  min: 1,
  idleTimeoutMillis: 30000,
  evictionRunIntervalMillis: 15000,
  numTestsPerRun: 10,
  Promise: P
})

module.exports.withConnection = function(liftedFn) {
  const redisP = this.acquire();
  return redisP.then(conn => {
    return redisP.then(liftedFn).finally(x => this.release(conn))
  });
};
