import { Pressable, StyleSheet, Text, View } from "react-native";
import { EmojiIcon } from "../common/EmojiIcon";

type Props = {
  top?: number;
  bottomOffset?: number;
  inline?: boolean;
  items: string[];
  onRemoveItem: (item: string) => void;
};

export function WishListCard({ top, bottomOffset = 106, inline, items, onRemoveItem }: Props) {
  const positionStyle =
    inline ? undefined : (top !== undefined ? { top } : { bottom: bottomOffset });
  const containerStyle = [
    styles.container,
    inline && styles.containerInline,
    positionStyle,
  ];
  return (
    <View style={containerStyle}>
      <View style={styles.header}>
        <EmojiIcon name="gift" size={16} />
        <Text style={styles.title}>ほしいもの</Text>
      </View>

      <View style={styles.card}>
        {items.length === 0 ? (
          <Text style={styles.emptyMessage}>サンタさんに欲しいものをお願いしよう！</Text>
        ) : (
          items.map((item, index) => (
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
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 14,
    right: 14,
    gap: 6,
  },
  containerInline: {
    position: "relative",
    left: undefined,
    right: undefined,
    marginHorizontal: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  title: {
    color: "#FFFFFFDD",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  card: {
    backgroundColor: "#00000050",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyMessage: {
    color: "#FFFFFF88",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF10",
  },
  item: {
    flex: 1,
    color: "#FFFFFFCC",
    fontSize: 15,
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
