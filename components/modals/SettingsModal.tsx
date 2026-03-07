import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Child } from "../../types";

type Props = {
  children: Child[];
  onClose: () => void;
  onAddChild: () => void;
  onDeleteChild: (childId: string) => void;
  onEditChild: (childId: string) => void;
  onDeleteAccount: () => void;
  onShowStub: (title: string) => void;
};

export function SettingsModal({
  children,
  onClose,
  onAddChild,
  onDeleteChild,
  onEditChild,
  onDeleteAccount,
  onShowStub,
}: Props) {
  const items = [
    {
      title: "📤 データをエクスポート",
      subtitle: "全データをJSONで保存する",
      onPress: () => onShowStub("エクスポート"),
    },
    {
      title: "📥 データをインポート",
      subtitle: "JSONファイルから読み込む",
      onPress: () => onShowStub("インポート"),
    },
    {
      title: "🔗 関連サービス",
      subtitle: "Claude / TTS / 音声入力",
      onPress: () => onShowStub("関連サービス"),
    },
    {
      title: "📄 法的情報",
      subtitle: "プライバシーポリシー・利用規約",
      onPress: () => onShowStub("法的情報"),
    },
    {
      title: "🗑️ アカウントの削除",
      subtitle: "保存されているデータをすべて削除する",
      onPress: onDeleteAccount,
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>設定</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.childSection}>
          <View style={styles.childSectionHeader}>
            <Text style={styles.sectionTitle}>お子様の管理</Text>
            <Pressable style={styles.addChildButton} onPress={onAddChild}>
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addChildButtonText}>追加</Text>
            </Pressable>
          </View>

          <View style={styles.childList}>
            {children.map((child, index) => (
              <View
                key={child.id}
                style={[
                  styles.childCard,
                  index < children.length - 1 ? styles.childCardBorder : null,
                ]}
              >
                <View style={styles.childInfo}>
                  <View style={styles.childNameRow}>
                    <Text style={styles.childName}>{child.name}</Text>
                  </View>
                  <Text style={styles.childMeta}>
                    {formatAge(child.birthdate)} {formatBirthdate(child.birthdate)}
                  </Text>
                </View>
                <View style={styles.childActions}>
                  <Pressable
                    style={styles.editChildButton}
                    onPress={() => onEditChild(child.id)}
                  >
                    <MaterialIcons name="edit" size={20} color="#67A8FF" />
                  </Pressable>
                  <Pressable
                    style={styles.deleteChildButton}
                    onPress={() => onDeleteChild(child.id)}
                  >
                    <MaterialIcons name="delete-outline" size={22} color="#FF7C9C" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {items.map((item, index) => (
          <Pressable
            key={item.title}
            style={[
              styles.item,
              index === items.length - 1 ? styles.itemLast : null,
            ]}
            onPress={item.onPress}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1A0F2E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
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
  content: {
    paddingBottom: 24,
  },
  childSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  childSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E73E8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addChildButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  childList: {
    backgroundColor: "#FFFFFF10",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF14",
    overflow: "hidden",
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  childCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF12",
  },
  childInfo: {
    flex: 1,
    gap: 6,
  },
  childNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  childName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  childMeta: {
    color: "#FFFFFF99",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  deleteChildButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF0D",
    alignItems: "center",
    justifyContent: "center",
  },
  editChildButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF0D",
    alignItems: "center",
    justifyContent: "center",
  },
  childActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  spacer: {
    width: 32,
    height: 32,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF12",
    gap: 3,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemTitle: {
    color: "#FFFFFFEE",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  itemSubtitle: {
    color: "#FFFFFF66",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});

function formatBirthdate(birthdate: string): string {
  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) {
    return birthdate;
  }

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAge(birthdate: string): string {
  const birthday = new Date(birthdate);
  if (Number.isNaN(birthday.getTime())) {
    return "";
  }

  const today = new Date();
  let years = today.getFullYear() - birthday.getFullYear();
  let months = today.getMonth() - birthday.getMonth();

  if (today.getDate() < birthday.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${Math.max(0, years)}歳${Math.max(0, months)}ヶ月`;
}
