import { MaterialIcons } from "@expo/vector-icons";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { EmojiIcon } from "../common/EmojiIcon";
import { Child } from "../../types";
import { getSantaAvatarSourceForRankCount } from "../../constants/santaAvatars";
import { getChildRankCount } from "../../services/santa";
import { speakSantaReply, stopSantaSpeech } from "../../services/tts";

type Props = {
  child: Child;
  visible: boolean;
  onClose: () => void;
  onSend: (text: string) => string | undefined;
};

function sanitizeMessageText(text: string): string {
  return text.replace(/[🎅📩🎁📦⭐]/g, "");
}

export function TalkModal({ child, visible, onClose, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isSantaSpeaking, setIsSantaSpeaking] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const speakAnim = useRef(new Animated.Value(1)).current;
  const santaAvatarSource = getSantaAvatarSourceForRankCount(getChildRankCount(child));

  useEffect(() => {
    if (!isSantaSpeaking) {
      Animated.timing(speakAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(speakAnim, {
          toValue: 1.04,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(speakAnim, {
          toValue: 0.98,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isSantaSpeaking, speakAnim]);

  useSpeechRecognitionEvent("start", () => {
    setIsRecognizing(true);
    setRecognitionError(null);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecognizing(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript?.trim();
    if (!transcript) {
      return;
    }

    setDraft(transcript);
    setRecognitionError(null);
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "aborted") {
      setIsRecognizing(false);
      return;
    }

    setIsRecognizing(false);
    setRecognitionError("音声をうまく聞き取れませんでした。ことばを直してください。");
  });

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
      setIsRecognizing(false);
      setIsSantaSpeaking(false);
      setRecognitionError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      return;
    }

    ExpoSpeechRecognitionModule.abort();
  }, [visible]);

  function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setShowComposer(false);
    const santaReply = onSend(trimmed);
    setDraft("");
    if (santaReply) {
      speakSantaReply(santaReply, {
        onStart: () => setIsSantaSpeaking(true),
        onEnd: () => {
          setIsSantaSpeaking(false);
          onClose();
        },
      });
    }
    // チャット履歴には切り替えず、サンタとの音声画面のまま返答を読み上げる
  }

  function handleCloseComposer() {
    if (isRecognizing) {
      ExpoSpeechRecognitionModule.abort();
    }
    setShowComposer(false);
  }

  function handleClose() {
    stopSantaSpeech();
    setIsSantaSpeaking(false);
    onClose();
  }

  async function handlePressMic() {
    setShowComposer(true);
    setRecognitionError(null);

    if (isRecognizing) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      Alert.alert("音声入力を使えません", "この端末では音声入力を利用できません。");
      return;
    }

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setRecognitionError("マイクと音声認識の許可が必要です。");
      return;
    }

    stopSantaSpeech();
    setIsSantaSpeaking(false);
    setDraft("");

    ExpoSpeechRecognitionModule.start({
      lang: "ja-JP",
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      addsPunctuation: true,
      contextualStrings: child.wishlist,
    });
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropOverlay} onPress={handleClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={showThread ? () => setShowThread(false) : handleClose}
            >
              <MaterialIcons
                name={showThread ? "arrow-back" : "close"}
                size={20}
                color="#FFFFFF"
              />
            </Pressable>
            <Text style={styles.title}>サンタとはなす</Text>
            {showThread ? (
              <View style={styles.spacer} />
            ) : (
              <Pressable
                style={styles.threadButton}
                onPress={() => setShowThread((current) => !current)}
              >
                <MaterialIcons name="history" size={18} color="#FFFFFFCC" />
              </Pressable>
            )}
          </View>

          {showThread ? (
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatScroll}
              contentContainerStyle={[
                styles.chatContent,
                showThread ? styles.chatContentThread : null,
              ]}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              alwaysBounceVertical
            >
              {child.chatHistory.map((message) =>
                message.role === "santa" ? (
                  <View key={message.id} style={styles.santaMessageWrap}>
                    <View style={styles.santaAvatarSmall}>
                      <Image source={santaAvatarSource} style={styles.santaAvatarSmallImage} />
                    </View>
                    <View style={styles.speechBubble}>
                      <Text style={styles.speechText}>{sanitizeMessageText(message.text)}</Text>
                      {message.points != null ? (
                        <View style={styles.pointGain}>
                          <EmojiIcon name="coin" size={16} />
                          <Text style={styles.pointGainText}>{message.points}ポイント</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ) : (
                  <View key={message.id} style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{sanitizeMessageText(message.text)}</Text>
                  </View>
                ),
              )}
            </ScrollView>
          ) : (
            <View style={styles.startState}>
              <View style={styles.avatarWrap}>
                <View
                  style={[
                    styles.avatarCircleOuter,
                    isSantaSpeaking && styles.avatarCircleSpeaking,
                  ]}
                >
                  <Animated.View
                    style={[styles.avatarCircle, { transform: [{ scale: speakAnim }] }]}
                  >
                    <Image source={santaAvatarSource} style={styles.avatarImage} />
                  </Animated.View>
                </View>
              </View>
              <Text style={styles.startStateTitle}>サンタさんとお話しよう</Text>
              <Text style={styles.startStateText}>
                出来たことや欲しいものをサンタさんに話してみよう
              </Text>
            </View>
          )}
        </View>

        {!showThread ? (
          <View pointerEvents="box-none" style={styles.fixedActionArea}>
            <Pressable style={styles.micButtonWrap} onPress={handlePressMic}>
              <View style={[styles.micButton, isRecognizing ? styles.micButtonActive : null]}>
                <MaterialIcons name={isRecognizing ? "stop" : "mic"} size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.micButtonLabel}>
                {isRecognizing
                  ? "きいているよ... タップで停止"
                  : "タップしてサンタさんに話しかけよう！"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {showComposer ? (
          <Pressable style={styles.composerOverlay} onPress={handleCloseComposer}>
            <Pressable style={styles.composerSheet} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.composerTitle}>ことばを確認する</Text>
              <Text style={styles.composerDescription}>
                {isRecognizing
                  ? "おはなしが終わったら、もういちどボタンを押して止めてください"
                  : "音声がうまく認識できなかったときだけ直してください"}
              </Text>
              <View style={styles.recognitionStatus}>
                {isRecognizing ? (
                  <>
                    <ActivityIndicator size="small" color="#FFD166" />
                    <Text style={styles.recognitionStatusText}>ききとり中です...</Text>
                  </>
                ) : (
                  <Text style={styles.recognitionStatusTextMuted}>
                    ここに音声が文字で入ります
                  </Text>
                )}
              </View>
              {recognitionError ? (
                <Text style={styles.recognitionErrorText}>{recognitionError}</Text>
              ) : null}
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
                <Pressable style={styles.secondaryAction} onPress={handleCloseComposer}>
                  <Text style={styles.secondaryActionText}>閉じる</Text>
                </Pressable>
                <Pressable style={styles.primaryAction} onPress={handleSend}>
                  <Text style={styles.primaryActionText}>送信する</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000088",
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
  avatarCircleOuter: {
    width: 132,
    height: 132,
    borderRadius: 66,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircleSpeaking: {
    shadowColor: "#FFD166",
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
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
  chatContentThread: {
    paddingBottom: 24,
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
  micButtonActive: {
    backgroundColor: "#FF7C5C",
  },
  micButtonLabel: {
    color: "#FFFFFFCC",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 10,
    textAlign: "center",
  },
  recognitionErrorText: {
    color: "#FFB4C7",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 20,
  },
  recognitionStatus: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF0F",
    borderWidth: 1,
    borderColor: "#FFFFFF14",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  recognitionStatusText: {
    color: "#FFD166",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  recognitionStatusTextMuted: {
    color: "#FFFFFF73",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
