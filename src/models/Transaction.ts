import mongoose, { Document, Schema } from "mongoose";
import BigNumber from "bignumber.js";

interface ITransaction extends Document {
  fromWallet: mongoose.Types.ObjectId;
  toWallet: mongoose.Types.ObjectId;
  amount: BigNumber;
  date: Date;
  sender: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  receiver: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
}

const TransactionSchema: Schema = new Schema({
  fromWallet: { type: mongoose.Types.ObjectId, ref: "Wallet", require: true },
  toWallet: { type: mongoose.Types.ObjectId, ref: "Wallet", require: true },
  amount: { type: String, require: true },
  date: { type: Date, default: Date.now },
  sender: {
    id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  receiver: {
    id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);

export default Transaction;
export { ITransaction };
