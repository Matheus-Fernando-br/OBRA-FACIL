# Obra Fácil — API

Backend do app Obra Fácil: autenticação, clientes, orçamentos, obras, catálogo de produtos e serviços, planos com limites, assinaturas pelo Mercado Pago, e-mails pelo Brevo e painel administrativo.

**Stack:** Node.js 22, Express 5, MongoDB (Mongoose 9), validação com Zod, logs com Pino e testes com `node:test`.

Ele reaproveita a estrutura de dados do backend anterior (coleções `usuarios`, `clientes`, `orcamentos` e `obras`), e as migrações adaptam os dados existentes automaticamente.

## Estrutura

```
backend/
├── src/
│   ├── server.js            # inicialização: banco → migrações → admin → HTTP
│   ├── app.js               # Express (segurança, rotas, arquivos estáticos)
│   ├── config/              # variáveis de ambiente, banco, logger, planos padrão
│   ├── middlewares/         # autenticação, painel, validação, limites, erros
│   ├── models/              # esquemas MongoDB
│   ├── routes/              # auth, user, client, produto, orcamento, obra,
│   │                        # plans/subscription, webhooks, admin
│   ├── services/            # tokens, planos, assinaturas, Mercado Pago,
│   │                        # e-mail, Telegram, auditoria, rotinas
│   ├── migrations/          # migrações idempotentes (rodam no boot)
│   └── validators/          # esquemas Zod de entrada
├── public/
│   ├── admin/               # painel administrativo (/admin)
│   └── assinar/             # página web de assinatura (/assinar)
└── test/                    # testes automatizados
```

## Rodar localmente

1. Requisitos: Node.js 20.19 ou mais recente e um MongoDB (Atlas ou local).
2. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```
3. Configure as variáveis:
   ```bash
   cp .env.example .env
   ```
   Preencha `MONGO_URI` e os quatro segredos. Para gerar cada segredo:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Inicie o servidor com `npm run dev` (abre em http://localhost:8000).
   - Sem `BREVO_API_KEY`, em desenvolvimento os códigos de e-mail aparecem no terminal.
   - Para o app usar esta API, crie `frontend/.env.local` com `EXPO_PUBLIC_API_URL=http://SEU-IP:8000`.

### Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor com recarga automática |
| `npm start` | servidor de produção |
| `npm test` | testes automatizados |
| `npm run lint` | ESLint |
| `npm run migrate` | aplica as migrações manualmente (elas também rodam no boot) |

Os testes usam um MongoDB descartável:
- Com `TEST_MONGO_URI=mongodb://127.0.0.1:27017`, usam um `mongod` já em execução.
- Sem essa variável, sobem um `mongodb-memory-server`, que baixa o MongoDB na primeira vez.

## Deploy no Render

O arquivo `render.yaml` (na raiz do repositório) define o serviço.

1. No Render, vá em **New → Blueprint** e escolha este repositório. O serviço `obra-facil-api` será criado.
2. Preencha as variáveis marcadas como *sync: false* (tabela abaixo). Os segredos `JWT_*`, `ADMIN_JWT_SECRET` e `SETTINGS_ENCRYPTION_KEY` são gerados pelo próprio Render.
3. Depois do primeiro deploy, confira:
   - `https://SEU-SERVICO.onrender.com/health` deve responder `{"status":"ok"}`;
   - se a URL do serviço for diferente de `https://obra-facil-api.onrender.com`, ajuste `PUBLIC_BASE_URL` no Render e `EXPO_PUBLIC_API_URL` em `frontend/eas.json`.
4. Use o plano **Starter** ou superior. O plano gratuito "dorme" e o app demora cerca de 1 minuto para abrir.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `MONGO_URI` | sim | Conexão do MongoDB Atlas (a mesma base usada hoje, para preservar os dados) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | sim | Segredos dos tokens do app (gerados pelo Render) |
| `ADMIN_JWT_SECRET` | sim | Segredo da sessão do painel (gerado pelo Render) |
| `SETTINGS_ENCRYPTION_KEY` | sim | Chave que criptografa segredos salvos no banco, como o token do Telegram (gerada pelo Render). **Não troque** depois de configurar o Telegram. |
| `PUBLIC_BASE_URL` | sim | URL pública da API, com https |
| `ADMIN_USERNAME` | não | Usuário do painel (padrão `admin`) |
| `ADMIN_INITIAL_PASSWORD` | 1º deploy | Senha inicial do painel, com 10 ou mais caracteres. **Remova depois do primeiro acesso.** |
| `BREVO_API_KEY` | sim* | Chave de API do Brevo (*sem ela não há cadastro nem recuperação de senha) |
| `MAIL_FROM_EMAIL` | sim* | Remetente verificado no Brevo |
| `MP_ACCESS_TOKEN` | para cobrar | Credencial do Mercado Pago (`TEST-...` para testes, `APP_USR-...` em produção) |
| `MP_WEBHOOK_SECRET` | para cobrar | Assinatura secreta dos webhooks do Mercado Pago |
| `CORS_ORIGINS` | não | Origens web permitidas, separadas por vírgula. O app nativo não precisa disso. |

## Painel administrativo

Endereço: `https://SEU-SERVICO.onrender.com/admin`.

**Primeiro acesso**
1. Entre com o usuário `admin` e a senha de `ADMIN_INITIAL_PASSWORD`.
2. O painel exige trocar essa senha na hora (10 ou mais caracteres, com letras e números).
3. Remova `ADMIN_INITIAL_PASSWORD` do Render.

Detalhes de segurança:
- O banco guarda só o hash da senha.
- Depois que o administrador existe, a variável é ignorada.

