import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onAddChild: () => void;
  onShowStub: (title: string) => void;
};

export function SettingsModal({
  visible,
  onClose,
  onAddChild,
  onShowStub,
}: Props) {
  const items = [
    {
      title: "👧 子どもの追加",
      subtitle: "新しいお子様を追加する",
      onPress: onAddChild,
    },
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
  ];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.spacer} />
            <Text style={styles.title}>設定</Text>
            <Pressable style={styles.backButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <ScrollView>
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
