import { Schema, model } from "mongoose";

const UsersModel = new Schema({
    accountId: {
        type: String,
        required: [true, "AccountId is required!"],
    },
    publicKey: {
        type: String,
        required: [true, "publicKey is required!"],
    }
});

export default model("Users", UsersModel);