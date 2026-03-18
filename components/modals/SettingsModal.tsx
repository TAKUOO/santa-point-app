import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Child } from "../../types";
import { LegalDocumentId } from "../../constants/legalDocuments";

type Props = {
  children: Child[];
  onClose: () => void;
  onAddChild: () => void;
  onDeleteChild: (childId: string) => void;
  onEditChild: (childId: string) => void;
  onDeleteAccount: () => void;
  onOpenLegalDocument: (documentId: LegalDocumentId) => void;
};

// リリース時は不要のためコメントアウト
// - データインポート/エクスポート
// - 関連サービス
// - データを引き継いで始めるボタン（OnboardingFlow側）

export function SettingsModal({
  children,
  onClose,
  onAddChild,
  onDeleteChild,
  onEditChild,
  onDeleteAccount,
  onOpenLegalDocument,
}: Props) {
  const legalItems = [
    { title: "利用規約", onPress: () => onOpenLegalDocument("terms") },
    { title: "プライバシーポリシー", onPress: () => onOpenLegalDocument("privacy") },
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
      <ScrollView
        contentContainerStyle={styles.content}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* お子様の管理 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>お子様の管理</Text>
            <Pressable style={styles.addChildButton} onPress={onAddChild}>
              <MaterialIcons name="add" size={20} color={colors.link} />
              <Text style={styles.addChildButtonText}>追加</Text>
            </Pressable>
          </View>
          <View style={styles.group}>
            {children.map((child, index) => (
              <View
                key={child.id}
                style={[
                  styles.row,
                  index < children.length - 1 ? styles.rowBorder : null,
                ]}
              >
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMeta}>
                    {formatAge(child.birthdate)} {formatBirthdate(child.birthdate)}
                  </Text>
                </View>
                <View style={styles.childActions}>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => onEditChild(child.id)}
                  >
                    <MaterialIcons name="edit" size={20} color={colors.link} />
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => onDeleteChild(child.id)}
                  >
                    <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 法的情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderText}>法的情報</Text>
          <View style={styles.group}>
            {legalItems.map((item, index) => (
              <Pressable
                key={item.title}
                style={[
                  styles.listRow,
                  index < legalItems.length - 1 ? styles.listRowBorder : null,
                ]}
                onPress={item.onPress}
              >
                <Text style={styles.listRowText}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={22} color={colors.chevron} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* アカウントの削除 */}
        <View style={styles.section}>
          <View style={styles.group}>
            <Pressable style={styles.dangerRow} onPress={onDeleteAccount}>
              <Text style={styles.dangerRowText}>アカウントの削除</Text>
              <MaterialIcons name="chevron-right" size={22} color={colors.chevron} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// 他ページ（HomeScreen, ProfileTabs等）のトンマナに合わせた配色
const colors = {
  bg: "#1A0F2E",
  groupBg: "#FFFFFF10",
  groupBorder: "#FFFFFF14",
  text: "#FFFFFFEE",
  textSecondary: "#FFFFFF99",
  link: "#67A8FF",
  danger: "#FF7C9C",
  separator: "#FFFFFF12",
  chevron: "#FFFFFF66",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.bg,
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
    color: colors.text,
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  sectionHeaderText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    marginLeft: 4,
  },
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF18",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  addChildButtonText: {
    color: colors.link,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  group: {
    backgroundColor: colors.groupBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.groupBorder,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  childInfo: {
    flex: 1,
    gap: 4,
  },
  childName: {
    color: colors.text,
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  childMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  childActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF0D",
    alignItems: "center",
    justifyContent: "center",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  listRowText: {
    color: colors.link,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dangerRowText: {
    color: colors.danger,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  spacer: {
    width: 32,
    height: 32,
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
