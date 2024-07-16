import request from "supertest";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import { graphql } from "graphql";
import { schema, root } from "../src/schema";
import connectDB from "../src/db";
import mongoose from "mongoose";

interface GraphQLRequestBody {
  query: string;
  variables?: { [key: string]: any };
}

const app = new Koa();
const router = new Router();

// Middleware de body parser
app.use(bodyParser());

// Rota GraphQL
router.post("/graphql", async (ctx) => {
  const body = ctx.request.body as GraphQLRequestBody; // Cast para o tipo correto
  const { query, variables } = body;
  const result = await graphql({
    schema,
    source: query,
    rootValue: root,
    variableValues: variables,
  });
  ctx.body = result;
});

// Usar o roteador
app.use(router.routes()).use(router.allowedMethods());

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GraphQL API", () => {
  test("should create a new user", async () => {
    const mutation = `
      mutation {
        createUser(name: "John Doe", email: "john@example.com") {
          id
          name
          email
        }
      }
    `;

    const response = await request(app.callback())
      .post("/graphql")
      .send({ query: mutation });

    expect(response.status).toBe(200);
    expect(response.body.data.createUser).toHaveProperty("id");
    expect(response.body.data.createUser.name).toBe("John Doe");
    expect(response.body.data.createUser.email).toBe("john@example.com");
  });

  test("should add funds to wallet", async () => {
    // Primeiro, cria um usuário e obtém seu ID e walletId
    const createUserMutation = `
      mutation {
        createUser(name: "Jane Doe", email: "jane@example.com") {
          id
          wallet {
            id
          }
        }
      }
    `;
    const createUserResponse = await request(app.callback())
      .post("/graphql")
      .send({ query: createUserMutation });
    const walletId = createUserResponse.body.data.createUser.wallet.id;

    const addFundsMutation = `
      mutation {
        addFundsToWallet(walletId: "${walletId}", amount: 100.0) {
          id
          balance
        }
      }
    `;

    const response = await request(app.callback())
      .post("/graphql")
      .send({ query: addFundsMutation });

    expect(response.status).toBe(200);
    expect(response.body.data.addFundsToWallet).toHaveProperty("id");
    expect(response.body.data.addFundsToWallet.balance).toBe(100.0);
  });

  test("should send funds between wallets", async () => {
    // Criar dois usuários para enviar fundos entre eles
    const createUser1 = await request(app.callback())
      .post("/graphql")
      .send({
        query: `
        mutation {
          createUser(name: "Alice", email: "alice@example.com") {
            id
            wallet {
              id
            }
          }
        }
      `,
      });
    const createUser2 = await request(app.callback())
      .post("/graphql")
      .send({
        query: `
        mutation {
          createUser(name: "Bob", email: "bob@example.com") {
            id
            wallet {
              id
            }
          }
        }
      `,
      });

    const fromWalletId = createUser1.body.data.createUser.wallet.id;
    const toWalletId = createUser2.body.data.createUser.wallet.id;

    // Adicionar fundos ao primeiro usuário para realizar a transferência
    await request(app.callback())
      .post("/graphql")
      .send({
        query: `
        mutation {
          addFundsToWallet(walletId: "${fromWalletId}", amount: 100.0) {
            id
            balance
          }
        }
      `,
      });

    const sendFundsMutation = `
      mutation {
        sendFunds(fromWalletId: "${fromWalletId}", toWalletId: "${toWalletId}", amount: 50.0) {
          id
          amount
        }
      }
    `;

    const response = await request(app.callback())
      .post("/graphql")
      .send({ query: sendFundsMutation });

    expect(response.status).toBe(200);
    expect(response.body.data.sendFunds).toHaveProperty("id");
    expect(response.body.data.sendFunds.amount).toBe(50.0);
  });
});
