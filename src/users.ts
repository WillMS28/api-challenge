import mongoose from "mongoose";
import User, { IUser } from "./models/User";
import Wallet from "./models/Wallet";

const getUser = async (id: string): Promise<IUser | null> => {
  try {
    const user = await User.findById(id).populate("wallet");
    console.log(user);

    return user;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw new Error("Erro ao buscar usuário");
  }
};

const getUsers = async (): Promise<IUser[]> => {
  try {
    const users = await User.find().populate("wallet");
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Erro ao buscar usuários");
  }
};

const createUser = async (name: string, email: string): Promise<IUser> => {
  try {
    // Cria a wallet
    const wallet = new Wallet({
      userId: new mongoose.Types.ObjectId(),
      balance: 0,
    });
    await wallet.save();
    console.log(wallet);

    // Cria o usuário
    const user = new User({ name, email, wallet: wallet._id });
    await user.save();

    console.log(user);

    return user;
  } catch (error) {
    console.error("Erro ao criar usuário e wallet:", error);
    throw new Error("Erro ao criar usuário e wallet");
  }
};

export { getUser, createUser, getUsers };
