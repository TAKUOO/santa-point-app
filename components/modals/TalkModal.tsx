import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Child } from "../../types";
import { getSantaAvatarSourceForMedalCount } from "../../constants/santaAvatars";

type Props = {
  child: Child;
  visible: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
};

export function TalkModal({ child, visible, onClose, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const santaAvatarSource = getSantaAvatarSourceForMedalCount(child.medals.length);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 0);

    return () => clearTimeout(timer);
  }, [child.chatHistory.length, visible]);

  useEffect(() => {
    if (!visible) {
      setShowComposer(false);
      setDraft("");
      setShowThread(false);
    }
  }, [visible]);

  function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setDraft("");
    onClose();
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.title}>サンタとはなす</Text>
            <Pressable
              style={styles.threadButton}
              onPress={() => setShowThread((current) => !current)}
            >
              <MaterialIcons
                name={showThread ? "arrow-forward" : "history"}
                size={18}
                color="#FFFFFFCC"
              />
            </Pressable>
          </View>

          {showThread ? (
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {child.chatHistory.map((message) =>
                message.role === "santa" ? (
                  <View key={message.id} style={styles.santaMessageWrap}>
                    <View style={styles.santaAvatarSmall}>
                      <Image source={santaAvatarSource} style={styles.santaAvatarSmallImage} />
                    </View>
                    <View style={styles.speechBubble}>
                      <Text style={styles.speechText}>{message.text}</Text>
                      {message.points != null ? (
                        <View style={styles.pointGain}>
                          <MaterialIcons name="star" size={16} color="#34D399" />
                          <Text style={styles.pointGainText}>{message.points}ポイント</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ) : (
                  <View key={message.id} style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{message.text}</Text>
                  </View>
                ),
              )}
            </ScrollView>
          ) : (
            <View style={styles.startState}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <Image source={santaAvatarSource} style={styles.avatarImage} />
                </View>
              </View>
              <Text style={styles.startStateTitle}>サンタさんとお話しよう</Text>
              <Text style={styles.startStateText}>
                出来たことや欲しいものをサンタさんに話してみよう
              </Text>
            </View>
          )}
        </Pressable>

        <View pointerEvents="box-none" style={styles.fixedActionArea}>
          <Pressable style={styles.micButtonWrap} onPress={() => setShowComposer(true)}>
            <View style={styles.micButton}>
              <MaterialIcons name="mic" size={22} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        {showComposer ? (
          <Pressable style={styles.composerOverlay} onPress={() => setShowComposer(false)}>
            <Pressable style={styles.composerSheet} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.composerTitle}>ことばを確認する</Text>
              <Text style={styles.composerDescription}>
                音声がうまく認識できなかったときだけ直してください
              </Text>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="今日のことを入力..."
                placeholderTextColor="#FFFFFF44"
                style={styles.chatInput}
                multiline
                autoFocus
              />
              <View style={styles.composerActions}>
                <Pressable style={styles.secondaryAction} onPress={() => setShowComposer(false)}>
                  <Text style={styles.secondaryActionText}>閉じる</Text>
                </Pressable>
                <Pressable style={styles.primaryAction} onPress={handleSend}>
                  <Text style={styles.primaryActionText}>送信する</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        ) : null}
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
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF15",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  spacer: {
    width: 32,
    height: 32,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatarCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  startState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 140,
    gap: 12,
  },
  startStateTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  startStateText: {
    color: "#FFFFFFB8",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
    textAlign: "center",
  },
  threadButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF12",
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    alignItems: "center",
    justifyContent: "center",
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 140,
  },
  santaMessageWrap: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  santaAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 6,
  },
  santaAvatarSmallImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  speechBubble: {
    backgroundColor: "#FFFFFF15",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    maxWidth: "88%",
  },
  speechText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  pointGain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#34D39920",
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  pointGainText: {
    color: "#34D399",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  userBubble: {
    backgroundColor: "#FF6B3520",
    borderRadius: 12,
    padding: 16,
    maxWidth: "80%",
    alignSelf: "flex-end",
  },
  userBubbleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  fixedActionArea: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: "center",
  },
  composerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  composerSheet: {
    backgroundColor: "#1E1533F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    width: "100%",
    maxWidth: 360,
    padding: 18,
    gap: 12,
  },
  composerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  composerDescription: {
    color: "#FFFFFF99",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  chatInput: {
    backgroundColor: "#FFFFFF14",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FFFFFF22",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    minHeight: 48,
  },
  composerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryAction: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: "#FFFFFF99",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  primaryAction: {
    backgroundColor: "#D43D2F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  micButtonWrap: {
    alignItems: "center",
  },
  micButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D43D2F",
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: "#D43D2F",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
