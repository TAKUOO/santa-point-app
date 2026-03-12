import { useEffect } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { getCurrentMedalRank } from "../../constants/medals";
import { getSantaAvatarSourceForMedalCount } from "../../constants/santaAvatars";

type Props = {
  medalCount: number;
  rankName: string;
  visible: boolean;
  onClose: () => void;
};

export function RankUpCelebrationModal({ medalCount, rankName, visible, onClose }: Props) {
  const santaImage = getSantaAvatarSourceForMedalCount(medalCount);
  const previousRankName = getCurrentMedalRank(Math.max(0, medalCount - 1)).name;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onClose, visible]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.content}>
          <Text style={styles.title}>ランクアップしたよ！</Text>
          <View style={styles.avatarWrap}>
            <Image source={santaImage} style={styles.avatarImage} />
          </View>
          <Text style={styles.message}>
           {rankName}サンタになりました
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#1A0F2EE6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  content: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  title: {
    color: "#FFD700",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  avatarWrap: {
    width: 188,
    height: 188,
    borderRadius: 94,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  message: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 40,
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
});
