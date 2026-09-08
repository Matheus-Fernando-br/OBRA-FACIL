import { StyleSheet } from "react-native";

/* =========================
   CORES GLOBAIS
========================= */

export const COLORS = {
  primary: "#3B82F6",
  secondary: "#0D6B75",
  backgroundDestaque: "rgba(0, 0, 0, 0.32)",
  gradientStart: "#FFFFFF",
  gradientEnd: "#ccbdaf80",
  card: "#D9D7D7",
  cardHover: "#1E293B",

  white: "#FFFFFF",
  title: "#c45f00",
  titleBackground: "#c45f0080",
  text: "#000000",
  textSecondary: "#474242e5",
  placeholder: "#575B69",
  border: "#D5D6DB",
  borderNull: "#BFC0C7",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  tabBarHeight: 70,
};

export function createGlobalStyles(colors: typeof COLORS) {
  return StyleSheet.create({
    /* =========================
   LOGIN
========================= */

    loginContainer: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      paddingHorizontal: 30,
      backgroundColor: colors.white,
    },

    loginTitle: {
      color: colors.title,
      fontSize: 34,
      fontWeight: "bold",
      marginBottom: 40,
    },

    loginButton: {
      height: 55,
      backgroundColor: colors.primary,
      borderRadius: 12,
      marginTop: 16,
      justifyContent: "center",
      alignItems: "center",
    },

    loginButtonCadastro: {
      height: 55,
      backgroundColor: colors.cardHover,
      borderRadius: 12,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },

    loginButtonText: {
      color: COLORS.white,
      fontWeight: "bold",
      fontSize: 16,
    },

    loginText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 16,
    },

    loginImage: {
      width: 250,
      height: 250,
      marginTop: -20,
    },

    /* =========================
     LAYOUT
  ========================= */

    screen: {
      flex: 1,
    },

    container: {
      flex: 1,
      backgroundColor: colors.white,
      paddingVertical: 10,
      paddingHorizontal: 10,
    },

    pageContainer: {
      flex: 1,
      backgroundColor: colors.white,
      padding: 24,
    },

    feedback: {
      color: colors.danger,
      fontSize: 14,
      marginTop: 5,
      marginBottom: 15,
      textAlign: "center",
      fontWeight: "600",
    },

    logoHeaderImg: {
      width: 80,
      height: 52,
    },

    obrigatorio: {
      fontFamily: "HelveticaNow-Bold",
      marginLeft: 5,
      fontSize: 12,
      color: colors.danger,
    },

    checkbox: {
      marginTop: 8,
      width: 22,
      height: 22,
      borderRadius: 5,
    },

    /* =========================
   ORÇAMENTOS
========================= */

    serviceCard: {
      backgroundColor: colors.white,
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },

    orcamentoCard: {
      backgroundColor: colors.white,
      shadowColor: colors.text,
      shadowOpacity: 0.3,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      borderRadius: 18,

      padding: 18,
      marginBottom: 30,
    },

    orcamentoCliente: {
      fontSize: 18,
      fontWeight: "700",

      color: colors.text,

      marginBottom: 12,
    },

    orcamentoInfo: {
      color: colors.textSecondary,

      marginBottom: 6,
    },
    orcamentoTextButton: {
      color: COLORS.white,
      marginBottom: 6,
      fontFamily: "HelveticaNow-Bold",
    },

    orcamentoDetailsButton: {
      marginTop: 16,
      height: 45,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    orcamentoDetailsButtonText: {
      color: COLORS.white,
      fontWeight: "700",
    },

    filterButtonText: {
      color: colors.text,
    },

    orcamentoHeader: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",

      marginBottom: 12,
    },

    orcamentoStatusBadge: {
      paddingHorizontal: 15,

      paddingVertical: 10,

      borderRadius: 20,
    },

    orcamentoStatusText: {
      fontWeight: "700",

      fontSize: 12,
    },

    obraStatusBadge: {
      alignContent: "center",
      alignItems: "center",
      alignSelf: "center",
      width: "30%",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 20,
    },

    obraStatusText: {
      fontWeight: "700",

      fontSize: 12,
    },

    orcamentoButtons: {
      flexDirection: "row",

      marginTop: 20,
    },

    orcamentoMainButton: {
      flexDirection: "row",

      justifyContent: "center",

      alignItems: "center",

      textAlign: "center",

      backgroundColor: colors.primary,

      borderRadius: 5,

      width: "60%",

      marginRight: 8,

      padding: 5,
    },

    obraMainButton: {
      flexDirection: "row",

      justifyContent: "center",

      alignItems: "center",

      textAlign: "center",

      backgroundColor: colors.primary,

      borderRadius: 5,

      marginTop: 5,

      marginHorizontal: 60,

      padding: 5,
    },

    orcamentoEditButton: {
      backgroundColor: colors.warning,
      paddingHorizontal: 30,
      padding: 15,
      marginRight: 8,
      width: 48,
    },

    orcamentoDeleteButton: {
      backgroundColor: colors.danger,
      paddingHorizontal: 30,
      padding: 15,
      width: 48,
    },

    card: {
      backgroundColor: colors.white,
      borderRadius: 20,
      paddingVertical: 18,
      paddingHorizontal: 18,
      marginBottom: 24,

      borderWidth: 1,
      borderColor: colors.border,

      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 10,

      elevation: 10,
    },

    picker: {
      width: "100%",
      height: 60,
      backgroundColor: colors.white,
      borderRadius: 10,
      borderColor: colors.border,
      paddingHorizontal: 20,
      shadowColor: colors.text,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    pickerReadOnly: {
      backgroundColor: colors.borderNull,
      borderColor: colors.border,
      color: colors.placeholder,
      shadowOpacity: 0,
      elevation: 0,
    },

    row: { flexDirection: "row", gap: 10 },
    column: { flex: 1 },

    serviceContainer: {
      padding: 20,
      backgroundColor: colors.white,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: colors.text,
      shadowOpacity: 0.3,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },
    serviceTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
    serviceTotalText: {
      fontFamily: "HelveticaNow-Bold",
      textAlign: "left",
      fontWeight: "bold",
      color: colors.success,
      marginTop: 5,
    },
    categoryTotalText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "right",
    },

    workCardBody: {
      padding: 16,
    },

    workCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    workCardDate: {
      marginBottom: 8,
      fontSize: 13,
      color: colors.placeholder,
    },

    /* =========================
     TAB BAR
  ========================= */

    tabBar: {
      height: colors.tabBarHeight,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: colors.white,
      borderTopWidth: 3,
      borderTopColor: colors.border,
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
      backgroundColor: colors.title,
      borderWidth: 1,
      borderColor: colors.text,
      justifyContent: "center",
      alignItems: "center",
    },
    pageHeaderButtonFilter: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.text,
      justifyContent: "center",
      alignItems: "center",
    },

    pageHeaderButtonText: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "600",
    },

    /* =========================
     TIPOGRAFIA
  ========================= */

    title: {
      fontFamily: "HelveticaNow-SemiBold",
      fontSize: 24,
      fontWeight: "700",
      color: colors.title,
    },

    pageTitle: {
      fontFamily: "IntelOneMono_700Bold",
      fontSize: 28,
      color: colors.text,
      marginTop: 60,
      marginBottom: 20,
    },

    sectionTitle: {
      fontFamily: "HelveticaNow-Medium",
      fontWeight: "600",
      fontSize: 16,
      color: colors.text,
      marginLeft: 7,
      marginBottom: 16,
      marginTop: 16,
    },

    subtitle: {
      fontFamily: "IntelOneMono_400Regular",
      fontSize: 12,
      color: colors.textSecondary,
    },

    body: {
      fontFamily: "IntelOneMono_400Regular",
      color: colors.text,
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
      gap: 15,
    },

    /* =========================
   DASHBOARD CARD
========================= */

    dashboardCard: {
      backgroundColor: colors.textSecondary,
      flexDirection: "column",
      padding: 8,
      borderRadius: 18,
      width: "24%",
      marginBottom: 16,
      shadowColor: colors.danger,
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
      color: colors.white,
      marginBottom: 5,
    },

    dashboardCardValue: {
      fontSize: 18,
      marginTop: 10,
      fontWeight: "bold",
      color: colors.white,
    },

    /* =========================
     FILTROS
  ========================= */

    filterRow: {
      flexDirection: "row",
      marginBottom: 20,
    },

    filterButton: {
      backgroundColor: colors.card,
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
      backgroundColor: colors.white,
      padding: 15,
    },

    profileCard: {
      backgroundColor: colors.border,
      padding: 24,
      borderRadius: 22,
      marginBottom: 24,
      shadowColor: colors.textSecondary,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.2,
      shadowRadius: 4,

      elevation: 6,
    },

    profileName: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },

    profileEmail: {
      marginTop: 6,
      color: colors.textSecondary,
    },

    menuCard: {
      backgroundColor: colors.white,
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
      color: colors.text,
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
      color: COLORS.white,
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

      backgroundColor: colors.primary,

      justifyContent: "center",
      alignItems: "center",

      shadowColor: colors.textSecondary,

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

      bottom: 10,
      left: 24,
      right: 24,
    },

    bottomActionButton: {
      height: 56,

      backgroundColor: colors.title,

      borderRadius: 16,

      justifyContent: "center",
      alignItems: "center",
    },

    bottomActionButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "700",
    },

    /* =========================
   CLIENT CARD
========================= */

    clientCard: {
      flexDirection: "row",
      alignItems: "center",

      backgroundColor: colors.white,

      borderRadius: 10,

      padding: 18,

      marginBottom: 15,

      shadowColor: colors.text,
      shadowOpacity: 0.2,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 4,
    },

    clientCardName: {
      fontFamily: "HelveticaNow-SemiBold",
      fontSize: 18,
      color: colors.text,
    },

    clientCardInfo: {
      color: colors.textSecondary,
      marginTop: 6,
      fontSize: 10,
    },

    clientIcons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 25,
      marginRight: 5,
    },

    /* =========================
    ADD CARD
========================= */

    addCard: {
      flex: 1,
      maxHeight: "100%",
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },

    addTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
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
      flexDirection: "column",
      alignItems: "center",
      zIndex: 1, // Garante clique sobre o título
    },
    right: {
      flexDirection: "row",
      alignItems: "flex-end",
      zIndex: 10,
      gap: 25, // Garante clique sobre o título
    },

    modalCloseButton: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 18,
    },

    label: {
      fontFamily: "Poppins_500Medium",
      alignSelf: "flex-start",
      color: colors.text,
      marginBottom: 6,
      marginTop: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderNull,
      width: "100%",
      marginVertical: 10,
    },

    dividerVertical: {
      width: 1,
      backgroundColor: colors.borderNull,
      height: "100%",
      marginVertical: 5,
      marginHorizontal: 20,
    },

    saveTextStack: {
      flexDirection: "column",
      alignItems: "flex-end", // Alinha os textos à direita (perto do ícone)
    },

    saveText: {
      fontFamily: "Poppins_700Bold",
      fontSize: 13, // Fonte um pouco menor já que está em duas linhas
      color: colors.title,
      lineHeight: 14, // Deixa as palavras mais próximas uma da outra
    },

    /* =========================
   QUICK ACCESS CARD
========================= */

    quickButton: {
      flex: 1,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.borderNull,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: "center",
      marginHorizontal: 2,
    },

    quickButtonHover: {
      backgroundColor: colors.cardHover,
    },

    quickButtonText: {
      marginTop: 5,
      fontFamily: "HelveticaNow-Regular",
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },

    quickAccessEditButton: {
      width: 60,
      height: 60,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },

    /* =========================
   WORK CARD
========================= */

    workCard: {
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      borderRadius: 18,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOpacity: 0.3,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 3,
      },
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
      fontFamily: "HelveticaNow-SemiBold",
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },

    workCardInfo: {
      fontFamily: "HelveticaNow-Regular",
      fontSize: 13,
      fontWeight: "400",
      color: colors.textSecondary,
      marginBottom: 12,
    },

    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    progressBarBackground: {
      flex: 1,
      height: 8,
      backgroundColor: colors.borderNull,
      borderRadius: 999,
      overflow: "hidden",
    },

    progressBarFill: {
      height: "100%",
      backgroundColor: colors.success,
      borderRadius: 999,
    },

    workCardProgress: {
      width: 42,
      textAlign: "right",
      marginLeft: 10,
      fontWeight: "600",
      color: colors.text,
    },
    /* ==========================================================
   OBRAS CARD
========================================================== */

    obrasCard: {
      position: "relative",
      overflow: "hidden",

      backgroundColor: colors.textSecondary,

      borderRadius: 22,

      marginBottom: 18,

      shadowColor: colors.text,
      shadowOpacity: 0.15,
      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 5,
    },

    /* =========================
   IMAGEM DE FUNDO
========================= */

    /*obrasCardBackground: {
    position: "absolute",

    width: "100%",
    height: "100%",

    resizeMode: "cover",
  },*/

    obrasCardOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.white,
    },

    /* =========================
   CONTEÚDO
========================= */

    obrasCardContent: {
      padding: 18,
    },

    /* =========================
   HEADER
========================= */

    obrasCardHeader: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",

      marginBottom: 10,
    },

    menuButton: {
      width: 36,

      height: 36,

      borderRadius: 18,

      justifyContent: "center",

      alignItems: "center",

      backgroundColor: colors.white,
    },

    /* =========================
   TITULO
========================= */

    obrasCardTitle: {
      fontFamily: "Poppins_700Bold",

      fontSize: 20,

      color: colors.title,
    },

    /* =========================
   STATUS
========================= */

    obrasStatusBadge: {
      alignSelf: "flex-start",

      paddingHorizontal: 12,

      paddingVertical: 5,

      borderRadius: 30,

      marginRight: 14,

      marginTop: 5,
    },

    obrasStatusText: {
      fontFamily: "Poppins_600SemiBold",

      fontSize: 12,
    },

    /* =========================
   TEXTOS
========================= */

    obrasCardDate: {
      fontFamily: "Poppins_400Regular",

      fontSize: 13,

      color: colors.text,

      marginBottom: 4,
    },

    /* ==========================================================
   MENU
========================================================== */
    notificationModalContainer: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
    },

    notificationModalOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.backgroundDestaque,
    },

    notificationModal: {
      height: "100%",
      width: "86%",

      elevation: 15,

      shadowColor: colors.text,
      shadowOffset: {
        width: -4,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },

    notificationModalScroll: {
      paddingTop: 25,
      paddingHorizontal: 20,
      paddingBottom: 30,
    },

    notificationHeader: {
      flexDirection: "row",
      alignItems: "center",

      paddingBottom: 20,
    },

    notificationHeaderIcon: {
      width: 44,
      height: 44,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",
    },

    notificationHeaderContent: {
      flex: 1,
      marginLeft: 12,
    },

    notificationTitle: {
      fontSize: 21,
      fontWeight: "700",
    },

    notificationSubtitle: {
      fontSize: 12,
      marginTop: 3,
    },

    notificationCloseButton: {
      width: 38,
      height: 38,

      borderRadius: 19,

      alignItems: "center",
      justifyContent: "center",
    },

    notificationDivider: {
      height: 1,
      marginBottom: 18,
    },

    notificationActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      marginBottom: 22,
    },

    notificationAction: {
      flexDirection: "row",
      alignItems: "center",

      paddingVertical: 8,
      paddingHorizontal: 10,

      borderRadius: 10,
    },

    notificationActionText: {
      fontSize: 13,
      fontWeight: "700",
      marginLeft: 6,
    },

    notificationSection: {
      marginBottom: 20,
    },

    notificationSectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,

      marginBottom: 10,
    },

    notificationEmpty: {
      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 30,
      marginTop: 100,
    },

    notificationEmptyIcon: {
      width: 82,
      height: 82,

      borderRadius: 41,

      alignItems: "center",
      justifyContent: "center",
    },

    notificationEmptyTitle: {
      fontSize: 17,
      fontWeight: "700",

      marginTop: 18,
    },

    notificationEmptyText: {
      fontSize: 13,
      textAlign: "center",

      marginTop: 7,
      lineHeight: 19,
    },

    notificationBadge: {
      minWidth: 20,
      height: 20,

      borderRadius: 10,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 5,

      marginLeft: 7,
    },

    notificationBadgeText: {
      fontSize: 10,
      fontWeight: "800",
    },

    menuContainer: {
      flex: 1,
      flexDirection: "row",
    },

    menuOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.backgroundDestaque,
    },

    menu: {
      height: "100%",
      elevation: 15,

      shadowColor: colors.text,
      shadowOffset: {
        width: 4,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },

    menuScroll: {
      paddingTop: 20,
      paddingBottom: 25,
    },

    menuHeader: {
      position: "relative",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 5,
      paddingBottom: 22,
    },

    menuCloseButton: {
      position: "absolute",
      right: 16,
      top: 0,

      width: 38,
      height: 38,

      borderRadius: 19,

      alignItems: "center",
      justifyContent: "center",

      zIndex: 10,
    },

    menuLogo: {
      width: 190,
      height: 60,
      resizeMode: "contain",
      marginTop: -10,
      marginBottom: 15,
    },

    menuUserInfo: {
      alignItems: "center",
      marginTop: 2,
    },

    menuUserName: {
      fontSize: 18,
      fontWeight: "700",
    },

    menuUserRole: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    menuUserRoleText: {
      fontSize: 13,
      marginLeft: 5,
      fontWeight: "500",
    },

    menuDivider: {
      height: 1,
      marginHorizontal: 20,
    },

    menuSection: {
      marginTop: 23,
      paddingHorizontal: 14,
    },

    menuSectionTitle: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.1,

      marginLeft: 8,
      marginBottom: 8,
    },

    menuItem: {
      minHeight: 56,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 7,
      paddingVertical: 5,

      borderRadius: 12,
    },

    menuIcon: {
      width: 40,
      height: 40,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",
    },

    menuItemContent: {
      flex: 1,
      marginLeft: 13,
    },

    menuItemText: {
      fontSize: 15,
      fontWeight: "600",
    },

    menuItemSubtitle: {
      fontSize: 12,
      marginTop: 2,
    },

    menuFooter: {
      marginTop: 24,
      alignItems: "center",
      paddingHorizontal: 20,
    },

    menuFooterDivider: {
      width: "100%",
      height: 1,
      marginBottom: 16,
    },

    menuFooterText: {
      fontSize: 12,
      fontWeight: "600",
    },

    menuVersionText: {
      fontSize: 11,
      marginTop: 3,
      opacity: 0.7,
    },

    /*FILTROS*/
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "flex-end",
    },

    modal: {
      width: "100%",
      maxHeight: "92%",
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden",
    },

    header: {
      minHeight: 65,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.borderNull,
    },

    headerTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    counter: {
      minWidth: 24,
      height: 24,
      paddingHorizontal: 7,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },

    counterText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "700",
    },

    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      flexGrow: 0,
    },

    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 25,
    },

    sectionContent: {
      gap: 7,
    },

    option: {
      minHeight: 46,
      paddingHorizontal: 13,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: "transparent",
    },

    optionSelected: {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },

    radio: {
      width: 21,
      height: 21,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: colors.borderNull,
      alignItems: "center",
      justifyContent: "center",
    },

    radioSelected: {
      borderColor: colors.primary,
    },

    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },

    optionText: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
    },

    optionTextSelected: {
      fontWeight: "600",
    },

    customDateContainer: {
      marginTop: 10,
      gap: 12,
      paddingLeft: 34,
    },

    dateInputContainer: {
      gap: 6,
    },

    inputLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },

    input: {
      height: 46,
      borderWidth: 1,
      borderColor: colors.borderNull,
      borderRadius: 10,
      paddingHorizontal: 12,
      color: colors.text,
      backgroundColor: colors.card,
    },

    selectContainer: {
      marginTop: 6,
      gap: 6,
    },

    selectButton: {
      minHeight: 46,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.borderNull,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    selectButtonText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      marginRight: 10,
    },

    selectOptions: {
      borderWidth: 1,
      borderColor: colors.borderNull,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: colors.card,
    },

    selectOption: {
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderNull,
    },

    selectOptionText: {
      color: colors.text,
      fontSize: 14,
    },

    emptyOption: {
      padding: 14,
      color: colors.textSecondary,
      fontSize: 14,
    },

    rangeContainer: {
      paddingTop: 4,
    },

    rangeValues: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
    },

    rangeValueBox: {
      flex: 1,
      gap: 6,
    },

    rangeLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },

    rangeInput: {
      height: 45,
      borderWidth: 1,
      borderColor: colors.borderNull,
      borderRadius: 10,
      paddingHorizontal: 10,
      color: colors.text,
    },

    rangeSeparator: {
      color: colors.textSecondary,
      fontSize: 13,
      paddingBottom: 13,
    },

    rangeHint: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 10,
    },

    footer: {
      minHeight: 75,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderNull,
    },

    clearButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderNull,
      alignItems: "center",
      justifyContent: "center",
    },

    clearButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },

    applyButton: {
      flex: 1.5,
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    applyButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "700",
    },

    twoColumnRow: {
      flexDirection: "row",
      gap: 10,
    },

    twoColumnItem: {
      flex: 1,
      minWidth: 0,
    },

    /* ==========================================================
       NOVO: CHIPS DE FILTRO ATIVO (usado em Clientes/Orçamentos/Obras)
       Substitui os estilos inline que existiam direto nas telas,
       reduzindo alocação de objetos a cada render.
    ========================================================== */

    headerActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    filterCountBadge: {
      position: "absolute",
      right: -4,
      top: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 999,
      paddingHorizontal: 4,
      backgroundColor: colors.danger,
      alignItems: "center",
      justifyContent: "center",
    },

    filterCountBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "700",
    },

    filterActiveWrapRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      marginBottom: 4,
    },

    filterActiveScrollContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingTop: 12,
      paddingBottom: 4,
      paddingRight: 8,
    },

    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },

    filterChipText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "600",
    },

    clearFilterButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },

    clearFilterButtonText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },

    listLoadingState: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 40,
      paddingBottom: 40,
    },

    listLoadingText: {
      color: colors.text,
      marginTop: 15,
    },
  });
}

export const globalStyles = createGlobalStyles(COLORS);

/* =========================
   VARIÁVEIS GLOBAIS
========================= */

export const APP_CONFIG = {
  tabBarActiveColor: COLORS.primary,
};
