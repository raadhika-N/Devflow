const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({
  maxRetriesPerRequest: null
});

const embeddingQueue = new Queue('embeddingQueue', {
  connection
});

module.exports = { embeddingQueue, connection };