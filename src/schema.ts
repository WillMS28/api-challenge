import mongoose from "mongoose";
import { buildSchema } from "graphql";

import { createUser, getUser, getUsers } from "./users";

import Wallet from "./models/Wallet";
import Transaction from "./models/Transaction";
import User from "./models/User";

// Definir o schema GraphQL
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    wallet: Wallet
  }

  type Wallet {
    id: ID!
    balance: Float!
    transactions: [Transaction]
  }

  type Transaction {
    id: ID!
    fromWallet: ID!
    toWallet: ID!
    amount: Float!
    date: String!
    sender: User!
    receiver: User!
  }

  type Query {
    user(id: ID!): User
    users: [User]
    wallet(id: ID!): Wallet
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    addFundsToWallet(walletId: ID!, amount: Float!): Wallet
    sendFunds(fromWalletId: ID!, toWalletId: ID!, amount: Float!): Transaction
  }
`);

const root = {
  user: ({ id }: { id: string }) => getUser(id),
  users: () => getUsers(),
  createUser: ({ name, email }: { name: string; email: string }) =>
    createUser(name, email),
  wallet: async ({ id }: { id: string }) => {
    try {
      const wallet = await Wallet.findById(
        new mongoose.Types.ObjectId(id)
      ).populate("transactions");

      if (!wallet) {
        throw new Error("Wallet not found");
      }
      console.log("____________wallet______________");
      console.log(wallet);

      return wallet;
    } catch (error) {
      console.error("Erro ao buscar a wallet:", error);
      throw new Error("Erro ao buscar a wallet");
    }
  },
  addFundsToWallet: async ({
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
  },
  sendFunds: async ({
    fromWalletId,
    toWalletId,
    amount,
  }: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
  }) => {
    try {
      const fromWallet = await Wallet.findById(
        new mongoose.Types.ObjectId(fromWalletId)
      );
      const toWallet = await Wallet.findById(
        new mongoose.Types.ObjectId(toWalletId)
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
          email: receiver.email
        },
        receiver: {
          id: receiver._id,
          name: receiver.name,
          email: receiver.email
        },
      });
      console.log(transaction);
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
  },
};

export { schema, root };
