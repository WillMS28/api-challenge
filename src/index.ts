import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { graphql } from 'graphql';
import { schema, root } from './schema';
import connectDB from './db';

interface GraphQLRequestBody {
  query: string;
  variables?: { [key: string]: any };
}

const app = new Koa();
const router = new Router();

// Conectar ao MongoDB
connectDB();

// Middleware de body parser
app.use(bodyParser());

// Rota GraphQL
router.post('/graphql', async (ctx) => {
  const body = ctx.request.body as GraphQLRequestBody; // Cast para o tipo correto
  const { query, variables } = body;
  const result = await graphql({
    schema: schema,
    source: query,
    rootValue: root,
    variableValues: variables,
  });
  ctx.body = result;
});

// Usar o roteador
app
  .use(router.routes())
  .use(router.allowedMethods());

// Iniciar o servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
