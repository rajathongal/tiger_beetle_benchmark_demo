import http from "k6/http";
import {
  describe,
  expect,
} from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";
import { sleep } from "k6";

export const options = {
  vus: 1000,
  duration: "1s",
};
export default function () {
  describe("Transfers", () => {
    const randomUserACreateResponse = http.post(
      "http://localhost:5001/accounts/create"
    );
    const randomUserBCreateResponse = http.post(
      "http://localhost:5001/accounts/create"
    );

    const randomUserA = JSON.parse(randomUserACreateResponse.body);
    const randomUserB = JSON.parse(randomUserBCreateResponse.body);

    const senderAccountId = randomUserA.accountId;
    const noncePayload = JSON.stringify({ accountId: senderAccountId });

    const nonceResponse = http.post(
      "http://localhost:5001/accounts/get-nonce",
      noncePayload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const nonce = JSON.parse(nonceResponse.body).nonce;

    const getSignedTransactionPayload = JSON.stringify({
      senderPublicKey: randomUserA.publicKey,
      recipientPublicKey: randomUserB.publicKey,
      senderPrivateKey: randomUserA.privateKey,
      amount: "10.37",
      nonce,
    });

    const signedTransactionResponse = http.post(
      "http://localhost:5001/accounts/get-signed-transaction",
      getSignedTransactionPayload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const transactionPayload = signedTransactionResponse.body;
    const createTransferResponse = http.post(
      "http://localhost:5001/accounts/create-transfer",
      transactionPayload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const transactionId = JSON.parse(createTransferResponse.body).transactionId;
    sleep(5);
    const transferCompletionResponse = http.get(
      `http://localhost:5001/accounts/getTransfer/${transactionId}`
    );

    expect(transferCompletionResponse.status, "response status").to.equal(200);
  });
}
