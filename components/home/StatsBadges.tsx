import { StyleSheet, Text, View } from "react-native";
import { getCurrentMedalRank } from "../../constants/medals";

type Props = {
  daysUntilChristmas: number;
  medalCount: number;
  pointsThisYear: number;
};

export function StatsBadges({
  daysUntilChristmas,
  medalCount,
  pointsThisYear,
}: Props) {
  const currentRank = getCurrentMedalRank(medalCount);

  return (
    <View style={styles.statusBlock}>
      <View style={styles.statusColumn}>
        <View style={styles.numberRow}>
          <Text style={styles.value}>{daysUntilChristmas}</Text>
          <Text style={styles.unit}>日</Text>
        </View>
        <Text style={styles.label}>🎄まで</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.statusColumn}>
        <View style={styles.numberRow}>
          <Text style={styles.value}>{pointsThisYear}</Text>
          <Text style={styles.unit}>pt</Text>
        </View>
        <Text style={styles.label}>🪙ポイント</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.statusColumn}>
        <View style={styles.rankRow}>
          <Text style={styles.rankIcon}>{currentRank.icon}</Text>
          <Text style={styles.rankName}>{currentRank.name}</Text>
        </View>
        <Text style={styles.label}>🎅ランク</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBlock: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 12,
  },
  statusColumn: {
    alignItems: "center",
    minWidth: 88,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  unit: {
    color: "#FFFFFF88",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  rankIcon: {
    fontSize: 24,
  },
  rankName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  label: {
    color: "#FFFFFF55",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  separator: {
    width: 1,
    height: 52,
    backgroundColor: "#FFFFFF15",
  },
});
