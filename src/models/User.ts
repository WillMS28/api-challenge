import mongoose, { Document, Schema } from 'mongoose';
import { IWallet } from './Wallet';

interface IUser extends Document {
  name: string;
  email: string;
  wallet: mongoose.Types.ObjectId | IWallet;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  wallet: { type: mongoose.Types.ObjectId, ref: 'Wallet' },
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
export { IUser };