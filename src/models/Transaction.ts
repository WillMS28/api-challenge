import mongoose, { Document, Schema } from "mongoose";

interface ITransaction extends Document {
  fromWallet: mongoose.Types.ObjectId;
  toWallet: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
}

const TransactionSchema: Schema = new Schema({
  fromWallet: { type: mongoose.Types.ObjectId, ref: "Wallet", require: true },
  toWallet: { type: mongoose.Types.ObjectId, ref: "Wallet", require: true },
  amount: { type: Number, require: true },
  date: { type: Date, default: Date.now },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);

export default Transaction;
export { ITransaction };
