# Publicar o Obra Fácil na Google Play — passo a passo

Tudo o que é do frontend já está pronto no código. Este guia cobre o que é feito **fora do código**.

| Arquivo | Conteúdo |
|---|---|
| `listagem.md` | Nome, descrições, categoria, contato e lista de imagens |
| `formularios-play-console.md` | Respostas de Segurança dos dados, classificação, público-alvo e declarações |
| `imagens/` | Ícone 512, gráfico de recursos 1024×500 e capturas 1080×1920 |

## Identidade do app (não mude depois de publicar)
- Nome: **Obra Fácil**
- Pacote Android: **`com.r2m.obrafacil`** (iOS: mesmo `bundleIdentifier`)
- Versão: `expo.version` no `app.json` (1.0.0). O número de build (versionCode) é controlado pelo EAS
  (`appVersionSource: remote` + `autoIncrement`).

## 0. Antes de tudo
1. **Ative o GitHub Pages** (políticas exigidas pela loja):
   GitHub → repositório OBRA-FACIL → **Settings → Pages → Source: Deploy from a branch →
   Branch: `main` / pasta `/docs` → Save**. Em ~1 min ficam no ar:
   - https://matheus-fernando-br.github.io/OBRA-FACIL/privacidade.html
   - https://matheus-fernando-br.github.io/OBRA-FACIL/termos.html
   - https://matheus-fernando-br.github.io/OBRA-FACIL/excluir-conta.html
   > Se mudar o texto, edite `frontend/src/content/legal.json` e rode `npm run legal:pages`.
2. **Backend no ar** (pasta `/backend`, guia em `backend/README.md`): crie o serviço no Render pelo
   Blueprint (`render.yaml`), preencha `MONGO_URI`, `BREVO_API_KEY`, `MAIL_FROM_EMAIL` e
   `ADMIN_INITIAL_PASSWORD`, use o plano **Starter** (sem "dormir") e confira `/health`.
3. Crie uma **conta de teste** para o revisor do Google (e-mail + senha) com alguns dados de exemplo.

## 1. Conta de desenvolvedor
- https://play.google.com/console → criar conta (US$ 25, uma vez).
- Conta **pessoal** criada recentemente: o Google exige **teste fechado com pelo menos 12 testadores
  por 14 dias seguidos** antes de liberar a produção. Conta de **organização** (CNPJ, com D-U-N-S)
  não tem essa exigência.

## 2. Gerar o pacote (AAB) com o EAS
Na pasta `frontend`:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile production
```
- Na 1ª vez o EAS pergunta sobre a **chave de assinatura**: responda **Yes** para gerar e guardar
  na nuvem do Expo (não perca o acesso à conta Expo).
- Ao terminar, baixe o arquivo `.aab` pelo link.
- Para testar no celular antes, use `eas build -p android --profile preview` (gera APK).

## 3. Criar o app no Play Console
1. **Criar app** → nome "Obra Fácil", idioma Português (Brasil), App, Gratuito.
2. Preencha **Conteúdo do app** com as respostas de `formularios-play-console.md`.
3. Preencha **Presença na loja** com `listagem.md` e as imagens de `imagens/`.

## 4. Testes
1. **Teste interno** (até 100 pessoas, sem revisão longa): envie o `.aab` e teste em celulares reais.
2. **Teste fechado**: adicione os 12+ testadores (lista de e-mails ou Grupo do Google) e mantenha
   por 14 dias. Peça para eles usarem o app de verdade.
3. Depois disso, **Produção → Criar versão** com o mesmo `.aab` (ou um novo build).

Envio automático (opcional): `eas submit -p android` (exige uma conta de serviço do Google Play;
veja https://docs.expo.dev/submit/android/).

## 5. Planos e pagamento
- Preços, limites e textos: painel administrativo (`/admin` → **Planos e cobrança**). O app lê do servidor.
- Cobrança: **Mercado Pago** (assinatura mensal), confirmada pelo servidor via webhook.
- **Regra da Google Play:** assinaturas vendidas *dentro* do app Android precisam do Google Play Billing
  (no Brasil, outro meio só com adesão ao programa de faturamento alternativo da Google). Por isso o
  checkout do app Android começa **desligado**; quem quiser assinar usa a página web
  `https://SEU-SERVICO.onrender.com/assinar`, e o plano aparece no app automaticamente.
  O app não deve ter botões ou links que levem ao pagamento fora da Play Store.
- Se no futuro quiser vender dentro do app Android: implementar o Google Play Billing (react-native-iap
  ou RevenueCat) ou aderir ao programa de faturamento alternativo, e atualizar a classificação de
  conteúdo (compras digitais = Sim).

## 6. iOS (depois)
- Conta Apple Developer (US$ 99/ano) → `eas build -p ios --profile production` → `eas submit -p ios`.
- O `bundleIdentifier` (`com.r2m.obrafacil`) e o texto do Face ID já estão no `app.json`.
- Na App Store, assinaturas também precisam ser feitas pela compra dentro do app da Apple.
