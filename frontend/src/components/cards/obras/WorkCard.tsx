import { View, Text, Image } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  title: string;
  progress: number;
  type: string;
  diasReal: number;
}

export function WorkCard({ title, progress, type, diasReal }: Props) {
  const { styles } = useTheme();

  return (
    <View style={styles.workCard}>
      <Image
        source={require("../../../assets/images/house.jpg")}
        style={styles.workCardImage}
      />

      <View style={styles.workCardContent}>
        <Text style={styles.workCardTitle}>{title}</Text>

        <Text style={styles.workCardInfo}>Status: {type}</Text>
        <Text style={styles.workCardInfo}>
          Previsão de tempo para finalização: {diasReal} dias
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.workCardProgress}>{progress}%</Text>
        </View>
      </View>
    </View>
  );
}
