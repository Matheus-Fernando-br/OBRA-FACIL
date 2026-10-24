# Segurança — Obra Fácil API

Auditoria feita na criação deste backend, comparando com o backend anterior (ZIP `Obra-facil-backend-DEV`).

## Problemas do backend anterior, todos corrigidos

| # | Problema | Correção |
|---|---|---|
| 1 | `GET /user`, `GET /client`, `GET /orcamento`, `GET /obra`, `POST /orcamento` e `POST /obra` funcionavam **sem login**, expondo dados de todos os usuários (inclusive hashes de senha) | As rotas foram removidas; tudo exige token |
| 2 | Rotas `/:id` não conferiam o dono: qualquer usuário logado lia, alterava ou excluía registros de outros | Toda consulta filtra por `responsavel` = usuário do token; id de outro usuário → 404 |
| 3 | O cliente não tinha dono, só uma lista no usuário | Campo `responsavel` adicionado, com migração 002 |
| 4 | O corpo da requisição era gravado direto no banco (*mass assignment*), permitindo trocar `responsavel` e outros campos | Validação Zod com lista de campos permitidos |
| 5 | O JWT carregava o usuário inteiro e não podia ser revogado | O JWT leva só `sub` e `tv` (versão); usuário bloqueado ou com senha trocada perde o acesso na hora |
| 6 | Token inválido respondia 403, quebrando a renovação de sessão do app | Token inválido ou expirado responde 401 |
| 7 | A troca de senha não pedia a senha atual; e-mail trocava sem confirmação | Exige `senhaAtual`; avisa por e-mail e encerra as outras sessões |
| 8 | Exclusão de conta sem senha e sem apagar clientes, orçamentos e obras | Exige senha, apaga tudo e cancela a cobrança no Mercado Pago |
| 9 | Respostas de erro devolviam `error.message` interno | Resposta genérica nos erros 500; detalhes só no log |
| 10 | Logs com `console.log` de dados; senhas do Gmail via SMTP | Pino com redação de senha, token, código e CPF/CNPJ; Brevo por API |
| 11 | Código de verificação com `Math.random` | `crypto.randomInt`, guardado só como HMAC, máximo de 5 tentativas, 15 minutos de validade |
| 12 | Sem limite de tentativas | `express-rate-limit` em login, cadastro, códigos, e-mails, webhooks e painel |
| 13 | Refresh token reutilizável e sem detecção de roubo | Token opaco, guardado como hash, trocado a cada uso; reuso revoga a família |
| 14 | Corpo de até 100 MB aceito | Limite de 1 MB |
| 15 | `populate('responsavel')` devolvia o usuário inteiro, com hash da senha | `populate` só com `nome email CPF CNPJ` |

## Controles implementados

- **Autenticação**
  - bcrypt com custo 12;
  - comparação com tempo constante, inclusive para e-mail inexistente;
  - e-mail verificado obrigatório para entrar;
  - "esqueci a senha" não revela se o e-mail existe.
- **Autorização**
  - isolamento por usuário em todas as rotas (coberto por testes);
  - o painel usa outro segredo, outro cookie e outra coleção, e não aceita token do app.
- **Painel**
  - cookie `httpOnly`, `SameSite=Strict` e `Secure` em produção;
  - cabeçalho obrigatório `X-Admin-Request` contra CSRF;
  - bloqueio por 15 minutos após 5 senhas erradas;
  - troca obrigatória da senha inicial;
  - auditoria de todas as ações.
- **Senha inicial do admin**
  - só via variável `ADMIN_INITIAL_PASSWORD`;
  - o banco guarda só o hash;
  - ignorada depois de criado o administrador;
  - o diagnóstico avisa se a variável continua definida.
- **Pagamentos**
  - webhook com HMAC (`x-signature`) e deduplicação;
  - o estado sempre vem de consulta à API do Mercado Pago;
  - conferência de valor, moeda e referência;
  - nenhum plano é concedido por requisição do app.
- **Segredos no banco:** o token do Telegram é criptografado com AES-256-GCM (`SETTINGS_ENCRYPTION_KEY`) e nunca é devolvido pela API.
- **Cabeçalhos:** Helmet com CSP estrita (sem scripts externos ou inline), `frame-ancestors 'none'` e HSTS.
- **CORS:** só as origens configuradas; o app nativo não envia `Origin`.
- **Diagnóstico:** mostra apenas se cada variável existe, nunca o valor.

## Riscos conhecidos

| Risco | Impacto | Mitigação ou próximo passo |
|---|---|---|
| Limites e rate limit em memória: com mais de uma instância, os limites são por instância | Baixo (uma instância) | Usar Redis (`rate-limit-redis`) ao escalar |
| Duas criações simultâneas podem passar 1 item do limite do plano | Baixo | Aceitável; trocar por contador atômico se necessário |
| Painel sem segundo fator (2FA) | Médio | Senha forte, bloqueio por tentativas e auditoria. Próximo passo: TOTP ou restringir por IP no Render |
| O `payer_email` do Mercado Pago é o e-mail da conta; pessoas que pagam com outra conta do Mercado Pago podem precisar usar o mesmo e-mail | Funcional | Orientação na página `/assinar`; avaliar o checkout com `card_token` (Bricks) |
| Contas antigas foram marcadas como verificadas (migração 003) para não bloquear quem já usava o app | Baixo | Contas novas sempre verificam o e-mail |
| `frontend`: avisos do `npm audit` em ferramentas de build do Expo (`node-forge`, `zod`, `uuid`) e em `decode-uri-component` (via `expo-router`) | Baixo (não exploráveis no app em uso normal) | A correção depende do Expo SDK 58; atualizar quando sair |
| Checkout do Mercado Pago dentro do app Android viola a política da Google Play se ligado sem adesão ao programa de faturamento alternativo | Alto (remoção da loja) | Desligado por padrão no painel; assinatura pela web |

## Checklist de produção

- [ ] `MONGO_URI` com usuário de banco exclusivo do app, com permissão só no banco do Obra Fácil, e lista de IPs do Atlas restrita (ou `0.0.0.0/0` com senha forte, já que o Render não tem IP fixo nos planos básicos).
- [ ] `ADMIN_INITIAL_PASSWORD` removida após o primeiro acesso.
- [ ] Credenciais de produção do Mercado Pago só depois dos testes com credenciais de teste.
- [ ] Remetente do Brevo com domínio próprio (SPF e DKIM).
- [ ] Backups automáticos do Atlas ativados.
