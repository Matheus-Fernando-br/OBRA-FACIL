import { View, Text, Image } from "react-native";

import { globalStyles } from "@/styles/globalStyles";

interface Props {
  title: string;
  progress: number;
  type: string;
  diasReal: number;
}

export function WorkCard({ title, progress, type, diasReal }: Props) {
  return (
    <View style={globalStyles.workCard}>
      <Image
        source={require("../../../assets/images/house.jpg")}
        style={globalStyles.workCardImage}
      />

      <View style={globalStyles.workCardContent}>
        <Text style={globalStyles.workCardTitle}>{title}</Text>

        <Text style={globalStyles.workCardInfo}>Status: {type}</Text>
        <Text style={globalStyles.workCardInfo}>
          Previsão de tempo para finalização: {diasReal} dias
        </Text>

        <View style={globalStyles.progressContainer}>
          <View style={globalStyles.progressBarBackground}>
            <View
              style={[
                globalStyles.progressBarFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text style={globalStyles.workCardProgress}>{progress}%</Text>
        </View>
      </View>
    </View>
  );
}
