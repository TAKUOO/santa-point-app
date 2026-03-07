import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { assignSanta } from "../services/santa";

type OnboardingStep = "choice" | "input" | "reveal";

type Props = {
  mode?: "initial" | "addChild";
  onCancel?: () => void;
  onCreateChild: (name: string, birthdate: string) => void;
};

export function OnboardingFlow({
  mode = "initial",
  onCancel,
  onCreateChild,
}: Props) {
  const isAddChildMode = mode === "addChild";
  const [step, setStep] = useState<OnboardingStep>(mode === "addChild" ? "input" : "choice");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");

  useEffect(() => {
    setStep(mode === "addChild" ? "input" : "choice");
    setName("");
    setBirthdate("");
  }, [mode]);

  const assignedSanta = useMemo(() => {
    if (!name.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return null;
    }

    return assignSanta(name.trim(), birthdate);
  }, [birthdate, name]);

  function handleNext() {
    if (!name.trim()) {
      Alert.alert("名前を入力してください");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      Alert.alert("誕生日の形式", "YYYY-MM-DD で入力してください");
      return;
    }

    setStep("reveal");
  }

  function handleFinish() {
    onCreateChild(name.trim(), birthdate);
    setName("");
    setBirthdate("");
    setStep(mode === "addChild" ? "input" : "choice");
  }

  return (
    <View style={[styles.container, isAddChildMode ? styles.addChildContainer : null]}>
      {isAddChildMode ? (
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>子どもの追加</Text>
          <Pressable style={styles.closeButton} onPress={onCancel}>
            <MaterialIcons name="close" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : null}

      {step === "choice" && mode === "initial" ? (
        <View style={styles.content}>
          <Text style={styles.title}>🎅 サンタポイントへようこそ</Text>
          <Text style={styles.subtitle}>
            まいにちサンタさんにほうこくして{"\n"}ポイントをためよう！
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => setStep("input")}
          >
            <Text style={styles.primaryButtonText}>🎄 あたらしくはじめる</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => Alert.alert("データをひきつぐ", "このきのうはじゅんびちゅうです")}
          >
            <Text style={styles.secondaryButtonText}>📦 データをひきついではじめる</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "input" ? (
        <View
          style={[
            styles.content,
            isAddChildMode ? styles.addChildCenteredContent : null,
          ]}
        >
          <Text style={styles.title}>お子様の情報</Text>
          <Text
            style={[
              styles.subtitle,
              isAddChildMode ? styles.addChildSubtitle : null,
            ]}
          >
            名前と誕生日を入力すると{"\n"}あなただけのサンタさんが決まります
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="名前（例：ゆうくん）"
            placeholderTextColor="#FFFFFF44"
            style={styles.input}
          />
          <TextInput
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="誕生日 (YYYY-MM-DD)"
            placeholderTextColor="#FFFFFF44"
            style={styles.input}
          />
          <Pressable style={[styles.primaryButton, styles.submitButton]} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>登録する</Text>
          </Pressable>
          {mode === "addChild" ? (
            <Pressable style={styles.ghostButton} onPress={onCancel}>
              <Text style={styles.ghostButtonText}>キャンセル</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.ghostButton} onPress={() => setStep("choice")}>
              <Text style={styles.ghostButtonText}>戻る</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {step === "reveal" && assignedSanta ? (
        <View
          style={[
            styles.content,
            isAddChildMode ? styles.addChildCenteredContent : null,
          ]}
        >
          <Text style={styles.title}>あなただけのサンタさん！</Text>
          <View style={styles.revealCard}>
            <Text style={styles.revealEmoji}>{assignedSanta.emoji}</Text>
            <Text style={styles.revealName}>{assignedSanta.name}</Text>
            <Text style={styles.revealMessage}>「{assignedSanta.message}」</Text>
          </View>
          <Text style={styles.subtitle}>
            このサンタさんが{name.trim()}ちゃんの{"\n"}4ねんかんをみまもってくれるよ！
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleFinish}>
            <Text style={styles.primaryButtonText}>よろしくね！</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  addChildContainer: {
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF15",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    gap: 16,
  },
  addChildCenteredContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 72,
  },
  addChildSubtitle: {
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center",
  },
  subtitle: {
    color: "#FFFFFFAA",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#FFFFFF14",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF22",
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#D43D2F",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  submitButton: {
    marginTop: 18,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF18",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFFCC",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  ghostButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  ghostButtonText: {
    color: "#FFFFFF66",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  revealCard: {
    backgroundColor: "#FFFFFF12",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF22",
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  revealEmoji: {
    fontSize: 56,
  },
  revealName: {
    color: "#FFD700",
    fontSize: 20,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center",
  },
  revealMessage: {
    color: "#FFFFFFCC",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 22,
  },
});
