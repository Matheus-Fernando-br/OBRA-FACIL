import { Linking } from "react-native";

/* ==========================================================
   CONTATO, EMPRESA E LINKS LEGAIS
   Usados no app (Ajuda, Sobre, Planos, Termos) e na loja.
========================================================== */

export const COMPANY = {
  nome: "R2M",
  app: "Obra Fácil",
};

export const SUPPORT = {
  email: "r2m.tec.adm@gmail.com",
  /** Somente dígitos, com DDI 55. */
  whatsapp: "5531986763652",
  whatsappDisplay: "(31) 98676-3652",
};

/**
 * Páginas públicas (GitHub Pages, pasta /docs do repositório).
 * Exigidas pelo Google Play: política de privacidade e exclusão de conta.
 */
const PAGES_BASE = "https://matheus-fernando-br.github.io/OBRA-FACIL";

export const LEGAL_URLS = {
  privacidade: `${PAGES_BASE}/privacidade.html`,
  termos: `${PAGES_BASE}/termos.html`,
  excluirConta: `${PAGES_BASE}/excluir-conta.html`,
};

export function openWhatsApp(message = "Olá! Preciso de ajuda com o Obra Fácil.") {
  return Linking.openURL(
    `https://wa.me/${SUPPORT.whatsapp}?text=${encodeURIComponent(message)}`,
  );
}

export function openSupportEmail(subject = "Suporte Obra Fácil", body = "") {
  return Linking.openURL(
    `mailto:${SUPPORT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  );
}
