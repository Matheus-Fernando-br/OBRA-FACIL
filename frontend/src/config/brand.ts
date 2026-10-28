/** Nome do sistema: use sempre daqui (logo, títulos das páginas, PDFs). */
export const APP_NAME = "Obra Fácil";

/** Título da página/aba do navegador: "Seção · Obra Fácil". */
export const pageTitle = (secao?: string) => (secao ? `${secao} · ${APP_NAME}` : APP_NAME);
