import mongoose, { Document, Schema } from "mongoose";
import { ITransaction } from "./Transaction";

interface IWallet extends Document {
  balance: number;
  transactions: mongoose.Types.ObjectId[]  | ITransaction[];
}

const WalletSchema: Schema = new Schema({
  balance: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Types.ObjectId, ref: "Transaction" }],
});

const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);

export default Wallet;
export { IWallet };
