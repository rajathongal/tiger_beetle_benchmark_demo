import { Router } from "express";
import CreateAccount from "./controllers/createAccount.js";
import { GetNonce, GetSignedTransaction } from "./controllers/prepareTransactions.js";
import { createTransfer, getTransferByTransactionId } from "./controllers/handleTransfers.js";

const router = new Router();

router.post("/accounts/create", CreateAccount);
router.post("/accounts/get-nonce", GetNonce);
router.post("/accounts/get-signed-transaction", GetSignedTransaction);
router.post("/accounts/create-transfer", createTransfer);
router.get("/accounts/getTransfer/:transactionId", getTransferByTransactionId)

export default router;