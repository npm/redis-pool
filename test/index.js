'use strict';

const tap = require('tap');
const P = require('bluebird');

const requireInject = require('require-inject');
const redisMock = require('redis-mock');
const redisPool = requireInject.installGlobally('../', {
  redis: redisMock
});

tap.test('redisPool releases a pool after a withConnection block', t => {
  t.equal(redisPool.size, 1);
  t.equal(redisPool.borrowed, 0); 
  return redisPool.withConnection(conn => {
    t.ok(conn);
    t.ok(redisPool.size >= 1);
    return P.resolve()
      .then(() => {
        t.ok(redisPool.size >= 1);
        t.equal(redisPool.borrowed, 1); 
      });
  })
  .then(() => {
    t.ok(redisPool.size >= 1); 
    t.equal(redisPool.borrowed, 0); 
    redisPool.drain().then(() => redisPool.clear());
  });
  
});
