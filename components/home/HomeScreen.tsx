import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Child } from "../../types";
import { daysUntilChristmas, getRoomStateLabel } from "../../services/santa";
import { ProfileTabs } from "./ProfileTabs";
import { StatsBadges } from "./StatsBadges";
import { WishListCard } from "./WishListCard";

const ROOM_SCENE_IMAGE = require("../../assets/rooms/room-default.png");

type Props = {
  activeChild: Child;
  children: Child[];
  unreadCount: number;
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
  const roomLabel = getRoomStateLabel(new Date());

  return (
    <>
      <ProfileTabs
        activeChildId={activeChild.id}
        children={children}
        onOpenSettings={onOpenSettings}
        onSelectChild={onSelectChild}
      />

      <ImageBackground
        source={ROOM_SCENE_IMAGE}
        resizeMode="cover"
        style={styles.roomScene}
      >
        <View style={styles.topGradient} />

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

        <Pressable style={styles.hitMail} onPress={onOpenLetters}>
          <View style={styles.mailIcon}>
            <MaterialIcons name="mail" size={14} color="#FFD700" />
          </View>
          {unreadCount > 0 ? (
            <View style={styles.mailBadge}>
              <Text style={styles.mailBadgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable style={styles.hitSanta} onPress={onOpenTalk} />

        <View style={styles.bottomGradient} />

        <View style={styles.roomStateRow}>
          <Text style={styles.roomStateText}>サンタさんは{roomLabel}</Text>
        </View>

        <WishListCard items={activeChild.wishlist} onRemoveItem={onRemoveWishlistItem} />

        <Pressable style={styles.talkButton} onPress={onOpenTalk}>
          <MaterialIcons name="mic" size={24} color="#FFFFFF" />
          <Text style={styles.talkButtonText}>サンタさんとはなす</Text>
        </Pressable>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  roomScene: {
    flex: 1,
    overflow: "hidden",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 218,
    backgroundColor: "#1A0F2ECC",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 420,
    backgroundColor: "#1A0F2ECC",
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
  hitMail: {
    position: "absolute",
    top: 412,
    left: 68,
    width: 32,
    height: 28,
  },
  mailIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#8B5E3CDD",
    justifyContent: "center",
    alignItems: "center",
  },
  mailBadge: {
    position: "absolute",
    top: -2,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D43D2F",
    justifyContent: "center",
    alignItems: "center",
  },
  mailBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  hitSanta: {
    position: "absolute",
    top: 270,
    left: 240,
    width: 65,
    height: 75,
  },
  roomStateRow: {
    position: "absolute",
    bottom: 250,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  roomStateText: {
    color: "#FFFFFF88",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
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
