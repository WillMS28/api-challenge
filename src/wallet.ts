import mongoose from "mongoose";
import Wallet from "./models/Wallet";
import User from "./models/User";
import Transaction from "./models/Transaction";

export const getWallet = async (id: string) => {
  try {
    const wallet = await Wallet.findById(
      new mongoose.Types.ObjectId(id)
    ).populate("transactions");

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return wallet;
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
  amount: number;
}) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(
      new mongoose.Types.ObjectId(walletId),
      { $inc: { balance: amount } },
      { new: true }
    );
    return wallet;
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
  amount: number;
}) => {
  try {
    const fromWallet = await Wallet.findByIdAndUpdate(
      new mongoose.Types.ObjectId(fromWalletId),
      { $inc: { balance: -amount } },
      { new: true }
    );
    const toWallet = await Wallet.findByIdAndUpdate(
      new mongoose.Types.ObjectId(toWalletId),
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!fromWallet || !toWallet) {
      throw new Error("Wallet not found");
    }

    // Buscar informações do remetente e destinatário
    const sender = await User.findOne({ wallet: fromWallet._id }).select(
      "_id name email"
    );
    const receiver = await User.findOne({ wallet: toWallet._id }).select(
      "_id name email"
    );

    if (!sender || !receiver) {
      throw new Error("Sender or receiver not found");
    }
    // Criar nova transação
    const transaction = new Transaction({
      fromWallet: fromWallet._id,
      toWallet: toWallet._id,
      amount,
      date: new Date(),
      sender: {
        id: sender._id,
        name: sender.name,
        email: receiver.email,
      },
      receiver: {
        id: receiver._id,
        name: receiver.name,
        email: receiver.email,
      },
    });
    await transaction.save();

    // Atualizar o array de transactions com o ID da nova transação
    await Wallet.updateOne(
      { _id: new mongoose.Types.ObjectId(fromWalletId) },
      { $push: { transactions: transaction._id } }
    );

    await Wallet.updateOne(
      { _id: new mongoose.Types.ObjectId(toWalletId) },
      { $push: { transactions: transaction._id } }
    );

    return transaction; // Retorna true se a operação for bem-sucedida
  } catch (error) {
    console.error("Erro ao enviar fundos:", error);
    throw new Error("Erro ao enviar fundos");
  }
};
