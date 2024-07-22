import mongoose from "mongoose";
import Wallet from "./models/Wallet";
import User from "./models/User";
import BigNumber from "bignumber.js";
import Transaction from "./models/Transaction";

export const getWallet = async (id: string) => {
  try {
    const wallet = await Wallet.findById(
      new mongoose.Types.ObjectId(id)
    ).populate("transactions");

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return {
      id: wallet._id.toString(), // Assegura que o campo `id` é uma string
      balance: new BigNumber(wallet.balance).toString(), // Converter para string
      transactions: wallet.transactions,
    };
  } catch (error) {
    console.error("Erro ao buscar a wallet:", error);
    throw new Error("Erro ao buscar a wallet");
  }
};

export const addFunds = async ({
  walletId,
  amount,
}: {
  walletId: string;
  amount: string;
}) => {
  const session = await mongoose.startSession();

  // session.startTransaction();
  try {
    const wallet = await Wallet.findById(walletId).session(session);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const newBalance = new BigNumber(wallet.balance).plus(amount);
    wallet.balance = newBalance;

    await wallet.save({ session });

    //   await session.commitTransaction();
    session.endSession();

    return {
      id: wallet._id,
      balance: newBalance.toString(),
      transactions: wallet.transactions,
    };
  } catch (error) {
    //   await session.abortTransaction();
    session.endSession();

    console.error("Erro ao adicionar fundos à wallet:", error);
    throw new Error("Erro ao adicionar fundos à wallet");
  }
};

export const transactionFunds = async ({
  fromWalletId,
  toWalletId,
  amount,
}: {
  fromWalletId: string;
  toWalletId: string;
  amount: string;
}) => {
  const session = await mongoose.startSession();
  try {
    const fromWallet = await Wallet.findById(fromWalletId).session(session);
    const toWallet = await Wallet.findById(toWalletId).session(session);

    if (!fromWallet || !toWallet) {
      throw new Error("Wallet not found");
    }

    const fromWalletBalance = new BigNumber(fromWallet.balance).minus(amount);
    const toWalletBalance = new BigNumber(toWallet.balance).plus(amount);

    fromWallet.balance = fromWalletBalance;
    toWallet.balance = toWalletBalance;

    await fromWallet.save({ session });
    await toWallet.save({ session });

    const sender = await User.findOne({ wallet: fromWallet._id })
      .select("_id name email")
      .session(session);
    const receiver = await User.findOne({ wallet: toWallet._id })
      .select("_id name email")
      .session(session);

    if (!sender || !receiver) {
      throw new Error("Sender or receiver not found");
    }

    const transaction = new Transaction({
      fromWallet: fromWallet._id,
      toWallet: toWallet._id,
      amount: new BigNumber(amount).toString(), // Armazenado como string
      date: new Date(),
      sender: {
        id: sender._id,
        name: sender.name,
        email: sender.email,
      },
      receiver: {
        id: receiver._id,
        name: receiver.name,
        email: receiver.email,
      },
    });
    await transaction.save({ session });

    await Wallet.updateOne(
      { _id: fromWallet._id },
      { $push: { transactions: transaction._id } },
      { session }
    );
    await Wallet.updateOne(
      { _id: toWallet._id },
      { $push: { transactions: transaction._id } },
      { session }
    );

    return transaction;
  } catch (error) {
    console.error("Erro ao enviar fundos:", error);
    throw new Error("Erro ao enviar fundos");
  } finally {
    session.endSession();
  }
};
