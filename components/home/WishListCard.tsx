import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  items: string[];
  onRemoveItem: (item: string) => void;
};

export function WishListCard({ items, onRemoveItem }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎁</Text>
        <Text style={styles.title}>ほしいもの</Text>
      </View>

      <View style={styles.card}>
        {items.map((item, index) => (
          <View
            key={`${item}_${index}`}
            style={[styles.row, index < items.length - 1 ? styles.rowBorder : null]}
          >
            <Text style={styles.item}>{item}</Text>
            <Pressable
              style={styles.removeButton}
              onPress={() => onRemoveItem(item)}
              hitSlop={8}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 106,
    left: 14,
    right: 14,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  headerEmoji: {
    fontSize: 16,
  },
  title: {
    color: "#FFFFFFDD",
    fontSize: 12,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  card: {
    backgroundColor: "#00000050",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF10",
  },
  item: {
    flex: 1,
    color: "#FFFFFFCC",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  removeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF12",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#FFFFFFAA",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 16,
  },
});
