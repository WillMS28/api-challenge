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
    userId: ID!
    balance: Float!
  }

  type Query {
    user(id: ID!): User
    users: [User]
    wallet(userId: ID!): Wallet
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    addFundsToWallet(userId: ID!, amount: Float!): Wallet
    sendFunds(fromUserId: ID!, toUserId: ID!, amount: Float!): Boolean
  }
`);

const root = {
  user: ({ id }: { id: string }) => getUser(id),
  users: () => getUsers(),
  createUser: ({ name, email }: { name: string, email: string }) => createUser(name, email),
  wallet: async ({ userId }: { userId: string }) => {
    try {
      const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      console.log(wallet)
      return wallet
    } catch (error) {
      console.error('Erro ao buscar a wallet:', error);
      throw new Error('Erro ao buscar a wallet');
    }
  },
  addFundsToWallet: async ({ userId, amount }: { userId: string, amount: number }) => {
    try {
      const wallet = await Wallet.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $inc: { balance: amount } },
        { new: true }
      );
      return wallet;
    } catch (error) {
      console.error('Erro ao adicionar fundos à wallet:', error);
      throw new Error('Erro ao adicionar fundos à wallet');
    }
  },
  sendFunds: async ({ fromUserId, toUserId, amount }: { fromUserId: string, toUserId: string, amount: number }) => {
    try {
      const fromWallet = await Wallet.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(fromUserId) },
        { $inc: { balance: -amount } },
        { new: true }
      );

      const toWallet = await Wallet.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(toUserId) },
        { $inc: { balance: amount } },
        { new: true }
      );

      if (fromWallet && toWallet) {
        return true; // Retorna true se a operação for bem-sucedida
      } else {
        throw new Error('Usuário ou wallet não encontrada');
      }
    } catch (error) {
      console.error('Erro ao enviar fundos:', error);
      throw new Error('Erro ao enviar fundos');
    }
  },
};

export { schema, root };
