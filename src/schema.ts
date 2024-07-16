import mongoose from "mongoose";
import { buildSchema } from "graphql";

import { createUser, getUser, getUsers } from "./users";

import Wallet from "./models/Wallet";
import Transaction from "./models/Transaction";

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
      const wallet = await Wallet.findById(new mongoose.Types.ObjectId(id)).populate("transactions");

      if (!wallet) {
        throw new Error("Wallet not found");
      }
      console.log('____________wallet______________');
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
  /*  sendFunds: async ({ fromWalletId, toWalletId, amount }: { fromWalletId: string, toWalletId: string, amount: number }) => {
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

      if (fromWallet && toWallet) {
        return true; // Retorna true se a operação for bem-sucedida
      } else {
        throw new Error('Wallet não encontrada');
      }
    } catch (error) {
      console.error('Erro ao enviar fundos:', error);
      throw new Error('Erro ao enviar fundos');
    }
  },*/
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
      const fromWallet = await Wallet.findByIdAndUpdate(
        new mongoose.Types.ObjectId(fromWalletId),
        { $inc: { balance: -amount } },
        { new: true }
      );
      console.log(fromWallet);
      console.log("--------------------------");

      const toWallet = await Wallet.findByIdAndUpdate(
        new mongoose.Types.ObjectId(toWalletId),
        { $inc: { balance: amount } },
        { new: true }
      );
      console.log(toWallet);

      console.log("--------------------------");

      if (!fromWallet || !toWallet) {
        throw new Error("Wallet not found");
      }

      console.log("--------------------------");

      const transaction = new Transaction({
        fromWallet: fromWallet._id,
        toWallet: toWallet._id,
        amount,
        date: new Date(),
      });
      console.log("transaction");
      console.log(transaction);

      await transaction.save();
      console.log("--------------------------");

      // Atualizar o array de transactions com o ID da nova transação
      await Wallet.updateOne(
        { _id: new mongoose.Types.ObjectId(fromWalletId) },
        { $push: { transactions: transaction._id } }
      );

      await Wallet.updateOne(
        { _id: new mongoose.Types.ObjectId(toWalletId) },
        { $push: { transactions: transaction._id } }
      );


      console.log("--------------------------");

      return transaction; // Retorna true se a operação for bem-sucedida
    } catch (error) {
      console.error("Erro ao enviar fundos:", error);
      throw new Error("Erro ao enviar fundos");
    }
  },
};

export { schema, root };
