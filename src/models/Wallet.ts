import mongoose, { Document, Schema } from "mongoose";

interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
}

const WalletSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, unique: true },
  balance: { type: Number, default: 0 },
});

const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
export { IWallet };