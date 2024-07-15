import mongoose, { Document, Schema } from "mongoose";

interface Wallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
}

const WalletSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, unique: true },
  balance: { type: Number, default: 0 },
});

const Wallet = mongoose.model<Wallet>('Wallet', WalletSchema);

export default Wallet