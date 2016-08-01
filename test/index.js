'use strict';

const tap = require('tap');
const P = require('bluebird');

const requireInject = require('require-inject');
const redisMock = require('redis-mock');
const redisPool = requireInject.installGlobally('../', {
  redis: redisMock
});

tap.test('redisPool releases a pool after a withConnection block', t => {
  t.equal(redisPool.getPoolSize(), 1);
  t.equal(redisPool.inUseObjectsCount(), 0); 
  return redisPool.withConnection(conn => {
    t.ok(conn);
    t.equal(redisPool.getPoolSize(), 2);
    return P.resolve()
      .then(() => {
        t.equal(redisPool.getPoolSize(), 2);
        t.equal(redisPool.inUseObjectsCount(), 1); 
      });
  })
  .then(() => {
    t.equal(redisPool.getPoolSize(), 2); 
    t.equal(redisPool.inUseObjectsCount(), 0); 
    redisPool.drainAsync().then(() => redisPool.destroyAllNow());
  });
  
});
