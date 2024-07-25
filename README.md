# Challenge API

## Descrição

Este projeto é uma API de desafio construída com Node.js, Koa, e GraphQL. Ele gerencia usuários e carteiras, permitindo criar usuários, adicionar fundos a carteiras e realizar transações entre carteiras. A API também utiliza o MongoDB como banco de dados e está configurada para funcionar localmente.

## Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB (rodando localmente na porta padrão)

## Instalação

Clone o repositório:

```bash
git clone https://github.com/WillMS28/api-challenge
cd challenge-api
```

### Instale as dependências:

```bash
npm install
```

### Configure o banco de dados:

Certifique-se de que o MongoDB esteja rodando localmente. O arquivo `db.ts` está configurado para se conectar ao MongoDB na URL `mongodb://localhost:27017/db`.

### Scripts Disponíveis

- `npm run build`: Compila o código TypeScript para JavaScript.
- `npm start`: Inicia o servidor em produção (use o arquivo compilado).
- `npm run dev`: Inicia o servidor em modo de desenvolvimento usando ts-node-dev.
- `npm test`: Executa os testes usando Jest.

### Uso

Inicie o servidor:

```bash
npm run dev
```

O servidor estará rodando em http://localhost:3000.

### Utilize um cliente GraphQL

Utilize um cliente GraphQL (como o GraphQL Playground ou o Insomnia) para interagir com a API. A URL base das requisições será `http://localhost:3000/graphql`.

### Endpoints

#### Queries

- `user(id: ID!)`: `User`: Retorna um usuário pelo ID.
- `users`: `[User]`: Retorna todos os usuários.
- `wallet(id: ID!)`: `Wallet`: Retorna uma carteira pelo ID.

#### Mutations

- `createUser(name: String!, email: String!)`: `User`: Cria um novo usuário.
- `addFundsToWallet(walletId: ID!, amount: String!)`: `Wallet`: Adiciona fundos a uma carteira.
- `sendFunds(fromWalletId: ID!, toWalletId: ID!, amount: String!)`: `Transaction`: Envia fundos de uma carteira para outra.

### Estrutura do Projeto

- `src/index.ts`: Ponto de entrada da aplicação.
- `src/schema.ts`: Define o schema GraphQL e os resolvers.
- `src/db.ts`: Configuração da conexão com o MongoDB.
- `src/users.ts`: Lógica de negócios para os usuários.
- `src/wallet.ts`: Lógica de negócios para as carteiras.
- `src/models`: Modelos Mongoose para User, Wallet e Transaction.
- `__tests__`: Contém os testes utilizando Jest e Supertest.

### Melhorias Futuras

#### Autenticação JWT

Implementar autenticação baseada em JSON Web Tokens (JWT) para proteger as rotas. Isso envolve:

- Criação de endpoints para login e registro de usuários.
- Geração de tokens JWT no login e verificação desses tokens em rotas protegidas.
- Armazenamento seguro de senhas usando hashing (por exemplo, bcrypt).

#### Migrar para Code-First

Migrar para uma abordagem code-first ao invés de schema-first para definir o schema GraphQL usando TypeScript. 

#### Eventos de Transação

Adicionar eventos para transações financeiras, permitindo que outras partes do sistema ou serviços externos respondam a essas transações. Isso pode incluir:

- Envio de notificações por email ou SMS ao usuário.
- Integração com webhooks para notificar sistemas externos sobre transações.
- Registro de logs detalhados para auditoria e monitoramento de segurança.


### Contato

- Email: silva.miranda.william@gmail.com
- GitHub: [William Miranda](https://github.com/WillMS28)
