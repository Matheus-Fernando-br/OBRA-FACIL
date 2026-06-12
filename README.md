# 🏗️ OBRA-FÁCIL

Sistema de gestão de obras, clientes, orçamentos e serviços desenvolvido para construtoras, empreiteiros, engenheiros, arquitetos e profissionais da construção civil.

---

# 📱 Sobre o Projeto

O OBRA-FÁCIL é um aplicativo mobile desenvolvido para simplificar o gerenciamento de obras e serviços.

O objetivo principal é centralizar informações importantes em um único lugar, permitindo o controle de:

- Clientes
- Orçamentos
- Obras
- Serviços
- Equipes
- Relatórios
- Financeiro

Tudo através de uma interface moderna, intuitiva e preparada para crescimento futuro.

---

# 🎯 Objetivo

Atualmente muitos profissionais utilizam:

- WhatsApp
- Planilhas Excel
- Cadernos
- Anotações soltas

para controlar seus clientes e obras.

O OBRA-FÁCIL foi criado para resolver esse problema oferecendo uma plataforma única para acompanhamento completo do negócio.

---

# 🚀 Tecnologias Utilizadas

## Frontend

- React Native
- Expo SDK 56
- TypeScript
- Expo Router
- React Navigation
- Context API
- Axios

---

## Backend (Planejado)

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Docker

---

## Infraestrutura (Planejada)

- Railway
- Render
- VPS Linux
- Nginx
- Cloudflare

---

# 📂 Estrutura do Projeto

```bash
frontend/

├── src/
│
├── app/
│   ├── login/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── clientes.tsx
│   │   ├── orcamentos.tsx
│   │   ├── obras.tsx
│   │   └── mais.tsx
│
├── components/
│   ├── buttons/
│   ├── cards/
│   ├── forms/
│   └── modals/
│
├── contexts/
│   └── AuthContext.tsx
│
├── services/
│   └── api/
│
├── styles/
│   ├── screens/
│   ├── components/
│   ├── colors.ts
│   └── global.ts
│
├── data/
│   ├── clients.ts
│   └── mock.ts
│
├── types/
│
└── assets/
```

---

# 🔐 Autenticação

Atualmente o sistema utiliza autenticação demonstrativa para desenvolvimento.

Próximas implementações:

- Login real
- JWT
- Refresh Token
- Recuperação de senha
- Verificação de email
- Controle de sessão

---

# 📊 Dashboard

A tela inicial apresenta um resumo geral do negócio.

Indicadores:

- Orçamentos pendentes
- Clientes cadastrados
- Obras em andamento
- Faturamento mensal

---

# ⚡ Acesso Rápido

Acesso rápido personalizável para funcionalidades mais utilizadas.

Exemplos:

- Clientes
- Obras
- Financeiro

No futuro será possível:

- Reordenar
- Adicionar atalhos
- Remover atalhos

---

# 👥 Clientes

Funcionalidades:

- Cadastro de clientes
- Busca rápida
- Modal de cadastro
- Visualização em lista

Próximas melhorias:

- Editar cliente
- Excluir cliente
- Histórico de serviços
- Documentos anexados

---

# 💰 Orçamentos

Funcionalidades planejadas:

- Criação de orçamento
- Aprovação
- Recusa
- Conversão em obra

Filtros:

- Todos
- Pendentes
- Aprovados
- Recusados

---

# 🏗️ Obras

Controle completo das obras.

Dados exibidos:

- Nome
- Tipo
- Metragem
- Percentual concluído
- Status

Filtros:

- Todas
- Em andamento
- Concluídas

Funcionalidades futuras:

- Fotos da obra
- Cronograma
- Materiais
- Custos
- Equipe responsável

---

# 📈 Financeiro

Planejado para futuras versões.

Funcionalidades:

- Receitas
- Despesas
- Fluxo de caixa
- Relatórios
- Lucro por obra

---

# 👷 Equipe

Módulo futuro para gerenciamento de colaboradores.

Funcionalidades:

- Cadastro
- Funções
- Controle de acesso
- Produtividade

---

# 🔔 Notificações

Funcionalidades planejadas:

- Push Notification
- Avisos de vencimento
- Atualizações de obras
- Alertas financeiros

---

# 🌙 Temas

Planejamento:

- Tema Claro
- Tema Escuro
- Personalização de cores

---

# 📄 Relatórios

Futuras funcionalidades:

- PDF
- Excel
- Impressão
- Compartilhamento

---

# 📷 Recursos Mobile Planejados

- Câmera
- Upload de fotos
- Geolocalização
- Biometria
- Armazenamento offline

---

# 🌐 Integração API

A aplicação foi estruturada para consumir APIs REST.

Exemplo:

```ts
/api/ahtu / login / api / clientes / api / orcamentos / api / obras;
```

Configuração:

```ts
src / services / api / api.ts;
```

---

# ▶️ Executando o Projeto

Instalar dependências:

```bash
npm install
```

Executar:

```bash
npx expo start
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

Web:

```bash
npm run web
```

---

# 📌 Roadmap

## Versão 1.0

- Login
- Dashboard
- Clientes
- Obras
- Orçamentos

## Versão 1.5

- Backend FastAPI
- PostgreSQL
- JWT

## Versão 2.0

- Financeiro
- Relatórios
- Equipe

## Versão 3.0

- Assinatura digital
- Contratos PDF
- Offline Mode
- Push Notifications

---

# 👨‍💻 Autor

Matheus Fernando

Estudante de Engenharia de Software

Analista de TI

Projeto desenvolvido para estudo, crescimento profissional e futura comercialização como plataforma SaaS para o setor da construção civil.

---

# 📜 Licença

Projeto privado.

Todos os direitos reservados.
OBRA-FÁCIL © 2026
# OBRA-FACIL
