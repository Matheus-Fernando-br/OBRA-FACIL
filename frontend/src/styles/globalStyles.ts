import { Platform, StyleSheet, TextStyle, ViewStyle } from "react-native";

/* ==========================================================
   DESIGN TOKENS — OBRA FÁCIL

   Paleta inspirada nos materiais do ecossistema Apple: fundos
   agrupados neutros, superfícies brancas, tipografia do sistema
   (San Francisco no iOS, Roboto no Android) e um único acento de
   marca (o laranja do logotipo).

   As cores de status foram validadas para daltonismo (CVD) e
   contraste em modo claro e escuro.
========================================================== */

export const COLORS = {
  /* Acento de marca */
  primary: "#C2570C",
  title: "#C2570C",
  titleBackground: "rgba(194, 87, 12, 0.12)",
  accentGradientEnd: "#E58A3A",
  onAccent: "#FFFFFF",

  secondary: "#0D6B75",
  info: "#0A72D6",

  /* Fundos e superfícies */
  background: "#F2F2F7",
  gradientStart: "#F7F7FA",
  gradientEnd: "#EEEEF3",
  white: "#FFFFFF", // superfície principal (cards, folhas, barras)
  surfaceMuted: "#F2F2F7",
  card: "#FFFFFF",
  cardHover: "#1C1C1E",
  backgroundDestaque: "rgba(0, 0, 0, 0.35)",

  /* Texto */
  text: "#1C1C1E",
  textSecondary: "#6C6C70",
  placeholder: "#A1A1A6",

  /* Linhas */
  border: "#E5E5EA",
  borderNull: "#D1D1D6",
  separator: "rgba(60, 60, 67, 0.12)",

  /* Status (validados p/ CVD) */
  success: "#13876F",
  warning: "#C98208",
  danger: "#D43C5C",

  shadow: "#000000",

  tabBarHeight: 64,
};

export type ThemeColors = typeof COLORS;

export const DARK_COLORS: ThemeColors = {
  ...COLORS,

  primary: "#F08A3C",
  title: "#F08A3C",
  titleBackground: "rgba(240, 138, 60, 0.16)",
  accentGradientEnd: "#B8500B",
  info: "#3D9BFF",

  background: "#000000",
  gradientStart: "#000000",
  gradientEnd: "#0B0B0E",
  white: "#1C1C1E",
  surfaceMuted: "#2C2C2E",
  card: "#1C1C1E",
  cardHover: "#2C2C2E",
  backgroundDestaque: "rgba(0, 0, 0, 0.6)",

  text: "#F5F5F7",
  textSecondary: "#A1A1A6",
  placeholder: "#6E6E73",

  border: "#38383A",
  borderNull: "#48484A",
  separator: "rgba(84, 84, 88, 0.45)",

  success: "#209A80",
  warning: "#B38A12",
  danger: "#E25C78",
};

/* ==========================================================
   TIPOGRAFIA — escala única para todo o app
   (fonte do sistema; pesos e tamanhos na hierarquia da Apple)
========================================================== */

export const TYPE = {
  largeTitle: { fontSize: 32, fontWeight: "700", letterSpacing: 0.2 },
  title1: { fontSize: 26, fontWeight: "700", letterSpacing: 0.2 },
  title2: { fontSize: 22, fontWeight: "700", letterSpacing: 0.1 },
  title3: { fontSize: 19, fontWeight: "600", letterSpacing: 0 },
  headline: { fontSize: 16, fontWeight: "600", letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: "400", letterSpacing: -0.2 },
  callout: { fontSize: 15, fontWeight: "400", letterSpacing: -0.1 },
  subhead: { fontSize: 14, fontWeight: "400", letterSpacing: -0.1 },
  footnote: { fontSize: 13, fontWeight: "400", letterSpacing: 0 },
  caption: { fontSize: 12, fontWeight: "500", letterSpacing: 0 },
  overline: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
} satisfies Record<string, TextStyle>;

export const NUMERIC: TextStyle = { fontVariant: ["tabular-nums"] };

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
};

export function elevation(level: 1 | 2 | 3, color = "#000"): ViewStyle {
  const map = {
    1: { opacity: 0.05, radius: 8, y: 2, elevation: 1 },
    2: { opacity: 0.08, radius: 16, y: 6, elevation: 3 },
    3: { opacity: 0.14, radius: 28, y: 12, elevation: 8 },
  }[level];

  return {
    shadowColor: color,
    shadowOpacity: map.opacity,
    shadowRadius: map.radius,
    shadowOffset: { width: 0, height: map.y },
    elevation: map.elevation,
  };
}

