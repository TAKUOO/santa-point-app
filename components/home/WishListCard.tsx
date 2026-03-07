import { StyleSheet, Text, View } from "react-native";

type Props = {
  items: string[];
};

export function WishListCard({ items }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎁</Text>
        <Text style={styles.title}>お願いしたもの</Text>
      </View>

      {items.map((item, index) => (
        <View
          key={`${item}_${index}`}
          style={[styles.row, index < items.length - 1 ? styles.rowBorder : null]}
        >
          <Text style={styles.item}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    bottom: 106,
    left: 14,
    right: 14,
    backgroundColor: "#00000050",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerEmoji: {
    fontSize: 16,
  },
  title: {
    color: "#FFFFFFDD",
    fontSize: 12,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  row: {
    paddingVertical: 8,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF10",
  },
  item: {
    color: "#FFFFFFCC",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
