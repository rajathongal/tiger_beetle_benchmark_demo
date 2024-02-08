import { promisify } from "util";

class UniqueFIFOStack {
  constructor(stackName, redisClient) {
    this.stackName = stackName;
    this.setKey = `${stackName}:set`;
    this.listKey = `${stackName}:list`;
    this.redisClient = redisClient
  }

  async push(element) {
    // Check if the element is unique
    const isUnique = await this.redisClient.sAdd(this.setKey, element) === 1;

    if (isUnique) {
      // Add the element to the list
      await this.lPush(this.listKey, element);
    } else {
      console.log(`Element "${element}" already exists and won't be added.`);
    }
  }

  async pop() {
    // Remove the last element from the list
    const poppedElement = await this.redisClient.rPop(this.listKey);

    if (poppedElement) {
      // Remove the popped element from the set to allow reinsertion
      await this.redisClient.sRem(this.setKey, poppedElement);
    }

    return poppedElement;
  }

  async getAllElements() {
    // Retrieve all elements in the list
    return this.redisClient.sMembers(this.setKey);
  }
}

export default UniqueFIFOStack;