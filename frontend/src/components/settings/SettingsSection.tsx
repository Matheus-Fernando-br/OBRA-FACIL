import { Children, Fragment, ReactNode, isValidElement } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { SettingsItem } from "./SettingsItem";

interface Props {
  title: string;
  footer?: string;
  children?: ReactNode;
}

/**
 * Lista agrupada (estilo Ajustes do iOS): título discreto, itens num
 * único bloco com separadores finos. Conteúdo livre (botões, textos)
 * recebe recuo interno.
 */
export function SettingsSection({ title, footer, children }: Props) {
  const { styles } = useTheme();
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.subtitle}>{title}</Text>

      <View style={[styles.groupedList, { marginBottom: footer ? 6 : 20 }]}>
        {items.map((child, index) => {
          const isRow = isValidElement(child) && child.type === SettingsItem;
          return (
            <Fragment key={index}>
              {index > 0 && <View style={styles.menuCardDivider} />}
              {isRow ? child : <View style={{ padding: 16 }}>{child}</View>}
            </Fragment>
          );
        })}
      </View>

      {footer ? (
        <Text style={[styles.caption, { marginHorizontal: 16, marginBottom: 20 }]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}
