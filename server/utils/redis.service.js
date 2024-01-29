class RedisService {
  // This function will be called during server initialization
  async initializeRedis(client) {
    this.client = client;
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      throw error;
    }
  }
  async set(key, value, expireIn) {
    try {
      if (expireIn == null || expireIn == undefined) {
        return await this.client.set(key, value);
      } else {
        return await this.client.set(key, value, "EX", expireIn);
      }
    } catch (error) {
      throw error;
    }
  }

  async delete(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      throw error;
    }
  }

  deleteKeysMatchingPattern(pattern, count = 100) {
    try {
      let stream = this.client.scanStream({ match: pattern, count });
      let pipeline = this.client.pipeline();

      stream.on("data", (resultKeys) => {
        for (let i = 0; i < resultKeys.length; i++) {
          pipeline.del(resultKeys[i]);
        }

        pipeline.exec();

        pipeline = this.client.pipeline();
      });

      stream.on("end", function () {
        pipeline.exec();
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new RedisService();
