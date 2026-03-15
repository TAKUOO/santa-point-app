import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Child } from "../../types";
import { daysUntilChristmas, getRoomTimeSlot, RoomTimeSlot } from "../../services/santa";
import { EmojiIcon } from "../common/EmojiIcon";
import { ProfileTabs } from "./ProfileTabs";
import { StatsBadges } from "./StatsBadges";
import { WishListCard } from "./WishListCard";

const NORMAL_ROOM_SCENES: Record<RoomTimeSlot, number> = {
  lateNight: require("../../assets/generated/rooms/normal/normal-santa-late-night.png"),
  morning: require("../../assets/generated/rooms/normal/normal-santa-morning.png"),
  daytime: require("../../assets/generated/rooms/normal/normal-santa-daytime.png"),
  night: require("../../assets/generated/rooms/normal/normal-santa-night.png"),
};

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
  const [roomTimeSlot, setRoomTimeSlot] = useState<RoomTimeSlot>(() => getRoomTimeSlot());

  useEffect(() => {
    const updateRoomTimeSlot = () => setRoomTimeSlot(getRoomTimeSlot());
    const timer = setInterval(updateRoomTimeSlot, 60_000);
    updateRoomTimeSlot();

    return () => clearInterval(timer);
  }, []);

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
          <View style={styles.letterBubbleContainer}>
            <Pressable style={styles.letterBubble} onPress={onOpenLetters}>
              <EmojiIcon name="incomingEnvelope" size={16} />
              <Text style={styles.letterBubbleText}>サンタからお手紙が届いたよ！</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.roomContainer}>
          <Image
            source={NORMAL_ROOM_SCENES[roomTimeSlot]}
            style={styles.roomImage}
          />
          <Pressable style={styles.hitSanta} onPress={onOpenTalk} />
        </View>

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
  letterBubbleContainer: {
    position: "absolute",
    top: 160,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  letterBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFFEE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  letterBubbleText: {
    color: "#2C1810",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  roomContainer: {
    position: "absolute",
    top: 238,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },
  roomImage: {
    width: 320,
    height: 303,
  },
  hitSanta: {
    position: "absolute",
    top: 105,
    left: 180,
    width: 90,
    height: 90,
    zIndex: 4,
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
