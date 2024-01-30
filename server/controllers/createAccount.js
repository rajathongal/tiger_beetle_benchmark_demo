import crypto from "crypto";
import client from "../utils/initTigerBeetleClient.js";
import generateUUID from "../utils/initUUIDGenerator.js";
import UsersModel from "../models/UsersModel.js";
/**
 * Creates an account by generating a key pair using the crypto module.
 * Returns the generated key pair in the response body.
 * @async
 * @function createAccount
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 * @returns {Promise<Object>} - The response object with the generated key pair.
 * @throws {Error} - If key pair generation fails, an error is thrown.
 */
const createAccount = async (request, response) => {
  try {
    const accountId = generateUUID();
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "secp256k1",
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "sec1",
        format: "pem",
      },
    });

    let accountErrors = await client.createAccounts([
      {
        id: accountId,
        debits_pending: 0n,
        debits_posted: 0n,
        credits_pending: 0n,
        credits_posted: 0n,
        user_data_128: 0n,
        user_data_64: 0n,
        user_data_32: 0,
        reserved: 0,
        ledger: 1,
        code: 1,
        flags: 0,
        timestamp: 0n,
      },
    ]);

    if (accountErrors.length > 0) {
      return response.status(500).json({
        sucess: false,
        message: "Failed to create account",
      });
    }

    await UsersModel.create({
      accountId: accountId.toString(),
      publicKey: publicKey,
    });

    return response.status(200).json({
      sucess: true,
      accountId: accountId.toString(),
      publicKey: publicKey,
      privateKey: privateKey,
    });
  } catch (error) {
    return response.status(504).json({
      success: false,
      error: error.message,
    });
  }
};

export default createAccount;
