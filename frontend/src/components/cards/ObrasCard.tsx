  import { View, Text, Image } from "react-native";

  import { globalStyles } from "../../styles/globalStyles";

  interface Props {
    title: string;

    status: string;

    progress: number;

    type: string;

    meters: number;

    client: string;

    startDate?: string;
  }

  export function ObrasCard({
    title,
    status,
    progress,
    type,
    meters,
    client,
    startDate,
  }: Props) {
    return (
      <View style={globalStyles.workCard}>
        <Image
          source={require("../../assets/images/house.jpg")}
          style={globalStyles.workCardImage}
        />

        <View style={globalStyles.workCardBody}>
          <View style={globalStyles.workCardHeader}>
            <Text numberOfLines={1} style={globalStyles.workCardTitle}>
              {title}
            </Text>

            <View style={globalStyles.workStatusBadge}>
              <Text style={globalStyles.workStatusText}>{status}</Text>
            </View>
          </View>

          <Text style={globalStyles.workCardSubtitle}>
            {type} • {meters} m²
          </Text>

          <Text style={globalStyles.workCardSubtitle}>Cliente: {client}</Text>

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

          {startDate && (
            <Text style={globalStyles.workCardDate}>Início: {startDate}</Text>
          )}
        </View>
      </View>
    );
  }
