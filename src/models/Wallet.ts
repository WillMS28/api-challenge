import mongoose, { Document, Schema } from "mongoose";

interface IWallet extends Document {
  balance: number;
}

const WalletSchema: Schema = new Schema({
  balance: { type: Number, default: 0 },
});

const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
export { IWallet };