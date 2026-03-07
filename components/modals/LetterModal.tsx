import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Child } from "../../types";

type Props = {
  child: Child;
  visible: boolean;
  onClose: () => void;
  onMarkRead: (letterId: string) => void;
};

export function LetterModal({ child, visible, onClose, onMarkRead }: Props) {
  const [expandedLetterId, setExpandedLetterId] = useState<string | null>(null);

  const sortedLetters = useMemo(
    () =>
      [...child.letters].sort(
        (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
      ),
    [child.letters],
  );

  useEffect(() => {
    if (visible) {
      setExpandedLetterId((currentExpandedLetterId) =>
        currentExpandedLetterId &&
        sortedLetters.some((letter) => letter.id === currentExpandedLetterId)
          ? currentExpandedLetterId
          : null,
      );
    }
  }, [sortedLetters, visible]);

  const latestLetter = sortedLetters[0];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTapArea} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>サンタからのおてがみ</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll}>
            {latestLetter ? (
              <>
                <Pressable
                  style={styles.mainCard}
                  onPress={() => onMarkRead(latestLetter.id)}
                >
                  <Text style={styles.snowflakePrimary}>❄︎</Text>
                  <Text style={styles.snowflakeSecondary}>❄︎</Text>
                  <Text style={styles.snowflakeTertiary}>✦</Text>
                  <View style={styles.mainCardHeader}>
                    <View style={styles.mainCardHeaderSpacer} />
                    <Text style={styles.dateText}>
                      {new Date(latestLetter.date).toLocaleDateString("ja-JP", {
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text style={styles.mainTitle}>{latestLetter.title}</Text>
                  <Text style={styles.mainBody}>{latestLetter.body}</Text>
                  <Text style={styles.mainSign}>サンタクロースより</Text>
                </Pressable>

                {sortedLetters.length > 1 ? (
                  <>
                    <Text style={styles.historyLabel}>これまでのおてがみ</Text>
                    {sortedLetters
                      .filter((letter) => letter.id !== latestLetter.id)
                      .map((letter) => (
                      <Pressable
                        key={letter.id}
                        style={styles.historyCard}
                        onPress={() => {
                          setExpandedLetterId((currentExpandedLetterId) =>
                            currentExpandedLetterId === letter.id ? null : letter.id,
                          );
                          onMarkRead(letter.id);
                        }}
                      >
                        <View style={styles.historyHeader}>
                          <View style={styles.historyTextBlock}>
                            <Text style={styles.historyTitle}>{letter.title}</Text>
                            <Text style={styles.historyDate}>
                              {new Date(letter.date).toLocaleDateString("ja-JP")}
                            </Text>
                          </View>
                          <MaterialIcons
                            name={expandedLetterId === letter.id ? "expand-less" : "expand-more"}
                            size={20}
                            color="#FFFFFF88"
                          />
                        </View>
                        {expandedLetterId === letter.id ? (
                          <Text style={styles.historyBody}>{letter.body}</Text>
                        ) : (
                          <Text style={styles.historyPreview} numberOfLines={1}>
                            {letter.body}
                          </Text>
                        )}
                      </Pressable>
                      ))}
                  </>
                ) : null}
              </>
            ) : (
              <Text style={styles.emptyText}>まだおてがみはないよ</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  backdropTapArea: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    height: "93%",
    backgroundColor: "#1A0F2E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#FFFFFF18",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF15",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  scroll: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  mainCard: {
    backgroundColor: "#2A2460",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFFFFF14",
  },
  snowflakePrimary: {
    position: "absolute",
    top: 18,
    right: 22,
    fontSize: 42,
    color: "#FFFFFF14",
  },
  snowflakeSecondary: {
    position: "absolute",
    bottom: 20,
    left: 18,
    fontSize: 32,
    color: "#FFFFFF12",
  },
  snowflakeTertiary: {
    position: "absolute",
    top: 62,
    left: 28,
    fontSize: 18,
    color: "#FFFFFF10",
  },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainCardHeaderSpacer: {
    flex: 1,
  },
  dateText: {
    color: "#FFFFFFAA",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  mainBody: {
    color: "#FFFFFFE5",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  mainSign: {
    color: "#FFFFFFCC",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  historyLabel: {
    color: "#FFFFFFAA",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: "#FFFFFF15",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  historyTextBlock: {
    flex: 1,
    gap: 4,
  },
  historyTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  historyPreview: {
    color: "#FFFFFFAA",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  historyDate: {
    color: "#FFFFFF55",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  historyBody: {
    color: "#FFFFFFCC",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  emptyText: {
    color: "#FFFFFF66",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    paddingVertical: 24,
  },
});
