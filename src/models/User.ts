import mongoose, { Document, Schema } from 'mongoose';

interface User extends Document {
  name: string;
  email: string;
  wallet: mongoose.Types.ObjectId; // referência para a wallet
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  wallet: { type: mongoose.Types.ObjectId, ref: 'Wallet' }, // referência para a wallet
});

const User = mongoose.model<User>('User', UserSchema);

export default User;
