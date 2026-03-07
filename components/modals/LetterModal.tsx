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
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

  const sortedLetters = useMemo(
    () =>
      [...child.letters].sort(
        (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
      ),
    [child.letters],
  );

  useEffect(() => {
    setSelectedLetterId(sortedLetters[0]?.id ?? null);
  }, [sortedLetters, visible]);

  const selectedLetter =
    sortedLetters.find((letter) => letter.id === selectedLetterId) ?? sortedLetters[0];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>サンタからのおてがみ</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll}>
            {selectedLetter ? (
              <>
                <Pressable
                  style={styles.mainCard}
                  onPress={() => onMarkRead(selectedLetter.id)}
                >
                  <View style={styles.mainCardHeader}>
                    {!selectedLetter.isRead ? (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>新</Text>
                      </View>
                    ) : null}
                    <Text style={styles.newLabel}>
                      {!selectedLetter.isRead ? "あたらしい！" : ""}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(selectedLetter.date).toLocaleDateString("ja-JP", {
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text style={styles.mainTitle}>{selectedLetter.title}</Text>
                  <Text style={styles.mainBody}>{selectedLetter.body}</Text>
                  <Text style={styles.mainSign}>サンタクロースより</Text>
                </Pressable>

                {sortedLetters.length > 1 ? (
                  <>
                    <Text style={styles.historyLabel}>これまでのおてがみ</Text>
                    {sortedLetters
                      .filter((letter) => letter.id !== selectedLetter.id)
                      .map((letter) => (
                      <Pressable
                        key={letter.id}
                        style={styles.historyCard}
                        onPress={() => {
                          setSelectedLetterId(letter.id);
                          onMarkRead(letter.id);
                        }}
                      >
                        <Text style={styles.historyTitle}>{letter.title}</Text>
                        <Text style={styles.historyPreview} numberOfLines={1}>
                          {letter.body}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(letter.date).toLocaleDateString("ja-JP")}
                        </Text>
                      </Pressable>
                      ))}
                  </>
                ) : null}
              </>
            ) : (
              <Text style={styles.emptyText}>まだおてがみはないよ</Text>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
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
    backgroundColor: "#F5F0EB",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    marginBottom: 16,
  },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newBadge: {
    backgroundColor: "#FFE6E6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  newBadgeText: {
    color: "#D43D2F",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  newLabel: {
    color: "#2C1810",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  dateText: {
    color: "#A08878",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  mainTitle: {
    color: "#2C1810",
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  mainBody: {
    color: "#2C1810",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  mainSign: {
    color: "#D43D2F",
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
  emptyText: {
    color: "#FFFFFF66",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    paddingVertical: 24,
  },
});
