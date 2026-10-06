import { Fragment } from "react";
import { Text, View } from "react-native";
import { Check, CreditCard, Mail, UserRound } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  step: number;
}

const steps = [
  { label: "Dados", icon: UserRound },
  { label: "E-mail", icon: Mail },
  { label: "Plano", icon: CreditCard },
  { label: "Finalizado", icon: Check },
];

export function StepIndicator({ step }: Props) {
  const { styles, theme } = useTheme();

  return (
    <View style={styles.stepIndicator}>
      <View style={styles.stepIndicatorTrack}>
        {steps.map((item, index) => {
          const itemStep = index + 1;
          const isDone = step > itemStep;
          const isActive = step === itemStep;
          const Icon = item.icon;

          return (
            <Fragment key={item.label}>
              <View style={styles.stepIndicatorItem}>
                <View
                  style={[
                    styles.stepIndicatorCircle,
                    isActive && styles.stepIndicatorCircleActive,
                    isDone && styles.stepIndicatorCircleDone,
                  ]}
                >
                  <Icon
                    size={18}
                    color={
                      isActive || isDone ? theme.white : theme.textSecondary
                    }
                    strokeWidth={2.5}
                  />
                </View>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepIndicatorLine,
                    step > itemStep && styles.stepIndicatorLineActive,
                  ]}
                />
              )}
            </Fragment>
          );
        })}
      </View>
      <View style={styles.stepIndicatorLabels}>
        {steps.map((item, index) => (
          <Text
            key={`${item.label}-label`}
            style={[
              styles.stepIndicatorLabel,
              step >= index + 1 && styles.stepIndicatorLabelActive,
            ]}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
