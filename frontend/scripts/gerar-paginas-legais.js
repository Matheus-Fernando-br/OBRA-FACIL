/*
 * Gera as páginas públicas exigidas pelo Google Play (GitHub Pages):
 *   docs/index.html, docs/privacidade.html, docs/termos.html, docs/excluir-conta.html
 * Fonte do texto: src/content/legal.json (o mesmo exibido no app).
 *
 * Uso (na pasta frontend):  npm run legal:pages
 */
const fs = require("fs");
const path = require("path");

const legal = require("../src/content/legal.json");
const OUT = path.join(__dirname, "..", "..", "docs");

const SUPPORT = {
  empresa: "R2M",
  email: "r2m.tec.adm@gmail.com",
  whatsapp: "5531986763652",
  whatsappDisplay: "(31) 98676-3652",
};

const esc = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · Obra Fácil</title>
<meta name="description" content="${esc(title)} do aplicativo Obra Fácil (${SUPPORT.empresa})." />
<style>
  :root { --bg:#F2F2F7; --card:#FFFFFF; --text:#1C1C1E; --muted:#6C6C70; --accent:#C2570C; --line:#E5E5EA; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#000000; --card:#1C1C1E; --text:#F5F5F7; --muted:#A1A1A6; --accent:#F08A3C; --line:#38383A; }
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text);
    font: 16px/1.6 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 16px 64px; }
  .brand { font-weight: 800; font-size: 20px; letter-spacing: -0.3px; }
  .brand span { color: var(--accent); }
  nav { display:flex; flex-wrap:wrap; gap:12px; margin: 8px 0 24px; font-size: 14px; }
  a { color: var(--accent); }
  .card { background:var(--card); border:1px solid var(--line); border-radius:20px; padding: 24px; }
  h1 { font-size: 28px; line-height: 1.2; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 24px 0 6px; }
  p { margin: 0 0 12px; }
  .muted { color: var(--muted); font-size: 14px; }
  ol { padding-left: 20px; }
  footer { margin-top: 24px; font-size: 13px; color: var(--muted); }
</style>
</head>
<body>
<main>
  <div class="brand">Obra<span>Fácil</span></div>
  <nav>
    <a href="privacidade.html">Política de Privacidade</a>
    <a href="termos.html">Termos de Uso</a>
    <a href="excluir-conta.html">Excluir conta</a>
  </nav>
  <div class="card">
${body}
  </div>
  <footer>
    ${esc(SUPPORT.empresa)} · <a href="mailto:${SUPPORT.email}">${SUPPORT.email}</a> ·
    <a href="https://wa.me/${SUPPORT.whatsapp}">WhatsApp ${SUPPORT.whatsappDisplay}</a>
  </footer>
</main>
</body>
</html>
`;
}

function documentPage(doc) {
  const sections = doc.secoes
    .map((s) => `    <h2>${esc(s.titulo)}</h2>\n    <p>${esc(s.texto)}</p>`)
    .join("\n");
  return page(
    doc.titulo,
    `    <h1>${esc(doc.titulo)}</h1>
    <p class="muted">Última atualização: ${esc(legal.atualizadoEm)}</p>
    <p>${esc(doc.intro)}</p>
${sections}`,
  );
}

const deletePage = page(
  "Excluir conta",
  `    <h1>Excluir sua conta do Obra Fácil</h1>
    <p class="muted">Aplicativo Obra Fácil · desenvolvido por ${esc(SUPPORT.empresa)}</p>
    <h2>Pelo aplicativo (imediato)</h2>
    <ol>
      <li>Abra o Obra Fácil e entre na sua conta.</li>
      <li>Toque em <strong>Mais → Configurações gerais → Excluir conta</strong>.</li>
      <li>Digite <strong>EXCLUIR</strong>, informe sua senha e confirme.</li>
    </ol>
    <h2>Sem acesso ao aplicativo</h2>
    <p>Envie um e-mail para <a href="mailto:${SUPPORT.email}?subject=Excluir%20minha%20conta">${SUPPORT.email}</a>
      com o assunto <strong>“Excluir minha conta”</strong>, a partir do e-mail cadastrado.
      Atendemos em até 15 dias e confirmamos por e-mail.</p>
    <h2>O que é apagado</h2>
    <p>Os dados da conta (nome, e-mail, CPF/CNPJ e senha) e todos os clientes, orçamentos e obras cadastrados.</p>
    <h2>O que pode ser mantido</h2>
    <p>Somente registros exigidos por lei, como registros de acesso (Marco Civil da Internet), pelo prazo de 6 meses, depois apagados.</p>`,
);

const indexPage = page(
  "Obra Fácil",
  `    <h1>Obra Fácil</h1>
    <p>Gestão de clientes, orçamentos e obras para profissionais da construção civil.</p>
    <p><a href="privacidade.html">Política de Privacidade</a> · <a href="termos.html">Termos de Uso</a> ·
      <a href="excluir-conta.html">Excluir conta</a></p>`,
);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "privacidade.html"), documentPage(legal.privacidade));
fs.writeFileSync(path.join(OUT, "termos.html"), documentPage(legal.termos));
fs.writeFileSync(path.join(OUT, "excluir-conta.html"), deletePage);
fs.writeFileSync(path.join(OUT, "index.html"), indexPage);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log("Páginas geradas em", OUT);
