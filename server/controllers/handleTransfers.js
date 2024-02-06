import crypto from "crypto";
import RequiredVaulesValidator from "../utils/requiredValuesValidator.js";
import redisService from "../utils/redis.service.js";
import UsersModel from "../models/UsersModel.js";
import TransfersModel from "../models/TransfersModel.js";

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

    await TransfersModel.create({
      ...data,
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

export { createTransfer, getTransfer };
