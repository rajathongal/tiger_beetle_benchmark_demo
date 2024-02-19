class UniqueFIFOStack {
  constructor(stackName, redisClient) {
    this.stackName = stackName;
    this.setKey = `${stackName}:set`;
    this.listKey = `${stackName}:list`;
    this.lockKey = `${stackName}:lock`;
    this.redisClient = redisClient;
  }

  async push(element) {
    const lockAcquired = await this.redisClient.setNX(this.lockKey, "1");

    if (!lockAcquired) {
      console.log("Unable to acquire lock, will retry later...");
      return;
    }

    try {
      // Check if the element is unique
      const isUnique =
        (await this.redisClient.sAdd(this.setKey, element)) === 1;

      if (isUnique) {
        // Add the element to the list
        await this.redisClient.lPush(this.listKey, element);
      } else {
        console.log(`Element "${element}" already exists and won't be added.`);
      }
    } finally {
      // Ensure lock release even if errors occur
      await this.redisClient.del(this.lockKey);
    }
  }

  async pop() {
    const lockAcquired = await this.redisClient.setNX(this.lockKey, "1");

    if (!lockAcquired) {
      console.log("Unable to acquire lock, will retry later...");
      return;
    }
    try {
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

  async getAllElements() {
    // Retrieve all elements in the list
    return this.redisClient.sMembers(this.setKey);
  }
}

export default UniqueFIFOStack;
