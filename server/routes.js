import { Router } from "express";
import CreateAccount from "./controllers/createAccount.js";
import { GetNonce, GetSignedTransaction } from "./controllers/prepareTransactions.js";

const router = new Router();

router.post("/accounts/create", CreateAccount);
router.post("/accounts/get-nonce", GetNonce);
router.post("/accounts/get-signed-transaction", GetSignedTransaction);

export default router;