**O que o painel oferece**
- Métricas: usuários, assinaturas, receita e uso, com gráficos.
- Usuários: busca e filtros, conceder plano de cortesia, bloquear, encerrar sessões e excluir a conta (pedidos de exclusão por e-mail).
- Assinaturas e pagamentos: sincronizar e cancelar.
- Planos: preços, limites e textos (o app lê do servidor), além de onde o checkout aparece em cada plataforma.
- Integrações: teste do Mercado Pago e do Brevo, configuração do Telegram.
- Diagnóstico das APIs e variáveis, auditoria e webhooks recebidos.

**Recuperar o acesso** (senha esquecida)
1. No Render, defina `ADMIN_FORCE_RESET=true` e uma nova `ADMIN_INITIAL_PASSWORD`.
2. Reinicie o serviço e entre com a nova senha.
3. Remova as duas variáveis.

## Mercado Pago (assinaturas)

Cada assinatura é criada no Mercado Pago como uma cobrança recorrente mensal (*preapproval*). O usuário paga na página do Mercado Pago, e o plano só muda quando o servidor confirma o pagamento consultando a API do Mercado Pago.

O pedido do app ou o corpo do webhook nunca alteram o plano sozinhos. As proteções são:
- **Assinatura do webhook:** HMAC conferido com `MP_WEBHOOK_SECRET`.
- **Notificações duplicadas:** são ignoradas.
- **Dados conferidos:** valor, moeda e referência precisam bater com o que o servidor criou; se não baterem, a assinatura fica como "suspeita".
- **Rotina a cada 6 horas:** corrige webhooks perdidos e encerra os períodos que terminaram.

**Configuração**
1. Em mercadopago.com.br/developers, crie a aplicação e copie o **Access Token**. Use primeiro as credenciais de teste.
2. Em **Webhooks**, cadastre:
   - URL: `https://SEU-SERVICO.onrender.com/webhooks/mercadopago`
   - Eventos: **Planos e assinaturas** e **Pagamentos**
3. Copie a **assinatura secreta** para `MP_WEBHOOK_SECRET`.
4. No painel, abra **Integrações** e use **Testar credencial**.

**Regras das lojas**
- A Google Play exige o faturamento dela (Play Billing) para assinaturas vendidas dentro do app Android. No Brasil, outro meio de pagamento só é aceito com adesão ao programa de faturamento alternativo da Google, oferecendo também o Play Billing.
- Por isso o checkout dentro do app Android começa **desligado** (painel → **Planos e cobrança**).
- A assinatura fica disponível na página web `/assinar`. O app mostra o plano que o usuário tiver, sem levar a outro meio de pagamento.
- Ligue o checkout no Android só se a conta estiver dentro das regras vigentes da Google Play.

## Brevo (e-mails)

1. Em brevo.com, abra **SMTP & API → API Keys** e gere uma chave para `BREVO_API_KEY`.
2. Em **Senders**, adicione e verifique o remetente (`MAIL_FROM_EMAIL`).
   - Recomendado: um domínio próprio, com SPF e DKIM configurados.
   - Remetentes `@gmail.com` costumam cair no spam.
3. No painel, use **Integrações → Enviar teste**.

Os e-mails enviados são: código de verificação, código de redefinição de senha, avisos de senha ou e-mail alterado, exclusão de conta e eventos da assinatura.

## Telegram (opcional)

Envia notificações para a equipe, como novo cadastro, assinatura ativada, cobrança recusada, cancelamento e erros de webhook.
1. Crie um bot com o @BotFather.
2. Adicione o bot ao grupo.
3. Informe o token e o Chat ID no painel. O token fica criptografado no banco.

## API (resumo)

Todas as rotas autenticadas exigem o cabeçalho `Authorization: Bearer <accessToken>`. Os erros seguem o formato `{ message, code }`.

| Área | Rotas |
|---|---|
| Autenticação | `POST /auth/register`, `GET /auth/check-email`, `POST /auth/verify-email`, `POST /auth/resend-verification-code`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Usuário | `GET /user/me`, `GET /user/me/export`, `PUT /user/:id`, `DELETE /user/:id` (com `{senha}`) |
| Clientes | `GET /client/userClients`, `POST /client`, `GET/PUT/DELETE /client/:id` |
| Catálogo | `GET /produto`, `POST /produto`, `GET/PUT/DELETE /produto/:id` |
| Orçamentos | `GET /orcamento/userOrcamentos`, `GET /orcamento/client/:id`, `POST /orcamento`, `GET/PUT/DELETE /orcamento/:id` |
| Obras | `GET /obra/userObras`, `GET /obra/client/:id`, `POST /obra`, `GET/PUT/DELETE /obra/:id` |
| Planos | `GET /plans` (público), `GET /subscription/me`, `POST /subscription/checkout`, `POST /subscription/sync`, `POST /subscription/cancel` |
| Webhooks | `POST /webhooks/mercadopago` |
| Saúde | `GET /health` |

Códigos de erro que o app trata:

| Código | Situação |
|---|---|
| `PLAN_LIMIT` (403) | Limite do plano atingido |
| `EMAIL_NOT_VERIFIED` (403) | E-mail ainda não confirmado |
| `ACCOUNT_BLOCKED` (403) | Conta bloqueada |
| `WRONG_PASSWORD` (401) | Senha incorreta |
| `CHECKOUT_DISABLED` (403) | Assinatura desligada nesta plataforma |

Detalhes de segurança e riscos conhecidos: veja [SEGURANCA.md](SEGURANCA.md).
