/*
 * Rota explícita do login. "/" é compartilhada entre app/index.tsx (login)
 * e app/(tabs)/index.tsx (Início); dentro das abas, router.replace("/")
 * abria o Início. Todos os redirecionamentos para o login usam "/login".
 */
export { default } from "./index";
