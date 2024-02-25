import logger from "./initLogger.js";
class UniqueFIFOStack {
  constructor(stackName, redisClient) {
    this.stackName = stackName;
    this.setKey = `${stackName}:set`;
    this.listKey = `${stackName}:list`;
    this.lockKey = `${stackName}:lock`;
    this.redisClient = redisClient;
  }

  async push(element) {
    let tryCount = 1;
    let lockAcquiredFlag = false;
    const max_retries = 100;

    retryLoop: while (!lockAcquiredFlag) {
      if (tryCount > max_retries) {
        logger.warn("Retries Maxed out");
        break retryLoop;
      }
      tryCount++;

      const lockAcquired = await this.redisClient.setNX(this.lockKey, "1");

      if (!lockAcquired) {
        logger.warn("Unable to acquire lock, will retry later...");
      }

      try {
        lockAcquiredFlag = true;

        // Check if the element is unique
        const isUnique =
          (await this.redisClient.sAdd(this.setKey, element)) === 1;

        if (isUnique) {
          // Add the element to the list
          await this.redisClient.lPush(this.listKey, element);
        } else {
          logger.warn(
            `Element "${element}" already exists and won't be added.`
          );
        }
      } finally {
        // Ensure lock release even if errors occur
        await this.redisClient.del(this.lockKey);
      }
    }
  }

  async pop() {
    let tryCount = 1;
    let lockAcquiredFlag = false;
    const max_retries = 100;
    retryLoop: while (!lockAcquiredFlag) {
      if (tryCount > max_retries) {
        logger.warn("Retries Maxed out");
        break retryLoop;
      }
      tryCount++;

      const lockAcquired = await this.redisClient.setNX(this.lockKey, "1");

      if (!lockAcquired) {
        logger.warn("Unable to acquire lock, will retry later...");
        return;
      }
      try {
        lockAcquiredFlag = true;
        // Remove the last element from the list
        const poppedElement = await this.redisClient.rPop(this.listKey);

        if (poppedElement) {
          // Remove the popped element from the set to allow reinsertion
          await this.redisClient.sRem(this.setKey, poppedElement);
        }

        return poppedElement;
      } finally {
        // Ensure lock release even if errors occur
        await this.redisClient.del(this.lockKey);
      }
    }
  }

  async getAllElements() {
    // Retrieve all elements in the list
    return this.redisClient.sMembers(this.setKey);
  }
}

export default UniqueFIFOStack;
