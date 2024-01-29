import crypto from "crypto";
import RequiredVaulesValidator from "../utils/requiredValuesValidator.js";
import { isUserExists } from "../utils/validators.js";
import redisService from "../utils/redis.service.js";

const GetNonce = async (request, response) => {
  try {
    const required = ["accountId"];
    const validRequestBody = await RequiredVaulesValidator(request, response, required);

    if(!validRequestBody) {
        return response.status(404).json({
            success: false,
            message: "Please provide valid value for accountId" 
        });
    }
    const { accountId } = request.body;
    const userAccount = await isUserExists(accountId);

    if(!userAccount) {
        return response.status(404).json({
            sucess: false,
            message: "Account not found"
        })
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    await redisService.set(`${accountId}/${nonce}`, Date.now(), 300) // key, value, ttl

    return response.status(200).json({
        success: true,
        nonce: nonce,
        message: "This nonce is valid for 5 Minutes"
    })

  } catch (error) {

    return response.status(504).json({
      success: false,
      error: error.message,
    });
  }
};

const GetSignedTransaction = async (request, response) => {
  try {
    const required = ["senderPublicKey", "recipientPublicKey", "senderPrivateKey", "amount", "nonce"];
    const validRequestBody = await RequiredVaulesValidator(request, response, required);
  } catch (error) {
    return response.status(504).json({
      success: false,
      error: error.message,
    });
  }
};

export {
    GetNonce,
    GetSignedTransaction
}
