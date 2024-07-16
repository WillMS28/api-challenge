// arquivo schema.ts
import { buildSchema } from 'graphql';
import { createUser, getUser, getUsers } from './users';
import Wallet from './models/Wallet';
import mongoose from 'mongoose';

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
  }

  type Query {
    user(id: ID!): User
    users: [User]
    wallet(id: ID!): Wallet
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    addFundsToWallet(walletId: ID!, amount: Float!): Wallet
    sendFunds(fromWalletId: ID!, toWalletId: ID!, amount: Float!): Boolean
  }
`);

const root = {
  user: ({ id }: { id: string }) => getUser(id),
  users: () => getUsers(),
  createUser: ({ name, email }: { name: string, email: string }) => createUser(name, email),
  wallet: async ({ id }: { id: string }) => {
    try {
      const wallet = await Wallet.findById(new mongoose.Types.ObjectId(id));
      console.log(wallet);
      return wallet;
    } catch (error) {
      console.error('Erro ao buscar a wallet:', error);
      throw new Error('Erro ao buscar a wallet');
    }
  },
  addFundsToWallet: async ({ walletId, amount }: { walletId: string, amount: number }) => {
    try {
      const wallet = await Wallet.findByIdAndUpdate(
        new mongoose.Types.ObjectId(walletId),
        { $inc: { balance: amount } },
        { new: true }
      );
      return wallet;
    } catch (error) {
      console.error('Erro ao adicionar fundos à wallet:', error);
      throw new Error('Erro ao adicionar fundos à wallet');
    }
  },
  sendFunds: async ({ fromWalletId, toWalletId, amount }: { fromWalletId: string, toWalletId: string, amount: number }) => {
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
  },
};

export { schema, root };
