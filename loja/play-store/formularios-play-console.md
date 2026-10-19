# Respostas para os formulários do Play Console

Baseadas no que o app faz hoje (versão 1.0.0). **Revise com o backend** (seu parceiro) os itens
marcados com ⚠️, pois dependem de como o servidor armazena os dados.

---

## 1. Segurança dos dados (Data safety)
*Play Console → Política e programas → Conteúdo do app → Segurança dos dados*

**O app coleta ou compartilha dados do usuário?** Sim.
**Todos os dados são criptografados em trânsito?** Sim (HTTPS).
**Os usuários podem pedir a exclusão dos dados?** Sim — no app (Configurações → Excluir conta)
e pela página https://matheus-fernando-br.github.io/OBRA-FACIL/excluir-conta.html

| Tipo de dado (categoria do Play) | Coletado | Compartilhado | Obrigatório | Finalidade |
|---|---|---|---|---|
| Informações pessoais → **Nome** | Sim | Não | Sim | Funcionalidade do app, Gerenciamento da conta |
| Informações pessoais → **Endereço de e-mail** | Sim | Não | Sim | Funcionalidade do app, Gerenciamento da conta, Comunicações (códigos de verificação) |
| Informações pessoais → **Outras informações** (CPF/CNPJ) | Sim | Não | Sim | Gerenciamento da conta |
| Informações pessoais → **Número de telefone** (dos clientes cadastrados) | Sim | Não | Não | Funcionalidade do app |
| Informações pessoais → **Endereço** (local das obras) | Sim | Não | Não | Funcionalidade do app |
| Informações financeiras → **Outras informações financeiras** (valores de orçamentos) | Sim | Não | Não | Funcionalidade do app |
| Arquivos e documentos (PDFs gerados no aparelho) | Não* | Não | — | — |

\* Os PDFs são gerados e ficam no aparelho; só saem quando o próprio usuário compartilha.

**Não coletado:** localização, contatos da agenda, fotos/vídeos, áudio, histórico de navegação,
identificadores de publicidade, dados de saúde, dados biométricos (a biometria é verificada pelo
sistema do aparelho e o app não recebe nenhum dado biométrico).

⚠️ Se o backend registrar IP/logs de acesso ou usar ferramenta de análise/erros (ex.: Sentry),
marque também **Informações e desempenho do app → Registros de falhas / Diagnóstico**.

---

## 2. Classificação de conteúdo (IARC)
*Conteúdo do app → Classificação de conteúdo*

- Categoria: **Utilitário, produtividade, comunicação ou outro**
- Violência, sexo, linguagem imprópria, drogas, jogos de azar: **Não** para todos
- Os usuários interagem entre si / trocam conteúdo? **Não**
- Compartilha localização? **Não**
- Permite compras digitais? **Não** na v1 (quando o Google Play Billing for implementado: **Sim**)

Resultado esperado: **Classificação Livre (L)**.

---

## 3. Público-alvo
- Faixa etária: **18 anos ou mais**
- O app é direcionado a crianças? **Não**
- Aparece na seção infantil? **Não**

---

## 4. Outras declarações
| Pergunta | Resposta |
|---|---|
| Anúncios | **Não contém anúncios** |
| Acesso ao app (para revisão) | **Todas ou algumas funcionalidades são restritas** → informe e-mail e senha de uma **conta de teste** criada para o revisor do Google |
| App governamental | Não |
| Recursos financeiros (empréstimos, etc.) | Não |
| App de saúde | Não |
| Notícias | Não |
| ID de publicidade | **Não usa** (o app não declara a permissão AD_ID) |

---

## 5. Permissões declaradas no app
| Permissão | Por quê |
|---|---|
| `INTERNET` | Comunicação com o servidor |
| `USE_BIOMETRIC` / `USE_FINGERPRINT` | Desbloqueio com digital/rosto |
| `VIBRATE` | Retorno tátil do sistema (adicionada pelas bibliotecas) |

Câmera, microfone, localização, armazenamento e janelas sobrepostas estão **bloqueados** no `app.json`.
