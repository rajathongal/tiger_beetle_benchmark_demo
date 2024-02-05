import { Schema, model } from "mongoose";

const TransfersModel = new Schema({
    senderAccountId: {
        type: String,
        required: [true, "senderAccountId is required!"],
    },
    receiverAccountId: {
        type: String,
        required: [true, "receiverAccountId is required!"],
    },
    senderPublicKey: {
        type: String,
        required: [true, "senderPublicKey is required!"],
    },
    recipientPublicKey: {
        type: String,
        required: [true, "recipientPublicKey is required!"],
    },
    amount: {
        type: String,
        required: [true, "amount is required!"],
    },
    nonce: {
        type: String,
        required: [true, "nonce is required!"],
    },
    completed: {
        type: Boolean,
        default: false
    },
    error: {
        type: Boolean,
        default: false
    },
    errorMessage: {
        type: String,
    }
});

export default model("Transfers", TransfersModel);