import redisService from "../utils/redis.service.js";
import TransfersModel from "../models/TransfersModel.js";
import client from "../utils/initTigerBeetleClient.js";

const batchExecuteTransfer = async () => {
  try {
    const IsDataAvailable =
      await redisService.batchIdentifiersStack.getAllElements();

    if (IsDataAvailable.length === 0) {
      console.info("Batch Processor exiting due to no records available");

      return;
    }

    const popedIdenifier = await redisService.batchIdentifiersStack.pop();
    console.info("Executing batch processor for " + popedIdenifier);

    // Count documents that match a specific condition
    const totalMatchingRecords = await TransfersModel.countDocuments({
      identifier: popedIdenifier,
    });
    let count = 0;
    let previousRecordId = "";

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
      previousRecordId = transfersToExecute[transfersToExecute.length - 1]._id;
      const transferErrors = await client.createTransfers(
        transfersDataToExecute
      );

      if (transferErrors.length > 0) {
        console.log(transferErrors);
      }
    }

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

    return;
  } catch (error) {
    throw error;
  }
};
