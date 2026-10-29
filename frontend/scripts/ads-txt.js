/*
 * Gera public/ads.txt (AdSense, site) e public/app-ads.txt (AdMob, app)
 * a partir do ID de editor do Google, no build da Vercel:
 *   EXPO_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
 * Sem a variável, não gera nada (e remove arquivos antigos).
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public");
const client = (process.env.EXPO_PUBLIC_ADSENSE_CLIENT || "").trim();
const pub = client.replace(/^ca-/, "");

fs.mkdirSync(dir, { recursive: true });
for (const file of ["ads.txt", "app-ads.txt"]) {
  const target = path.join(dir, file);
  if (/^pub-\d{10,}$/.test(pub)) {
    fs.writeFileSync(target, `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
    console.log(`${file} gerado para ${pub}`);
  } else if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}
