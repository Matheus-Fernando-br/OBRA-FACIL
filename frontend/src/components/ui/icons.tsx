import { Ionicons } from "@expo/vector-icons";

/*
 * Família única de ícones do app: Ionicons (traço no estilo iOS).
 * Estes componentes mantêm a API usada no fluxo de login/cadastro
 * (<Eye size color />) e renderizam o glifo equivalente.
 */

type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
  size?: number;
  color?: string;
  /** Mantido por compatibilidade; o peso vem do próprio glifo. */
  strokeWidth?: number;
}

function make(name: IconName) {
  function Icon({ size = 20, color }: IconProps) {
    return <Ionicons name={name} size={size} color={color} />;
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}

export const Eye = make("eye-outline");
export const EyeOff = make("eye-off-outline");
export const Fingerprint = make("finger-print");
export const ShieldCheck = make("shield-checkmark-outline");
export const Check = make("checkmark");
export const MailCheck = make("mail-open-outline");
export const Mail = make("mail-outline");
export const CreditCard = make("card-outline");
export const UserRound = make("person-outline");
