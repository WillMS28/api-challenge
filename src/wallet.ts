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
      ...wallet.toObject(),
      balance: new BigNumber(wallet.balance).toString(), // Converter para string
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
    try {
      const wallet = await Wallet.findById(walletId);
  
      if (!wallet) {
        throw new Error("Wallet not found");
      }
  
      const newBalance = new BigNumber(wallet.balance).plus(amount);
      wallet.balance = newBalance
  
      await wallet.save();
  
      return {
        id: wallet._id,
        balance: newBalance.toString(),
        transactions: wallet.transactions,
      };
    } catch (error) {
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
  try {
    const fromWallet = await Wallet.findById(fromWalletId);
    const toWallet = await Wallet.findById(toWalletId);

    if (!fromWallet || !toWallet) {
      throw new Error("Wallet not found");
    }

    const fromWalletBalance = new BigNumber(fromWallet.balance).minus(amount);
    const toWalletBalance = new BigNumber(toWallet.balance).plus(amount);

    fromWallet.balance = fromWalletBalance;
    toWallet.balance = toWalletBalance;

    await fromWallet.save();
    await toWallet.save();

    const sender = await User.findOne({ wallet: fromWallet._id }).select(
      "_id name email"
    );
    const receiver = await User.findOne({ wallet: toWallet._id }).select(
      "_id name email"
    );

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
    await transaction.save();

    await Wallet.updateOne(
      { _id: fromWallet._id },
      { $push: { transactions: transaction._id } }
    );
    await Wallet.updateOne(
      { _id: toWallet._id },
      { $push: { transactions: transaction._id } }
    );

    return transaction;
  } catch (error) {
    console.error("Erro ao enviar fundos:", error);
    throw new Error("Erro ao enviar fundos");
  }
};