/** Cor com transparência a partir de um hex (#RRGGBB). */
export function withAlpha(hex: string, alpha: number) {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

const isIOS = Platform.OS === "ios";

export function createGlobalStyles(colors: ThemeColors) {
  return StyleSheet.create({
    /* ==========================================================
       AUTENTICAÇÃO E CADASTRO
       Estilos compartilhados das telas de login, cadastro e splash.
    ========================================================== */

    loginContainer: {
      flex: 1,
      backgroundColor: colors.gradientStart,
    },

    authSplash: {
      flex: 1,
      backgroundColor: colors.gradientStart,
      alignItems: "center",
      justifyContent: "center",
    },

    authSplashMark: {
      width: 100,
      height: 100,
      borderRadius: 31,
      backgroundColor: colors.titleBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },

    authSplashLogo: {
      width: 76,
      height: 76,
      resizeMode: "contain",
    },

    authSplashTitle: {
      color: colors.title,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 2,
    },

    authSplashSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 7,
    },

    authSplashLoader: {
      marginTop: 28,
    },

    loginSafeArea: { flex: 1 },
    loginKeyboard: { flex: 1 },
    loginContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 30,
    },

    loginBrandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 22,
    },

    loginBrandBadge: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    loginBrandLogo: { width: 80, height: 80, resizeMode: "contain" },
    loginBrandName: {
      color: colors.title,
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 1.4,
    },
    loginBrandCaption: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 3,
    },
    loginHeadingBlock: { marginBottom: 26 },
    loginEyebrow: {
      color: colors.title,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.3,
      marginBottom: 10,
    },
    loginTitle: {
      color: colors.text,
      fontSize: 30,
      fontWeight: "800",
      letterSpacing: -0.7,
      marginBottom: 10,
    },
    loginDescription: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
      maxWidth: 320,
    },
    authFormCard: {
      backgroundColor: colors.white,
      borderRadius: 24,
      padding: 20,
      shadowColor: colors.text,
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    authFieldBlock: { marginBottom: 5 },
    authLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    authLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },
    authForgot: {
      color: colors.title,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 8,
    },
    authInput: {
      minHeight: 54,
      borderRadius: 14,
      marginBottom: 14,
      backgroundColor: colors.white,
      shadowOpacity: 0,
      elevation: 0,
      paddingHorizontal: 16,
    },
    appInput: {
      width: "100%",
      minHeight: 50,
      ...TYPE.body,
      borderWidth: 1,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACE.lg,
      paddingVertical: 13,
      marginBottom: SPACE.md,
    },
    authPasswordWrap: { position: "relative" },
    authPasswordInput: { paddingRight: 50 },
    authEyeButton: { position: "absolute", right: 14, top: 15, padding: 3 },
    authFeedback: {
      color: colors.danger,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
      marginTop: 2,
      marginBottom: 10,
    },
    authPrimaryButton: {
      height: 54,
      borderRadius: 15,
      backgroundColor: colors.title,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 6,
    },
    authPrimaryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "800",
    },
    authBiometricButton: {
      height: 50,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.titleBackground,
      flexDirection: "row",
      gap: 9,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 11,
      backgroundColor: colors.white,
    },
    authBiometricText: { color: colors.title, fontSize: 14, fontWeight: "700" },
    authSecurityNote: {
      flexDirection: "row",
      gap: 6,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 17,
    },
    authSecurityText: { color: colors.textSecondary, fontSize: 11 },
    authRegisterRow: {
      flexDirection: "row",
      gap: 5,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
    },
    authRegisterText: { color: colors.textSecondary, fontSize: 13 },
    authRegisterLink: { color: colors.title, fontSize: 13, fontWeight: "800" },
    authPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
    authDisabled: { opacity: 0.6 },

    loginSuccessTransition: {
      ...StyleSheet.absoluteFill,
      zIndex: 20,
      alignItems: "center",
    },
    loginSuccessWhite: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.white,
    },
    loginSuccessLogoWrap: {
      position: "absolute",
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: colors.titleBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    loginSuccessLogo: { width: 36, height: 36, resizeMode: "contain" },
    loginSuccessMessage: {
      position: "absolute",
      top: "50%",
      marginTop: 48,
      color: colors.title,
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 0.2,
      textAlign: "center",
      paddingHorizontal: 28,
    },
    loginSuccessSubmessage: {
      position: "absolute",
      top: "50%",
      marginTop: 100,
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "center",
      paddingHorizontal: 36,
    },

    cadastroScreen: { flex: 1 },
    cadastroContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 34,
    },
    cadastroHeader: { marginBottom: 22 },
    cadastroKicker: {
      color: colors.title,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.2,
      marginBottom: 7,
    },
    cadastroTitle: {
      color: colors.text,
      fontSize: 29,
      fontWeight: "800",
      letterSpacing: -0.6,
      marginBottom: 8,
    },
    cadastroSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    cadastroStepTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 6,
    },
    cadastroStepSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 12,
    },
    cadastroCard: {
      backgroundColor: colors.white,
      borderRadius: 24,
      padding: 20,
      shadowColor: colors.text,
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    cadastroField: { marginBottom: 2 },
    cadastroLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
      marginTop: 10,
    },
    cadastroInput: {
      minHeight: 54,
      borderRadius: 14,
      backgroundColor: colors.white,
      shadowOpacity: 0,
      elevation: 0,
      paddingHorizontal: 16,
      marginBottom: 6,
    },
    cadastroDocumentToggle: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
    },
    cadastroDocumentButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    cadastroDocumentButtonActive: {
      backgroundColor: colors.title,
      borderColor: colors.title,
    },
    cadastroDocumentButtonText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
    },
    cadastroDocumentButtonTextActive: { color: colors.white },
    cadastroPasswordWrap: { position: "relative" },
    cadastroPasswordInput: { paddingRight: 52 },
    cadastroEyeButton: { position: "absolute", right: 14, top: 15, padding: 3 },
    cadastroFeedback: {
      color: colors.danger,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
      marginTop: 8,
      marginBottom: 4,
    },
    appButton: {
      width: "100%",
      minHeight: 52,
      marginTop: 10,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 18,
    },
    appButtonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
    cadastroSecondaryButton: {
      backgroundColor: colors.cardHover,
    },
    cadastroBackButton: {
      marginTop: 10,
      minHeight: 48,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    cadastroBackButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    emailIconWrap: {
      width: 66,
      height: 66,
      borderRadius: 22,
      backgroundColor: colors.titleBackground,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 18,
    },
    emailCard: {
      backgroundColor: colors.titleBackground,
      borderRadius: 15,
      padding: 15,
      marginBottom: 18,
      alignItems: "center",
    },
    emailCardText: { color: colors.title, fontSize: 15, fontWeight: "700" },
    emailCodeInput: {
      textAlign: "center",
      letterSpacing: 8,
      fontSize: 22,
      fontWeight: "800",
    },
    cadastroSecondaryOutlineButton: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cadastroSecondaryOutlineButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    planCard: {
      backgroundColor: colors.cardHover,
      borderRadius: 20,
      padding: 20,
      marginTop: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.titleBackground,
    },
    planTitle: {
      color: colors.white,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 14,
    },
    planFeature: { color: colors.textSecondary, fontSize: 13, marginTop: 9 },
    planPrice: {
      color: colors.success,
      fontSize: 24,
      fontWeight: "800",
      marginTop: 20,
    },
    successWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 34,
    },
    successBadge: {
      width: 98,
      height: 98,
      borderRadius: 32,
      backgroundColor: colors.titleBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    successTitle: {
      color: colors.text,
      fontSize: 26,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 10,
    },
    successText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
    },
    successHint: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 24,
      textAlign: "center",
    },
    successSecurityIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.titleBackground,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 22,
    },
    successAction: {
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 6,
    },
    successActionText: {
      color: colors.title,
      fontSize: 13,
      fontWeight: "800",
    },
    cadastroFooterHint: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: "center",
      marginTop: 18,
    },

    stepIndicator: { marginBottom: 26 },
    stepIndicatorTrack: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 2,
    },
    stepIndicatorItem: { alignItems: "center" },
    stepIndicatorCircle: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    stepIndicatorCircleActive: {
      backgroundColor: colors.title,
      borderColor: colors.title,
    },
    stepIndicatorCircleDone: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    stepIndicatorLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 6,
    },
    stepIndicatorLineActive: { backgroundColor: colors.success },
    stepIndicatorLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 9,
    },
    stepIndicatorLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "700",
      textAlign: "center",
      width: 72,
    },
    stepIndicatorLabelActive: { color: colors.title },


    /* ==========================================================
       LAYOUT BASE
    ========================================================== */

    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: SPACE.lg,
      paddingTop: SPACE.sm,
    },

    pageContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: SPACE.xxl,
    },

    scrollContent: {
      paddingBottom: 140,
    },

    feedback: {
      ...TYPE.footnote,
      color: colors.danger,
      fontWeight: "600",
      marginTop: SPACE.sm,
      marginBottom: SPACE.md,
      textAlign: "center",
    },

    logoHeaderImg: {
      width: 72,
      height: 44,
      resizeMode: "contain",
    },

    obrigatorio: {
      ...TYPE.footnote,
      fontWeight: "700",
      marginLeft: 4,
      color: colors.danger,
    },

    checkbox: {
      marginTop: 2,
      width: 24,
      height: 24,
      borderRadius: 7,
    },

    row: { flexDirection: "row", gap: SPACE.md },
    column: { flex: 1, minWidth: 0 },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      width: "100%",
      marginVertical: SPACE.sm,
    },

    dividerVertical: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      alignSelf: "stretch",
      marginHorizontal: SPACE.md,
    },

    pressOpacity: {
      opacity: 0.6,
    },

    /* ==========================================================
       TIPOGRAFIA
    ========================================================== */

    title: {
      ...TYPE.title2,
      color: colors.text,
    },

    pageTitle: {
      ...TYPE.largeTitle,
      color: colors.text,
      marginTop: SPACE.lg,
      marginBottom: SPACE.lg,
    },

    sectionTitle: {
      ...TYPE.title3,
      color: colors.text,
      marginTop: SPACE.xxl,
      marginBottom: SPACE.md,
    },

    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginTop: SPACE.xxl,
      marginBottom: SPACE.md,
    },

    sectionHeaderTitle: {
      ...TYPE.title3,
      color: colors.text,
    },

    sectionHeaderLink: {
      ...TYPE.subhead,
      fontWeight: "600",
      color: colors.primary,
    },

    subtitle: {
      ...TYPE.overline,
      color: colors.textSecondary,
      marginTop: SPACE.xxl,
      marginBottom: SPACE.xs,
      marginLeft: SPACE.xs,
    },

    body: {
      ...TYPE.body,
      color: colors.text,
    },

    caption: {
      ...TYPE.caption,
      color: colors.textSecondary,
    },

    label: {
      ...TYPE.footnote,
      fontWeight: "600",
      alignSelf: "flex-start",
      color: colors.textSecondary,
      marginBottom: SPACE.sm,
      marginTop: SPACE.md,
    },

    section: {
      marginBottom: SPACE.lg,
    },

    /* ==========================================================
       SUPERFÍCIES
    ========================================================== */

    card: {
      backgroundColor: colors.white,
      borderRadius: RADIUS.lg,
      padding: SPACE.lg,
      marginBottom: SPACE.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    listCard: {
      backgroundColor: colors.white,
      borderRadius: RADIUS.lg,
      padding: SPACE.lg,
      marginBottom: SPACE.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    listCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: SPACE.md,
    },

    listCardTitle: {
      ...TYPE.headline,
      color: colors.text,
    },

    listCardSubtitle: {
      ...TYPE.subhead,
      color: colors.textSecondary,
      marginTop: 2,
    },

    listCardMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: SPACE.md,
      marginTop: SPACE.md,
    },

    listCardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    listCardMetaText: {
      ...TYPE.footnote,
      color: colors.textSecondary,
    },

    listCardValue: {
      ...TYPE.title3,
      ...NUMERIC,
      color: colors.text,
      marginTop: SPACE.md,
    },

    listCardActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACE.sm,
      marginTop: SPACE.lg,
      paddingTop: SPACE.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.separator,
    },

    actionChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 36,
      paddingHorizontal: SPACE.md,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.surfaceMuted,
    },

    actionChipText: {
      ...TYPE.footnote,
      fontWeight: "600",
      color: colors.text,
    },

    iconButton: {
      width: 36,
      height: 36,
      borderRadius: RADIUS.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceMuted,
    },

    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.pill,
    },

    statusPillDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    statusPillText: {
      ...TYPE.caption,
      fontWeight: "700",
    },

    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: SPACE.xxl,
    },

    emptyStateIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.titleBackground,
      marginBottom: SPACE.lg,
    },

    emptyStateTitle: {
      ...TYPE.headline,
      color: colors.text,
      textAlign: "center",
    },

    emptyStateText: {
      ...TYPE.subhead,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: SPACE.xs,
      lineHeight: 20,
    },

    /* ==========================================================
       CAMPOS
    ========================================================== */

    picker: {
      width: "100%",
      minHeight: 50,
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      borderRadius: RADIUS.md,
      borderWidth: 0,
      paddingHorizontal: SPACE.md,
      marginBottom: SPACE.md,
    },

    pickerReadOnly: {
      color: colors.textSecondary,
      opacity: 0.85,
    },

    searchField: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACE.sm,
      minHeight: 44,
      paddingHorizontal: SPACE.md,
      borderRadius: RADIUS.md,
      backgroundColor: isIOS ? "rgba(118, 118, 128, 0.12)" : colors.white,
      borderWidth: isIOS ? 0 : StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      marginBottom: SPACE.md,
    },

    searchInput: {
      flex: 1,
      ...TYPE.body,
      color: colors.text,
      paddingVertical: 10,
    },

    /* ==========================================================
       FORMULÁRIOS (modais em tela cheia)
    ========================================================== */

    formScreen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: SPACE.lg,
    },

    formScroll: {
      flex: 1,
      paddingHorizontal: SPACE.lg,
    },

    serviceCard: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: RADIUS.md,
      padding: SPACE.md,
      marginTop: SPACE.md,
    },

    serviceContainer: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: RADIUS.md,
      padding: SPACE.md,
      marginTop: SPACE.md,
    },

    serviceHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    serviceTotalText: {
      ...TYPE.subhead,
      ...NUMERIC,
      fontWeight: "600",
      color: colors.success,
      marginTop: SPACE.sm,
    },

    addCard: {
      flex: 1,
      maxHeight: "100%",
      backgroundColor: colors.background,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      paddingTop: SPACE.xl,
      paddingBottom: SPACE.xl,
      paddingHorizontal: SPACE.xl,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      minHeight: 52,
      paddingVertical: SPACE.sm,
      marginBottom: SPACE.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },

    addTitle: {
      ...TYPE.headline,
      flex: 1,
      color: colors.text,
      textAlign: "center",
      marginHorizontal: SPACE.sm,
    },

    leftAction: {
      minWidth: 40,
      height: 36,
      borderRadius: RADIUS.pill,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },

    rightAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 36,
      paddingHorizontal: SPACE.md,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.titleBackground,
      zIndex: 1,
    },

    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACE.sm,
      zIndex: 10,
    },

    modalCloseButton: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 18,
    },

    saveTextStack: {
      flexDirection: "column",
      alignItems: "flex-end",
    },

    saveText: {
      ...TYPE.subhead,
      fontWeight: "600",
      color: colors.primary,
    },

    /* ==========================================================
       STATUS (legado — usados por formulários)
    ========================================================== */

    orcamentoStatusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.pill,
    },

    orcamentoStatusText: {
      ...TYPE.caption,
      fontWeight: "700",
    },

    obraStatusBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.pill,
      marginBottom: SPACE.xs,
    },

    obraStatusText: {
      ...TYPE.caption,
      fontWeight: "700",
    },

    orcamentoInfo: {
      ...TYPE.subhead,
      color: colors.textSecondary,
      marginBottom: SPACE.xs,
    },

    /* ==========================================================
       PROGRESSO
    ========================================================== */

    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    progressBarBackground: {
      flex: 1,
      height: 6,
      backgroundColor: colors.surfaceMuted,
      borderRadius: RADIUS.pill,
      overflow: "hidden",
    },

    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: RADIUS.pill,
    },

    workCardProgress: {
      ...TYPE.footnote,
      ...NUMERIC,
      minWidth: 40,
      textAlign: "right",
      marginLeft: SPACE.md,
      fontWeight: "600",
      color: colors.text,
    },

    /* ==========================================================
       CABEÇALHOS
    ========================================================== */

    appHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACE.lg,
      paddingBottom: SPACE.sm,
      backgroundColor: colors.background,
    },

    appHeaderButton: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    appHeaderBadge: {
      position: "absolute",
      top: 8,
      right: 9,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.danger,
      borderWidth: 1.5,
      borderColor: colors.white,
    },

    homeHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: SPACE.sm,
      marginBottom: SPACE.lg,
    },

    pageHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: SPACE.sm,
      marginBottom: SPACE.lg,
      minHeight: 44,
    },

    pageHeaderTitle: {
      ...TYPE.largeTitle,
      color: colors.text,
    },

    pageHeaderSubtitle: {
      ...TYPE.subhead,
      color: colors.textSecondary,
      marginTop: 2,
    },

    pageHeaderActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACE.sm,
      marginLeft: SPACE.lg,
      marginBottom: 4,
    },

    pageHeaderAction: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.pill,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },

    pageHeaderAddButton: {
      backgroundColor: colors.primary,
      ...elevation(2, colors.primary),
    },

    pageHeaderFilterButton: {
      backgroundColor: colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
    },

    pageHeaderFilterActive: {
      backgroundColor: colors.titleBackground,
      borderColor: colors.primary,
    },

    pageHeaderButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.94 }],
    },

    pageHeaderFilterBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },

    pageHeaderFilterBadgeText: {
      color: colors.onAccent,
      fontSize: 10,
      fontWeight: "800",
      ...NUMERIC,
    },

    /* ==========================================================
       DASHBOARD
    ========================================================== */

    dashboardGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACE.md,
    },

    dashboardCard: {
      flexGrow: 1,
      flexBasis: "45%",
      minWidth: 140,
      backgroundColor: colors.white,
      borderRadius: RADIUS.lg,
      padding: SPACE.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    dashboardCardIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SPACE.md,
    },

    dashboardCardValue: {
      ...TYPE.title1,
      ...NUMERIC,
      color: colors.text,
    },

    dashboardCardTitle: {
      ...TYPE.footnote,
      fontWeight: "500",
      color: colors.textSecondary,
      marginTop: 2,
    },

    heroCard: {
      borderRadius: RADIUS.xl,
      padding: SPACE.xl,
      overflow: "hidden",
      ...elevation(3, colors.primary),
    },

    heroLabel: {
      ...TYPE.footnote,
      fontWeight: "600",
      color: "rgba(255,255,255,0.85)",
    },

    heroValue: {
      ...TYPE.largeTitle,
      ...NUMERIC,
      fontSize: 36,
      color: "#FFFFFF",
      marginTop: SPACE.xs,
    },

    heroFooter: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACE.sm,
      marginTop: SPACE.lg,
    },

    heroChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: RADIUS.pill,
      backgroundColor: "rgba(255,255,255,0.18)",
    },

    heroChipText: {
      ...TYPE.caption,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    quickAccessHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    quickAccessRow: {
      flexDirection: "row",
      gap: SPACE.md,
    },

    quickButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: SPACE.md,
      paddingHorizontal: SPACE.xs,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    quickButtonIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    quickButtonText: {
      ...TYPE.caption,
      fontWeight: "600",
      marginTop: SPACE.sm,
      color: colors.text,
      textAlign: "center",
    },

    quickAccessEditButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },

    chartLegendRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACE.lg,
      marginTop: SPACE.md,
    },

    chartLegendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    chartLegendSwatch: {
      width: 10,
      height: 10,
      borderRadius: 3,
    },

    chartLegendText: {
      ...TYPE.footnote,
      ...NUMERIC,
      color: colors.textSecondary,
    },

    chartLegendValue: {
      ...TYPE.footnote,
      ...NUMERIC,
      fontWeight: "700",
      color: colors.text,
    },

    /* ==========================================================
       TELA MAIS / LISTAS AGRUPADAS
    ========================================================== */

    maisContainer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: SPACE.lg,
      paddingTop: SPACE.sm,
    },

    groupedList: {
      backgroundColor: colors.white,
      borderRadius: RADIUS.lg,
      overflow: "hidden",
      marginBottom: SPACE.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
    },

    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      padding: SPACE.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACE.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    profileName: {
      ...TYPE.title3,
      color: colors.text,
    },

    profileEmail: {
      ...TYPE.subhead,
      marginTop: 2,
      color: colors.textSecondary,
    },

    menuCard: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 56,
      paddingHorizontal: SPACE.lg,
      paddingVertical: SPACE.md,
      backgroundColor: colors.white,
    },

    menuCardDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginLeft: 64,
    },

    menuCardIcon: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SPACE.lg,
    },

    menuText: {
      ...TYPE.body,
      color: colors.text,
    },

    menuCardDescription: {
      ...TYPE.footnote,
      color: colors.textSecondary,
      marginTop: 1,
    },

    /* ==========================================================
       BOTÕES
    ========================================================== */

    fabButton: {
      position: "absolute",
      bottom: 100,
      right: SPACE.xxl,
      width: 60,
      height: 60,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      ...elevation(3, colors.primary),
    },

    bottomActionContainer: {
      position: "absolute",
      bottom: SPACE.lg,
      left: SPACE.lg,
      right: SPACE.lg,
    },

    bottomActionButton: {
      height: 54,
      flexDirection: "row",
      gap: SPACE.sm,
      backgroundColor: colors.primary,
      borderRadius: RADIUS.md,
      justifyContent: "center",
      alignItems: "center",
      ...elevation(3, colors.primary),
    },

    bottomActionButtonText: {
      ...TYPE.headline,
      color: colors.onAccent,
    },

    /* ==========================================================
       CLIENTES
    ========================================================== */

    clientCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderRadius: RADIUS.lg,
      padding: SPACE.lg,
      marginBottom: SPACE.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    clientCardName: {
      ...TYPE.headline,
      color: colors.text,
    },

    clientCardInfo: {
      ...TYPE.footnote,
      color: colors.textSecondary,
      marginTop: 2,
    },

    clientIcons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: SPACE.sm,
    },

    /* ==========================================================
       OBRAS (cards da home)
    ========================================================== */

    workCard: {
      backgroundColor: colors.white,
      padding: SPACE.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACE.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(1, colors.shadow),
    },

    workCardTitle: {
      ...TYPE.headline,
      color: colors.text,
    },

    workCardInfo: {
      ...TYPE.footnote,
      color: colors.textSecondary,
      marginTop: 2,
    },

    /* ==========================================================
       PLANOS E ASSINATURA
    ========================================================== */

    planPageContent: {
      paddingBottom: 30,
    },

    planCurrentCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
    },

    planCurrentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },

    planCurrentTitleContainer: {
      flex: 1,
    },

    planCurrentLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 5,
    },

    planCurrentName: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 5,
    },

    planCurrentDescription: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },

    planActiveBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },

    planActiveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginRight: 6,
    },

    planActiveText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
    },

    planCurrentPriceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: 18,
    },

    planCurrentPrice: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },

    planCurrentPeriod: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 4,
    },

    planCurrentInfo: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 18,
      paddingTop: 16,
      gap: 14,
    },

    planCurrentInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    planCurrentInfoLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    },

    planCurrentInfoValue: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },

    planChangeButton: {
      marginTop: 18,
      height: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },

    planChangeButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
    },

    planUsageCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
    },

    planSectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },

    planSectionDescription: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },

    planUsageItem: {
      marginTop: 18,
    },

    planUsageTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 9,
    },

    planUsageTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    planUsageTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },

    planUsageValue: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },

    planUsageValueWarning: {
      color: colors.warning,
    },

    planUsageBarBackground: {
      height: 7,
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: colors.border,
    },

    planUsageBar: {
      height: "100%",
      borderRadius: 10,
    },

    planOptionsHeader: {
      marginBottom: 14,
    },

    planOptionCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
    },

    planOptionCardFeatured: {
      borderColor: colors.primary,
    },

    planRecommendedBadge: {
      flexDirection: "row",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: colors.white,
      marginBottom: 12,
    },

    planRecommendedText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
    },

    planOptionHeader: {
      marginBottom: 14,
    },

    planOptionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },

    planOptionName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },

    planCurrentBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },

    planCurrentBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.textSecondary,
    },

    planOptionDescription: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },

    planOptionPriceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 16,
    },

    planOptionPrice: {
      fontSize: 25,
      fontWeight: "800",
      color: colors.text,
    },

    planOptionPeriod: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },

    planLimits: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 14,
      gap: 10,
    },

    planLimitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    planLimitText: {
      fontSize: 13,
      color: colors.textSecondary,
    },

    planFeatures: {
      marginTop: 16,
      gap: 10,
    },

    planFeatureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },

    planFeatureText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: colors.text,
    },

    planSelectButton: {
      height: 44,
      borderRadius: 11,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 18,
    },

    planSelectButtonCurrent: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },

    planSelectButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.white,
    },

    planSelectButtonTextCurrent: {
      color: colors.textSecondary,
    },

    paymentMethodCard: {
      minHeight: 70,
      paddingHorizontal: 4,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    paymentMethodIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    paymentMethodContent: {
      flex: 1,
    },

    paymentMethodTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 3,
    },

    paymentMethodDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSecondary,
    },

    planCancelButton: {
      minHeight: 70,
      paddingHorizontal: 4,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    planCancelContent: {
      flex: 1,
    },

    planCancelTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.danger,
      marginBottom: 3,
    },

    planCancelDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSecondary,
    },



    /* ==========================================================
       NOTIFICAÇÕES
    ========================================================== */
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


    /* ==========================================================
       MENU LATERAL (SIDEBAR)
    ========================================================== */

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
      backgroundColor: colors.background,
      borderTopRightRadius: RADIUS.xl,
      borderBottomRightRadius: RADIUS.xl,
      overflow: "hidden",
      ...elevation(3, colors.shadow),
    },

    menuScroll: {
      paddingHorizontal: SPACE.md,
      paddingBottom: SPACE.xxl,
    },

    menuHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACE.sm,
      paddingBottom: SPACE.lg,
    },

    menuLogo: {
      width: 120,
      height: 40,
      resizeMode: "contain",
    },

    menuCloseButton: {
      width: 34,
      height: 34,
      borderRadius: RADIUS.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceMuted,
    },

    menuUserCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACE.md,
      padding: SPACE.md,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      marginBottom: SPACE.sm,
    },

    menuUserName: {
      ...TYPE.headline,
      color: colors.text,
    },

    menuUserRoleText: {
      ...TYPE.footnote,
      color: colors.textSecondary,
      marginTop: 1,
    },

    menuSection: {
      marginTop: SPACE.lg,
    },

    menuSectionTitle: {
      ...TYPE.overline,
      color: colors.textSecondary,
      marginLeft: SPACE.md,
      marginBottom: SPACE.xs,
    },

    menuItem: {
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACE.sm,
      paddingVertical: 6,
      borderRadius: RADIUS.md,
      gap: SPACE.md,
    },

    menuItemActive: {
      backgroundColor: colors.titleBackground,
    },

    menuIcon: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white,
    },

    menuItemContent: {
      flex: 1,
    },

    menuItemText: {
      ...TYPE.callout,
      fontWeight: "500",
      color: colors.text,
    },

    menuItemTextActive: {
      color: colors.primary,
      fontWeight: "600",
    },

    menuItemSubtitle: {
      ...TYPE.caption,
      fontWeight: "400",
      color: colors.textSecondary,
      marginTop: 1,
    },

    menuSoonBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.surfaceMuted,
    },

    menuSoonBadgeText: {
      ...TYPE.caption,
      fontSize: 10,
      fontWeight: "700",
      color: colors.textSecondary,
    },

    themeSegment: {
      flexDirection: "row",
      padding: 3,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surfaceMuted,
      marginHorizontal: SPACE.sm,
      marginTop: SPACE.xs,
    },

    themeSegmentItem: {
      flex: 1,
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 34,
      borderRadius: 11,
    },

    themeSegmentItemActive: {
      backgroundColor: colors.white,
      ...elevation(1, colors.shadow),
    },

    themeSegmentText: {
      ...TYPE.footnote,
      fontWeight: "600",
      color: colors.textSecondary,
    },

    themeSegmentTextActive: {
      color: colors.text,
    },

    menuFooter: {
      marginTop: SPACE.xxl,
      alignItems: "center",
    },

    menuFooterText: {
      ...TYPE.caption,
      color: colors.textSecondary,
    },

    menuVersionText: {
      ...TYPE.caption,
      fontWeight: "400",
      marginTop: 2,
      color: colors.placeholder,
    },

    /* ==========================================================
       BARRA DE ABAS
    ========================================================== */

    tabBarWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: SPACE.md,
    },

    tabBar: {
      flexDirection: "row",
      alignItems: "center",
      height: colors.tabBarHeight,
      paddingHorizontal: SPACE.xs,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      ...elevation(3, colors.shadow),
    },

    tabBarItem: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    tabBarIndicator: {
      position: "absolute",
      top: 7,
      bottom: 7,
      left: 4,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.titleBackground,
    },

    tabBarLabel: {
      fontSize: 10.5,
      fontWeight: "600",
      marginTop: 3,
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
