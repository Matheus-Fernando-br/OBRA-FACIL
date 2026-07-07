import { View, Text, Image } from "react-native";

import { globalStyles } from "../../styles/globalStyles";

interface Props {
  title: string;
  progress: number;
  type: string;
  meters: number;
}

export function WorkCard({ title, progress, type, meters }: Props) {
  return (
    <View style={globalStyles.workCard}>
      <Image
        source={require("../../assets/images/house.jpg")}
        style={globalStyles.workCardImage}
      />

      <View style={globalStyles.workCardContent}>
        <Text style={globalStyles.workCardTitle}>{title}</Text>

        <Text style={globalStyles.workCardInfo}>
          {type} • {meters}m²
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
