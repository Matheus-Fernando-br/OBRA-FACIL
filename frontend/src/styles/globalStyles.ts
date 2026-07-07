import { Background } from "expo-router/build/react-navigation";
import { Section } from "lucide-react-native";
import { StyleSheet } from "react-native";

/* =========================
   CORES GLOBAIS
========================= */

export const COLORS = {
  primary: "#3B82F6",
  secondary: "#0D6B75",

  background: "#FFFCFC",
  backgroundSection: "#F0F0F0",

  card: "#D9D7D7",
  cardHover: "#1E293B",

  white: "#FFFFFF",
  title: "#c45f00",
  text: "#000000",
  textSecondary: "#474242e5",

  border: "#1e2c43",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  tabBarHeight: 70,
};

export const globalStyles = StyleSheet.create({
  /* =========================
   LOGIN
========================= */

  loginContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    paddingHorizontal: 40,
    backgroundColor: COLORS.background,
  },

  loginTitle: {
    color: COLORS.title,
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 40,
  },

  loginButton: {
    height: 55,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 16,
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

  loginText: {
    color: COLORS.textSecondary,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    backgroundColor: COLORS.backgroundSection,

    borderWidth: 0.8,
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

    backgroundColor: COLORS.textSecondary,

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

    backgroundColor: COLORS.backgroundSection,

    borderTopWidth: 3,
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
    marginBottom: 24,
    marginLeft: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  pageHeaderRow: {
    marginTop: 10,
    marginBottom: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pageHeaderButton: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: COLORS.title,

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
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.title,
  },

  pageTitle: {
    fontFamily: "IntelOneMono_700Bold",
    fontSize: 28,
    color: COLORS.text,
    marginTop: 60,
    marginBottom: 20,
  },

  sectionTitle: {
    fontFamily: "Montserrat_500Medium,",
    fontWeight: "600",
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 7,
    marginBottom: 16,
    marginTop: 16,
  },

  subtitle: {
    fontFamily: "IntelOneMono_400Regular",
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  body: {
    fontFamily: "IntelOneMono_400Regular",
    color: COLORS.text,
  },

  section: {
    marginBottom: 20,
    padding: 10,
    paddingHorizontal: 5,
    borderRadius: 12,
    backgroundColor: "transparent",
  },

  profileImageIndex: {
    width: 50,
    height: 50,
    marginTop: 5,
    borderRadius: 999,
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

  /* =========================
   DASHBOARD CARD
========================= */

  dashboardCard: {
    backgroundColor: COLORS.textSecondary,
    flexDirection: "column",
    padding: 8,
    borderRadius: 18,
    width: "24%",
    marginBottom: 16,
    shadowColor: COLORS.danger,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 3,
  },

  dashboardCardTitle: {
    fontSize: 12,
    color: COLORS.white,
    marginBottom: 5,
  },

  dashboardCardValue: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "bold",
    color: COLORS.white,
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
    padding: 15,
  },

  profileCard: {
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
    backgroundColor: COLORS.backgroundSection,
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

    shadowColor: COLORS.textSecondary,

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

    backgroundColor: COLORS.title,

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
    backgroundColor: COLORS.backgroundSection,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  clientCardName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.text,
  },

  clientCardInfo: {
    color: COLORS.textSecondary,
    marginTop: 6,
  },

  clientIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
    marginRight: 20,
  },

  /* =========================
    ADD CARD
========================= */

  addCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: 50,
  },

  addTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,

    textAlign: "center",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    position: "relative",
  },

  leftAction: {
    zIndex: 1, // Garante que a área de clique fique por cima do título
  },

  rightAction: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1, // Garante clique sobre o título
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
    fontFamily: "Poppins_800SemiBold",
    alignSelf: "flex-start",
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    width: "100%",
    marginVertical: 10,
  },

  saveTextStack: {
    flexDirection: "column",
    alignItems: "flex-end", // Alinha os textos à direita (perto do ícone)
    marginRight: 6, // Dá um respiro entre o texto e o ícone
  },

  saveText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13, // Fonte um pouco menor já que está em duas linhas
    color: COLORS.title,
    lineHeight: 14, // Deixa as palavras mais próximas uma da outra
  },

  /* =========================
   QUICK ACCESS CARD
========================= */

  quickButton: {
    flex: 1,

    backgroundColor: COLORS.backgroundSection,

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
    fontFamily:"Montserrat_400Regular",
    fontSize:12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },

  quickAccessEditButton: {
    width: 60,
    height: 60,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
  },

  /* =========================
   WORK CARD
========================= */

  workCard: {
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 0.2,
    borderColor: COLORS.text,
  },

  workCardImage: {
    width: 120,
    height: 90,
    borderRadius: 14,
    marginRight: 16,
  },

  workCardContent: {
    flex: 1,
  },

  workCardTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },

  workCardInfo: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    fontWeight: "400",
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },

  workCardProgress: {
    width: 42,
    textAlign: "right",
    marginLeft: 10,
    fontWeight: "600",
    color: COLORS.text,
  },
});

/* =========================
   VARIÁVEIS GLOBAIS
========================= */

export const APP_CONFIG = {
  tabBarActiveColor: COLORS.primary,
};
