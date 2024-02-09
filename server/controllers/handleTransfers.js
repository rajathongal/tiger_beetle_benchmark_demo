import crypto from "crypto";
import RequiredVaulesValidator from "../utils/requiredValuesValidator.js";
import redisService from "../utils/redis.service.js";
import UsersModel from "../models/UsersModel.js";
import TransfersModel from "../models/TransfersModel.js";
import scheduler from "node-schedule";
import generateTimeBasedIdentifier from "../utils/timeBasedIdentifierGenerator.js";
import client from "../utils/initTigerBeetleClient.js";

const createTransfer = async (request, response) => {
  try {
    const required = [
      "senderPublicKey",
      "recipientPublicKey",
      "senderAccountId",
      "receiverAccountId",
      "amount",
      "nonce",
      "signature",
    ];

    const validRequestBody = await RequiredVaulesValidator(
      request,
      response,
      required
    );

    if (!validRequestBody) {
      return response.status(404).json({
        success: false,
        message: "Please provide valid values",
      });
    }

    const {
      senderPublicKey,
      recipientPublicKey,
      senderAccountId,
      receiverAccountId,
      amount,
      nonce,
      signature,
    } = request.body;

    const senderAccount = await UsersModel.findOne({
      publicKey: senderPublicKey,
    });
    const receiverAccount = await UsersModel.findOne({
      publicKey: recipientPublicKey,
    });

    if (!senderAccount || !receiverAccount) {
      return response.status(404).json({
        success: false,
        message: "Sender or Recipient Acount not found",
      });
    }

    //  nonce validation
    const nonceInformation = await redisService.get(
      `${senderAccountId}/${nonce}`
    );

    if (
      (!nonceInformation && nonceInformation !== false) ||
      nonceInformation === "true"
    ) {
      return response.status(404).json({
        success: false,
        message: "Nonce expired",
      });
    }

    await redisService.set(`${senderAccountId}/${nonce}`, "true", 600);

    const verify = crypto.createVerify("sha256");

    const data = {
      senderAccountId,
      receiverAccountId,
      senderPublicKey,
      recipientPublicKey,
      amount,
      nonce,
    };

    verify.update(JSON.stringify(data));
    const isDataVerified = verify.verify(senderPublicKey, signature, "hex");

    if (!isDataVerified) {
      return response.status(404).json({
        success: false,
        message: "Malicious signature/transaction received",
      });
    }
    const identifier = generateTimeBasedIdentifier();
    await redisService.batchIdentifiersStack.push(identifier);

    await TransfersModel.create({
      ...data,
      identifier: identifier,
    });

    return response.status(200).json({
      sucess: true,
      message: "Transfer Initiated",
      referenceId: "",
    });
  } catch (error) {
    return response.status(504).json({
      success: false,
      error: error.message,
    });
  }
};

const getTransfer = async (request, response) => {
  try {
  } catch (error) {
    return response.status(504).json({
      success: false,
      error: error.message,
    });
  }
};

const batchExecuteTransfer = async () => {
  try {
    const IsDataAvailable =
      await redisService.batchIdentifiersStack.getAllElements();
    if (IsDataAvailable.length === 0) {
      return;
    }
    const popedIdenifier = await redisService.batchIdentifiersStack.pop();

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

      count += 8190;

      const transferErrors = await client.createTransfers(transfersToExecute)

    }

    return;
  } catch (error) {
    throw error;
  }
};

const batchTransferWorker = async () => {
  try {
    // scheduler.scheduleJob("* * * * * *", batchExecuteTransfer);
    return;
  } catch (error) {
    throw error;
  }
};

export {
  createTransfer,
  getTransfer,
  batchExecuteTransfer,
  batchTransferWorker,
};
