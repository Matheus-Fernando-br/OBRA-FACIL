import { Background } from "expo-router/build/react-navigation";
import { StyleSheet } from "react-native";

/* =========================
   CORES GLOBAIS
========================= */

export const COLORS = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",

  background: "#020617",
  backgroundSecondary: "#0F172A",
  backgrounddark: "#01030e",

  card: "#111827",
  cardHover: "#1E293B",

  white: "#FFFFFF",

  text: "#F8FAFC",
  textSecondary: "#94A3B8",

  border: "#1E293B",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  tabBarHeight: 70,
};

/* =========================
   ESTILOS GLOBAIS
========================= */
const CARD_STYLE = {
  backgroundColor: COLORS.card,

  borderWidth: 1,
  borderColor: COLORS.border,

  borderRadius: 18,

  shadowColor: "#000",

  shadowOffset: {
    width: 0,
    height: 4,
  },

  shadowOpacity: 0.2,
  shadowRadius: 8,

  elevation: 6,
};

export const globalStyles = StyleSheet.create({
  /* =========================
   LOGIN
========================= */

  loginContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0F172A",
  },

  loginTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 40,
  },

  loginInput: {
    height: 55,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    marginBottom: 16,
  },

  loginButton: {
    height: 55,
    backgroundColor: COLORS.primary,
    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
  },

  loginButtonCadastro: {
    height: 55,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },  

  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  loginText : {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },


  /* =========================
     LAYOUT
  ========================= */

  screen: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 40,
  },

  pageContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },

  feedback: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: -5,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },

  /* =========================
   ORÇAMENTOS
========================= */

  orcamentoCard: {
    backgroundColor: COLORS.card,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 18,

    padding: 18,
    marginBottom: 16,
  },

  orcamentoCliente: {
    fontSize: 18,
    fontWeight: "700",

    color: COLORS.text,

    marginBottom: 12,
  },

  orcamentoInfo: {
    color: COLORS.textSecondary,

    marginBottom: 6,
  },

  orcamentoDetailsButton: {
    marginTop: 16,

    height: 42,

    borderRadius: 12,

    backgroundColor: COLORS.primary,

    justifyContent: "center",
    alignItems: "center",
  },

  orcamentoDetailsButtonText: {
    color: "#FFF",

    fontWeight: "700",
  },

  filterButtonText: {
    color: COLORS.text,
  },

  /* =========================
   OBRAS
========================= */

  obraCard: {
    backgroundColor: COLORS.card,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 18,

    padding: 16,
    marginBottom: 16,
  },

  obraImagePlaceholder: {
    height: 180,

    borderRadius: 14,

    backgroundColor: COLORS.backgroundSecondary,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  obraImageText: {
    color: COLORS.textSecondary,
  },

  obraNome: {
    fontSize: 20,
    fontWeight: "700",

    color: COLORS.text,

    marginBottom: 12,
  },

  obraInfo: {
    color: COLORS.textSecondary,

    marginBottom: 6,
  },

  obraProgressText: {
    marginTop: 10,

    color: COLORS.text,

    fontWeight: "600",
  },

  obraDetailsButton: {
    marginTop: 16,

    height: 45,

    borderRadius: 12,

    backgroundColor: COLORS.primary,

    justifyContent: "center",
    alignItems: "center",
  },

  obraDetailsButtonText: {
    color: "#FFF",

    fontWeight: "700",
  },

  /* =========================
     TAB BAR
  ========================= */

  tabBar: {
    height: COLORS.tabBarHeight,
    paddingTop: 10,
    paddingBottom: 10,

    backgroundColor: COLORS.backgrounddark,

    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  /* =========================
     HEADER
  ========================= */

  pageHeader: {
    marginTop: 60,
    marginBottom: 20,
  },

  homeHeader: {
    marginTop: 60,
    marginBottom: 24,
  },

  pageHeaderRow: {
    marginTop: 60,
    marginBottom: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pageHeaderButton: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: COLORS.card,

    borderWidth: 1,
    borderColor: COLORS.border,

    justifyContent: "center",
    alignItems: "center",
  },

  pageHeaderButtonText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "600",
  },

  /* =========================
     TIPOGRAFIA
  ========================= */

  title: {
    fontFamily: "IntelOneMono_700Bold",
    fontSize: 28,
    color: COLORS.text,
  },

  pageTitle: {
    fontFamily: "IntelOneMono_700Bold",
    fontSize: 28,
    color: COLORS.text,
    marginTop: 60,
    marginBottom: 20,
  },

  sectionTitle: {
    fontFamily: "IntelOneMono_700Bold",
    fontSize: 22,
    color: COLORS.text,
    marginBottom: 16,
  },

  subtitle: {
    fontFamily: "IntelOneMono_400Regular",
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  body: {
    fontFamily: "IntelOneMono_400Regular",
    color: COLORS.text,
  },

  /* =========================
     DASHBOARD
  ========================= */

  dashboardGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  quickAccessHeader: {
    marginTop: 24,
    marginBottom: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  workSection: {
    marginTop: 28,
  },

  /* =========================
   DASHBOARD CARD
========================= */

  dashboardCard: {
    backgroundColor: COLORS.card,

    padding: 20,
    borderRadius: 18,

    width: "48%",
    marginBottom: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 3,
  },

  dashboardCardTitle: {
    marginBottom: 8,
    color: COLORS.textSecondary,
  },

  dashboardCardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },

  /* =========================
     FILTROS
  ========================= */

  filterRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  filterButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },

  /* =========================
     TELA MAIS
  ========================= */

  maisContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },

  profileCard: {
    marginTop: 60,
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 22,
    marginBottom: 24,
  },

  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },

  profileEmail: {
    marginTop: 6,
    color: COLORS.textSecondary,
  },

  menuCard: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 18,
    marginBottom: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 999,
    marginBottom: 16,
  },

  /* =========================
   BUTTONS
========================= */

  appButton: {
    height: 55,
    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",
  },

  appButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  fabButton: {
    position: "absolute",

    bottom: 100,
    right: 24,

    width: 65,
    height: 65,

    borderRadius: 999,

    backgroundColor: COLORS.primary,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.2,
    shadowRadius: 4,

    elevation: 6,
  },

  bottomActionContainer: {
    position: "absolute",

    bottom: 20,
    left: 24,
    right: 24,
  },

  bottomActionButton: {
    height: 56,

    backgroundColor: COLORS.primary,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",
  },

  bottomActionButtonText: {
    color: "#FFF",

    fontSize: 16,
    fontWeight: "700",
  },

  /* =========================
   CLIENT CARD
========================= */

  clientCard: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  clientCardName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: COLORS.text,
  },

  clientCardInfo: {
    color: COLORS.textSecondary,
  },

  clientCardCity: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  /* =========================
    ADD CARD
========================= */

  addCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 50,
    paddingRight: 50,
    marginTop: 100,
    marginBottom: 2 + COLORS.tabBarHeight,
  },

  addTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },

  modalCloseButtonHover: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  label: {
    alignSelf: "flex-start",
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#444",
    width: "100%",
    marginVertical: 15,
  },

  /* =========================
   QUICK ACCESS CARD
========================= */

  quickButton: {
    flex: 1,

    backgroundColor: COLORS.card,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    borderRadius: 18,
    padding: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,

    alignItems: "center",

    marginHorizontal: 2,
  },

  quickButtonHover: {
    backgroundColor: COLORS.cardHover,
  },

  quickButtonText: {
    marginTop: 10,
    fontWeight: "600",
    color: COLORS.text,
  },

  quickAccessEditButton: {
    width: 60,
    height: 60,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    borderRadius: 12,

    backgroundColor: COLORS.card,

    justifyContent: "center",
    alignItems: "center",
  },

  /* =========================
   WORK CARD
========================= */

  workCard: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 0.2,
    borderColor: COLORS.primary,
  },

  workCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.text,
  },

  workCardInfo: {
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  workCardProgress: {
    marginTop: 8,
    fontWeight: "600",
    color: COLORS.text,
  },

  progressBarBackground: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 99,
  },

  progressBarFill: {
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 99,
  },
});

/* =========================
   VARIÁVEIS GLOBAIS
========================= */

export const APP_CONFIG = {
  tabBarActiveColor: COLORS.primary,
};
