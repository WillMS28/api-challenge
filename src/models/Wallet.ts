import mongoose, { Document, Schema } from "mongoose";
import { ITransaction } from "./Transaction";
import BigNumber from "bignumber.js";

interface IWallet extends Document {
  _id: mongoose.Types.ObjectId; 
  balance: BigNumber;
  transactions: mongoose.Types.ObjectId[]  | ITransaction[];
}

const WalletSchema: Schema = new Schema({
  balance: { type: String, default: 0 },
  transactions: [{ type: mongoose.Types.ObjectId, ref: "Transaction" }],
});

const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);

export default Wallet;
export { IWallet };
