import { createClient } from "redis";

const initRedis = async () => {
  try {

    return createClient({
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT)
        }
    });
  } catch (error) {
    console.error(error);
    console.error(`Error initializing redis: ${error}`);
  }
};

export default initRedis;
