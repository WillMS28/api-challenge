import User, { IUser } from "./models/User";
import Wallet from "./models/Wallet";
import BigNumber from "bignumber.js";

const getUser = async (id: string): Promise<IUser | null> => {
  try {
    const user = await User.findById(id).populate({
      path: "wallet",
      populate: {
        path: "transactions",
        model: "Transaction",
      },
    });

    if (user && user.wallet) {
      const wallet = user.wallet as any;
      wallet.balance = new BigNumber(wallet.balance).toString();
    }
    return user;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw new Error("Erro ao buscar usuário");
  }
};

const getUsers = async (): Promise<IUser[]> => {
  try {
    const users = await User.find().populate({
      path: "wallet",
      populate: {
        path: "transactions",
        model: "Transaction",
      },
    });

    users.forEach((user) => {
      if (user.wallet) {
        const wallet = user.wallet as any;
        wallet.balance = new BigNumber(wallet.balance).toString();
      }
    });

    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Erro ao buscar usuários");
  }
};

const createUser = async (name: string, email: string): Promise<IUser> => {
  try {
    const wallet = new Wallet({ balance: "0" });
    await wallet.save();

    const user = new User({ name, email, wallet: wallet._id });
    await user.save();

    await user.populate("wallet");

    return user;
  } catch (error) {
    console.error("Erro ao criar usuário e wallet:", error);
    throw new Error("Erro ao criar usuário e wallet");
  }
};

export { getUser, createUser, getUsers };
