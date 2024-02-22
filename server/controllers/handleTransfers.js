import crypto from "crypto";
import RequiredVaulesValidator from "../utils/requiredValuesValidator.js";
import redisService from "../utils/redis.service.js";
import UsersModel from "../models/UsersModel.js";
import TransfersModel from "../models/TransfersModel.js";
import scheduler from "node-schedule";
import generateTimeBasedIdentifier from "../utils/timeBasedIdentifierGenerator.js";
import client from "../utils/initTigerBeetleClient.js";
import generateUUID from "../utils/initUUIDGenerator.js";
import { countDecimals } from "../utils/validators.js";
import { fork } from "child_process";
import logger from "../utils/initLogger.js";

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

    if (validRequestBody === true) {
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

      const decimalCountOfAmount = countDecimals(parseFloat(amount));

      if (decimalCountOfAmount > 2) {
        return response.status(404).json({
          success: false,
          message: "Amount Should have a maximum of 2 decimal places",
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
      const referenceId = generateUUID();
      await redisService.batchIdentifiersStack.push(identifier);

      await TransfersModel.create({
        ...data,
        identifier: identifier,
        transactionId: referenceId.toString(),
      });

      return response.status(200).json({
        sucess: true,
        message: "Transfer Initiated",
        transactionId: referenceId.toString(),
      });
    }
  } catch (error) {
    return response.status(504).json({
      success: false,
      error: error.message,
    });
  }
};

const getTransferByTransactionId = async (request, response) => {
  try {
    const { transactionId } = request.params;

    if (transactionId === ":transactionId" || !transactionId) {
      return response.status(404).json({
        message: "Please provide valid transactionId",
      });
    }

    const transfer = await client.lookupTransfers([BigInt(transactionId)]);

    if (transfer.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    if (transfer[0].pending_id !== BigInt(0)) {
      return response.status(404).json({
        success: false,
        message: "Transfer Failed or Pending",
      });
    }

    return response.status(200).json({
      sucess: true,
      message: "Transfer Sucessful",
    });
  } catch (error) {
    return response.status(504).json({
      success: false,
      error: error.message,
    });
  }
};

const batchTransferWorker = async () => {
  try {
    const IsDataAvailable =
      await redisService.batchIdentifiersStack.getAllElements();

    if (IsDataAvailable.length === 0) {
      logger.trace("Batch Processor exiting due to no records available");

      return;
    }
    const childProcess = fork("./server/controllers/batchTransferWorker.js");

    childProcess.on("message", (message) => {
      logger.info("Message from child:", message);
    });

    // Optional: Handle errors and restarts
    childProcess.on("error", (err) => {
      logger.error("Error in child process:", err);
    });
  } catch (error) {
    throw error;
  }
};

const initBatchTransferWorker = async () => {
  try {
    scheduler.scheduleJob("* * * * * *", batchTransferWorker);
    return;
  } catch (error) {
    throw error;
  }
};

export {
  createTransfer,
  getTransferByTransactionId,
  initBatchTransferWorker,
  batchTransferWorker,
};
