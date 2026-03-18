import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Child } from "../../types";

type Props = {
  child: Child | null;
  visible: boolean;
  onClose: () => void;
  onSave: (childId: string, name: string, birthdate: string) => void;
};

export function ChildEditorModal({ child, visible, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");

  useEffect(() => {
    if (child && visible) {
      setName(child.name);
      setBirthdate(formatBirthdateInput(child.birthdate));
    }
  }, [child, visible]);

  function handleSave() {
    if (!child) {
      return;
    }
    if (!name.trim()) {
      Alert.alert("名前を入力してください");
      return;
    }
    const normalizedBirthdate = normalizeBirthdateForSave(birthdate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthdate)) {
      Alert.alert("誕生日の形式", "YYYY/MM/DD で入力してください");
      return;
    }

    onSave(child.id, name.trim(), normalizedBirthdate);
    onClose();
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.title}>お子様情報の編集</Text>
            <View style={styles.spacer} />
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>名前</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="名前"
              placeholderTextColor="#FFFFFF44"
              style={styles.input}
            />
            <Text style={styles.label}>誕生日</Text>
            <TextInput
              value={birthdate}
              onChangeText={(value) => setBirthdate(formatBirthdateInput(value))}
              placeholder="YYYY/MM/DD"
              placeholderTextColor="#FFFFFF44"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Text style={styles.helpText}>
              担当サンタはそのままで、お子様情報だけを更新します
            </Text>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存する</Text>
            </Pressable>
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
  spacer: {
    width: 32,
    height: 32,
  },
  title: {
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 12,
    flexGrow: 1,
  },
  label: {
    color: "#FFFFFFCC",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
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
  helpText: {
    color: "#FFFFFF88",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#D43D2F",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
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
