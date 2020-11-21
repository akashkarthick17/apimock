import redis from 'redis';
import { promisify } from 'util';

const redisClient = redis.createClient();

export const redisGetAsync = promisify(redisClient.get).bind(redisClient);
export const redisSetAsync = promisify(redisClient.set).bind(redisClient);
export const redisDelAsync = promisify(redisClient.del).bind(redisClient);
export const redisExistsAsync = promisify(redisClient.exists).bind(redisClient);
