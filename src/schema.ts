import { buildSchema } from "graphql";
import { createUser, getUser, getUsers } from "./users";
import { addFunds, getWallet, transactionFunds } from "./wallet";

const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    wallet: Wallet
  }

  type Wallet {
    id: ID!
    balance: String!
    transactions: [Transaction]
  }

  type Transaction {
    id: ID!
    fromWallet: ID!
    toWallet: ID!
    amount: String!
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
    addFundsToWallet(walletId: ID!, amount: String!): Wallet
    sendFunds(fromWalletId: ID!, toWalletId: ID!, amount: String!): Transaction
  }
`);

const root = {
  user: ({ id }: { id: string }) => getUser(id),
  users: () => getUsers(),
  createUser: ({ name, email }: { name: string; email: string }) =>
    createUser(name, email),
  wallet: ({ id }: { id: string }) => getWallet(id),
  addFundsToWallet: ({
    amount,
    walletId,
  }: {
    amount: string;
    walletId: string;
  }) => addFunds({ amount, walletId }),
  sendFunds: ({
    fromWalletId,
    toWalletId,
    amount,
  }: {
    fromWalletId: string;
    toWalletId: string;
    amount: string;
  }) =>
    transactionFunds({
      fromWalletId,
      toWalletId,
      amount,
    }),
};

export { schema, root };
