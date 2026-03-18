import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EmojiIcon } from "./common/EmojiIcon";
import { getSantaAvatarSourceForRankId } from "../constants/santaAvatars";
type OnboardingStep = "choice" | "guide" | "input";

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

  function handleSubmit() {
    if (!name.trim()) {
      Alert.alert("名前を入力してください");
      return;
    }

    const normalizedBirthdate = normalizeBirthdateForSave(birthdate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthdate)) {
      Alert.alert("誕生日の形式", "YYYY/MM/DD で入力してください");
      return;
    }

    handleFinish(normalizedBirthdate);
  }

  function handleFinish(normalizedBirthdate: string) {
    onCreateChild(name.trim(), normalizedBirthdate);
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
          <View style={styles.heroIconWrap}>
            <Image
              source={getSantaAvatarSourceForRankId(1)}
              style={styles.heroIconImage}
            />
          </View>
          <Text style={styles.title}>サンタポイントへようこそ</Text>
          <Text style={styles.subtitle}>
            まいにちサンタさんにほうこくして{"\n"}ポイントをためよう！
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => setStep("guide")}
          >
            <View style={styles.buttonContentRow}>
              <EmojiIcon name="christmasTree" size={15} />
              <Text style={styles.primaryButtonText}>あたらしくはじめる</Text>
            </View>
          </Pressable>
          {/* リリース時は不要のためコメントアウト
          <Pressable
            style={styles.secondaryButton}
            onPress={() => Alert.alert("データをひきつぐ", "このきのうはじゅんびちゅうです")}
          >
            <View style={styles.buttonContentRow}>
              <EmojiIcon name="package" size={15} />
              <Text style={styles.secondaryButtonText}>データをひきついではじめる</Text>
            </View>
          </Pressable>
          */}
        </View>
      ) : null}

      {step === "guide" && mode === "initial" ? (
        <View style={styles.content}>
          <Text style={styles.title}>あそびかた</Text>
          <Text style={styles.subtitle}>
            サンタポイントは、まいにちの「できた！」を{"\n"}サンタさんと楽しむアプリです
          </Text>

          <View style={styles.guideCard}>
            <View style={styles.guideIconWrap}>
              <EmojiIcon name="santa" size={18} />
            </View>
            <View style={styles.guideTextBlock}>
              <Text style={styles.guideTitle}>サンタさんにほうこく</Text>
              <Text style={styles.guideBody}>きょうできたことを話すと、サンタさんがよろこんでくれるよ</Text>
            </View>
          </View>

          <View style={styles.guideCard}>
            <View style={styles.guideIconWrap}>
              <EmojiIcon name="coin" size={18} />
            </View>
            <View style={styles.guideTextBlock}>
              <Text style={styles.guideTitle}>ポイントでランクアップ</Text>
              <Text style={styles.guideBody}>ポイントがたまるとランクが上がって、お部屋やサンタさんが変わるよ</Text>
            </View>
          </View>

          <View style={styles.guideCard}>
            <View style={styles.guideIconWrap}>
              <EmojiIcon name="gift" size={18} />
            </View>
            <View style={styles.guideTextBlock}>
              <Text style={styles.guideTitle}>おてがみとほしいもの</Text>
              <Text style={styles.guideBody}>サンタさんからのおてがみを読んだり、ほしいものをお願いしたりできるよ</Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => setStep("input")}
          >
            <Text style={styles.primaryButtonText}>わかった！</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={() => setStep("choice")}>
            <Text style={styles.ghostButtonText}>戻る</Text>
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
            名前と誕生日を入力すると{"\n"}あかいサンタさんがみまもってくれるよ
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
            onChangeText={(value) => setBirthdate(formatBirthdateInput(value))}
            placeholder="誕生日 (YYYY/MM/DD)"
            placeholderTextColor="#FFFFFF44"
            style={styles.input}
            keyboardType="number-pad"
            maxLength={10}
          />
          <Pressable style={[styles.primaryButton, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>登録する</Text>
          </Pressable>
          {mode === "addChild" ? (
            <Pressable style={styles.ghostButton} onPress={onCancel}>
              <Text style={styles.ghostButtonText}>キャンセル</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.ghostButton}
              onPress={() => setStep(mode === "initial" ? "guide" : "choice")}
            >
              <Text style={styles.ghostButtonText}>戻る</Text>
            </Pressable>
          )}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroIconWrap: {
    width: 108,
    height: 108,
    alignSelf: "center",
    borderRadius: 54,
    overflow: "hidden",
    marginBottom: 4,
  },
  heroIconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  subtitle: {
    color: "#FFFFFFAA",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 22,
  },
  guideCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF10",
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    alignItems: "flex-start",
  },
  guideIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF16",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  guideTextBlock: {
    flex: 1,
    gap: 4,
  },
  guideTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  guideBody: {
    color: "#FFFFFFAA",
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
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
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#D43D2F",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
});

function formatBirthdateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`;
}

function normalizeBirthdateForSave(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) {
    return value;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}
