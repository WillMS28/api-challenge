import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { graphql } from 'graphql';
import { schema, root } from './schema';
import connectDB from './db';
import cors from 'koa2-cors'; 

interface GraphQLRequestBody {
  query: string;
  variables?: { [key: string]: any };
}

const app = new Koa();
const router = new Router();

connectDB();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use(bodyParser());

router.post('/api', async (ctx) => {
  const body = ctx.request.body as GraphQLRequestBody; 
  const { query, variables } = body;
  const result = await graphql({
    schema: schema,
    source: query,
    rootValue: root,
    variableValues: variables,
  });
  ctx.body = result;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
