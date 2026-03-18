import { StyleSheet, Text, View } from "react-native";
import { EmojiIcon } from "../common/EmojiIcon";
import { getCurrentRank } from "../../constants/ranks";

type Props = {
  daysUntilChristmas: number;
  rankCount: number;
  pointsThisYear: number;
  inline?: boolean;
};

export function StatsBadges({
  daysUntilChristmas,
  rankCount,
  pointsThisYear,
  inline,
}: Props) {
  const currentRank = getCurrentRank(rankCount);

  return (
    <View style={[styles.statusBlock, inline && styles.statusBlockInline]}>
      <View style={styles.statusColumn}>
        <View style={styles.numberRow}>
          <Text style={styles.value}>{daysUntilChristmas}</Text>
          <Text style={styles.unit}>日</Text>
        </View>
        <View style={styles.labelRow}>
          <EmojiIcon name="christmasTree" size={12} style={styles.labelIcon} />
          <Text style={styles.labelText}>まで</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.statusColumn}>
        <View style={styles.numberRow}>
          <Text style={styles.value}>{pointsThisYear}</Text>
          <Text style={styles.unit}>pt</Text>
        </View>
        <View style={styles.labelRow}>
          <EmojiIcon name="coin" size={12} style={styles.labelIcon} />
          <Text style={styles.labelText}>ポイント</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.statusColumn}>
        <View style={styles.rankRow}>
          <Text style={styles.rankName}>{currentRank.name}</Text>
        </View>
        <View style={styles.labelRow}>
          <EmojiIcon name="santa" size={12} style={styles.labelIcon} />
          <Text style={styles.labelText}>ランク</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBlock: {
    position: "absolute",
    top: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 12,
  },
  statusBlockInline: {
    position: "relative",
    top: undefined,
    left: undefined,
    right: undefined,
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
    minHeight: 44,
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  rankName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  labelIcon: {
    opacity: 0.72,
  },
  labelText: {
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
