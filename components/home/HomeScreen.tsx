import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Child } from "../../types";
import { daysUntilChristmas } from "../../services/santa";
import { ProfileTabs } from "./ProfileTabs";
import { StatsBadges } from "./StatsBadges";
import { WishListCard } from "./WishListCard";

const ROOM_SCENE_IMAGE = require("../../assets/rooms/room-cutout.png");

type Props = {
  activeChild: Child;
  children: Child[];
  unreadCount: number;
  onDebugShowRankUp?: () => void;
  onRemoveWishlistItem: (item: string) => void;
  onOpenLetters: () => void;
  onOpenSettings: () => void;
  onOpenTalk: () => void;
  onSelectChild: (childId: string) => void;
};

export function HomeScreen({
  activeChild,
  children,
  unreadCount,
  onRemoveWishlistItem,
  onOpenLetters,
  onOpenSettings,
  onOpenTalk,
  onSelectChild,
}: Props) {
  const dayCount = daysUntilChristmas();

  return (
    <>
      <ProfileTabs
        activeChildId={activeChild.id}
        children={children}
        onOpenSettings={onOpenSettings}
        onSelectChild={onSelectChild}
      />

      <View style={styles.roomScene}>
        <StatsBadges
          daysUntilChristmas={dayCount}
          medalCount={activeChild.medals.length}
          pointsThisYear={activeChild.pointsThisYear}
        />

        {unreadCount > 0 ? (
          <Pressable style={styles.letterBubble} onPress={onOpenLetters}>
            <Text style={styles.letterEmoji}>📩</Text>
            <Text style={styles.letterBubbleText}>サンタからお手紙が届いたよ！</Text>
          </Pressable>
        ) : null}

        <Image
          source={ROOM_SCENE_IMAGE}
          style={styles.roomImage}
        />
        <Pressable style={styles.hitSanta} onPress={onOpenTalk} />

        <WishListCard items={activeChild.wishlist} onRemoveItem={onRemoveWishlistItem} />

        <Pressable style={styles.talkButton} onPress={onOpenTalk}>
          <MaterialIcons name="mic" size={24} color="#FFFFFF" />
          <Text style={styles.talkButtonText}>サンタさんとはなす</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  roomScene: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#1A0F2E",
  },
  letterBubble: {
    position: "absolute",
    top: 160,
    left: 87,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFFEE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  letterEmoji: {
    fontSize: 16,
  },
  letterBubbleText: {
    color: "#2C1810",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  hitSanta: {
    position: "absolute",
    top: 343,
    left: 230,
    width: 90,
    height: 90,
    zIndex: 4,
  },
  roomImage: {
    position: "absolute",
    top: 238,
    left: 50,
    width: 320,
    height: 290,
    zIndex: 3,
  },
  talkButton: {
    position: "absolute",
    bottom: 24,
    left: 66,
    right: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#D43D2F",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  talkButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
