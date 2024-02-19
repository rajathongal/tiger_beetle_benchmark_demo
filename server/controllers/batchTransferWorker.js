import initRedis from "../utils/initRedis.js";
import redisService from "../utils/redis.service.js";
import TransfersModel from "../models/TransfersModel.js";
import client from "../utils/initTigerBeetleClient.js";
import initMongoDB from "../utils/initMongoDB.js";
import mongoose from "mongoose";
import logger from "../utils/initLogger.js";

const batchExecuteTransfer = async () => {
  try {
    const redisClient = await initRedis();
    await redisClient.connect();
    await redisService.initializeRedis(redisClient);
    await initMongoDB();

    const popedIdenifier = await redisService.batchIdentifiersStack.pop();
    if (popedIdenifier) {
      logger.info(
        "Starting Child Process for transfers for identifier: " + popedIdenifier
      );

      // Count documents that match a specific condition
      const totalMatchingRecords = await TransfersModel.countDocuments({
        identifier: popedIdenifier,
      });
      let count = 0;
      let previousRecordId = "";

      // Provides the highest resolution (nanosecond precision) 
      // Returns an array with [seconds, nanoseconds]
      const startTime = process.hrtime();

      batchProcessor: while (count < totalMatchingRecords) {
        const query = previousRecordId
          ? { _id: { $gt: previousRecordId }, identifier: popedIdenifier }
          : { identifier: popedIdenifier };

        const transfersToExecute = await TransfersModel.find(query).limit(8190);

        if (transfersToExecute.length === 0) {
          break batchProcessor;
        }

        const transfersDataToExecute = transfersToExecute.map((transfer) => ({
          id: BigInt(transfer.transactionId),
          debit_account_id: BigInt(transfer.senderAccountId),
          credit_account_id: BigInt(transfer.receiverAccountId),
          amount: BigInt(parseFloat(transfer.amount) * Math.pow(10, 2)),
          pending_id: 0n,
          user_data_128: 0n,
          user_data_64: 0n,
          user_data_32: 0,
          timeout: 0,
          ledger: 1,
          code: 1,
          flags: 0,
          timestamp: 0n,
        }));

        count += 8190;
        previousRecordId =
          transfersToExecute[transfersToExecute.length - 1]._id;
        const transferErrors = await client.createTransfers(
          transfersDataToExecute
        );

        if (transferErrors.length > 0) {
          console.log(transferErrors);
        }
      }

      const tigerBeetleEndTime = process.hrtime(startTime);
      const tigerBeetleExecutionTime = tigerBeetleEndTime[0] + tigerBeetleEndTime[1] / 1000000000;
      logger.info(`Execution time of tiger beetle: ${tigerBeetleExecutionTime.toFixed(3)} seconds for ${totalMatchingRecords} records`);

      const filter = {
        identifier: popedIdenifier,
      };

      const update = {
        $set: { completed: true }, // Set the boolean field to true
      };

      const options = {
        multi: true, // Update multiple documents
      };

      await TransfersModel.updateMany(filter, update, options);

      const endTime = process.hrtime(startTime);
      const executionTime = endTime[0] + endTime[1] / 1000000000;
      logger.info(`Execution time of whole transfer: ${executionTime.toFixed(3)} seconds for ${totalMatchingRecords} records`);
    }

    redisClient.quit();
    mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
};

export default batchExecuteTransfer();
