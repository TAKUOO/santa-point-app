import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getCurrentRank } from "../../constants/ranks";
import { getRoomScenePresentation, getRoomSceneSource } from "../../constants/roomScenes";
import { Child } from "../../types";
import {
  daysUntilChristmas,
  getChildRankCount,
  getRoomTimeSlot,
  RoomTimeSlot,
} from "../../services/santa";
import { EmojiIcon } from "../common/EmojiIcon";
import { ProfileTabs } from "./ProfileTabs";
import { StatsBadges } from "./StatsBadges";
import { WishListCard } from "./WishListCard";

const ROOM_IMAGE_ASPECT_RATIO = 320 / 303;
const ROOM_SIDE_PADDING = 14;
const ROOM_MAX_WIDTH = 400;
const TOP_PADDING = 24;
const STATS_TO_LETTER_GAP = 20;
const LETTER_TO_ROOM_GAP = 28;
const STATS_TO_ROOM_GAP = 24;
const ROOM_TO_WISHLIST_GAP = 28;
const SCROLL_BOTTOM_PADDING = 120;
const HIT_SANTA_FRAME = {
  top: 105 / 303,
  left: 180 / 320,
  width: 90 / 320,
  height: 90 / 303,
};

type Props = {
  activeChild: Child;
  children: Child[];
  debugPreviewRankCount?: number | null;
  debugRoomTimeSlot?: RoomTimeSlot | null;
  unreadCount: number;
  onDebugOpenLetters?: () => void;
  onDebugOpenTalk?: () => void;
  onDebugResetPreview?: () => void;
  onDebugSelectRank?: (rankCount: number | null) => void;
  onDebugSelectTimeSlot?: (timeSlot: RoomTimeSlot | null) => void;
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
  debugPreviewRankCount,
  debugRoomTimeSlot,
  unreadCount,
  onDebugOpenLetters,
  onDebugOpenTalk,
  onDebugResetPreview,
  onDebugSelectRank,
  onDebugSelectTimeSlot,
  onDebugShowRankUp,
  onRemoveWishlistItem,
  onOpenLetters,
  onOpenSettings,
  onOpenTalk,
  onSelectChild,
}: Props) {
  const dayCount = daysUntilChristmas();
  const [roomTimeSlot, setRoomTimeSlot] = useState<RoomTimeSlot>(() => getRoomTimeSlot());
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    if (debugRoomTimeSlot) {
      setRoomTimeSlot(debugRoomTimeSlot);
      return undefined;
    }
    const updateRoomTimeSlot = () => setRoomTimeSlot(getRoomTimeSlot());
    const timer = setInterval(updateRoomTimeSlot, 60_000);
    updateRoomTimeSlot();

    return () => clearInterval(timer);
  }, [debugRoomTimeSlot]);

  const roomWidth = Math.min(windowWidth - ROOM_SIDE_PADDING * 2, ROOM_MAX_WIDTH);
  const roomHeight = roomWidth / ROOM_IMAGE_ASPECT_RATIO;
  const roomHorizontalInset = Math.max(
    ROOM_SIDE_PADDING,
    (windowWidth - roomWidth) / 2,
  );
  const hitSantaStyle = {
    top: roomHeight * HIT_SANTA_FRAME.top,
    left: roomWidth * HIT_SANTA_FRAME.left,
    width: roomWidth * HIT_SANTA_FRAME.width,
    height: roomHeight * HIT_SANTA_FRAME.height,
  };

  const isSantaSleeping = roomTimeSlot === "lateNight";
  const rankCount = getChildRankCount(activeChild);
  const currentRankId = getCurrentRank(rankCount).id;
  const roomSceneSource = getRoomSceneSource(currentRankId, roomTimeSlot);
  const roomScenePresentation = getRoomScenePresentation(currentRankId);

  return (
    <>
      <ProfileTabs
        activeChildId={activeChild.id}
        children={children}
        onOpenSettings={onOpenSettings}
        onSelectChild={onSelectChild}
      />

      <View style={styles.roomScene}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scrollInner}>
            <StatsBadges
              daysUntilChristmas={dayCount}
              rankCount={rankCount}
              pointsThisYear={activeChild.pointsThisYear}
              inline
            />

            {onDebugSelectRank ? (
              <View style={styles.debugPanel}>
                <View style={styles.debugHeader}>
                  <Text style={styles.debugTitle}>Debug Preview</Text>
                  <Pressable style={styles.debugGhostButton} onPress={onDebugResetPreview}>
                    <Text style={styles.debugGhostButtonText}>実データへ戻す</Text>
                  </Pressable>
                </View>
                <Text style={styles.debugLabel}>
                  ランク {debugPreviewRankCount ?? rankCount} / 時間帯 {debugRoomTimeSlot ?? roomTimeSlot}
                </Text>
                <View style={styles.debugRow}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
                    const selected = (debugPreviewRankCount ?? rankCount) === value;
                    return (
                      <Pressable
                        key={`rank_${value}`}
                        style={[styles.debugChip, selected ? styles.debugChipActive : null]}
                        onPress={() => onDebugSelectRank(value)}
                      >
                        <Text
                          style={[styles.debugChipText, selected ? styles.debugChipTextActive : null]}
                        >
                          R{value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.debugRow}>
                  {(["lateNight", "morning", "daytime", "night"] as RoomTimeSlot[]).map((slot) => {
                    const selected = (debugRoomTimeSlot ?? roomTimeSlot) === slot;
                    return (
                      <Pressable
                        key={slot}
                        style={[styles.debugChip, selected ? styles.debugChipActive : null]}
                        onPress={() => onDebugSelectTimeSlot?.(slot)}
                      >
                        <Text
                          style={[styles.debugChipText, selected ? styles.debugChipTextActive : null]}
                        >
                          {slot}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.debugActions}>
                  <Pressable style={styles.debugActionButton} onPress={onDebugOpenTalk}>
                    <Text style={styles.debugActionText}>会話確認</Text>
                  </Pressable>
                  <Pressable style={styles.debugActionButton} onPress={onDebugOpenLetters}>
                    <Text style={styles.debugActionText}>手紙確認</Text>
                  </Pressable>
                  <Pressable style={styles.debugActionButton} onPress={onDebugShowRankUp}>
                    <Text style={styles.debugActionText}>演出確認</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {unreadCount > 0 ? (
              <View style={[styles.letterBubbleWrapper, { marginTop: STATS_TO_LETTER_GAP }]}>
                <Pressable style={styles.letterBubble} onPress={onOpenLetters}>
                  <EmojiIcon name="incomingEnvelope" size={16} />
                  <Text style={styles.letterBubbleText}>サンタからお手紙が届いたよ！</Text>
                </Pressable>
              </View>
            ) : null}

            <View
              style={[
                styles.roomWrapper,
                {
                  marginTop: unreadCount > 0 ? LETTER_TO_ROOM_GAP : STATS_TO_ROOM_GAP,
                  marginHorizontal: roomHorizontalInset,
                },
              ]}
            >
              <View style={styles.roomContainer}>
                <Image
                  source={roomSceneSource}
                  style={[
                    styles.roomImage,
                    {
                      width: roomWidth,
                      height: roomHeight,
                      transform: [{ scale: roomScenePresentation.scale }],
                    },
                  ]}
                />
                <Pressable
                  style={[styles.hitSanta, hitSantaStyle]}
                  onPress={isSantaSleeping ? undefined : onOpenTalk}
                  disabled={isSantaSleeping}
                />
              </View>
            </View>

            <View style={[styles.wishlistWrapper, { marginTop: ROOM_TO_WISHLIST_GAP }]}>
              <WishListCard
                inline
                items={activeChild.wishlist}
                onRemoveItem={onRemoveWishlistItem}
              />
            </View>

            <View style={{ height: SCROLL_BOTTOM_PADDING }} />
          </View>
        </ScrollView>

        <Pressable
          style={[styles.talkButton, isSantaSleeping && styles.talkButtonDisabled]}
          onPress={isSantaSleeping ? undefined : onOpenTalk}
          disabled={isSantaSleeping}
        >
          <MaterialIcons
            name="mic"
            size={24}
            color={isSantaSleeping ? "#FFFFFF99" : "#FFFFFF"}
          />
          <Text style={styles.talkButtonText}>
            {isSantaSleeping ? "サンタは寝ているよ" : "サンタさんとはなす"}
          </Text>
        </Pressable>

        {!onDebugSelectRank && onDebugShowRankUp ? (
          <Pressable style={styles.debugRankupTrigger} onPress={onDebugShowRankUp}>
            <Text style={styles.debugRankupTriggerText}>演出</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  roomScene: {
    flex: 1,
    backgroundColor: "#1A0F2E",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
  },
  scrollInner: {
    paddingHorizontal: 0,
  },
  debugPanel: {
    marginTop: 18,
    marginHorizontal: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#09111DB8",
    borderWidth: 1,
    borderColor: "#67A8FF33",
    gap: 10,
  },
  debugHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  debugTitle: {
    color: "#9FC5FF",
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  debugGhostButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF14",
  },
  debugGhostButtonText: {
    color: "#FFFFFFCC",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  debugLabel: {
    color: "#FFFFFFAA",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  debugRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  debugChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFFFFF10",
    borderWidth: 1,
    borderColor: "#FFFFFF18",
  },
  debugChipActive: {
    backgroundColor: "#67A8FF22",
    borderColor: "#67A8FF88",
  },
  debugChipText: {
    color: "#FFFFFFAA",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  debugChipTextActive: {
    color: "#D9E9FF",
  },
  debugActions: {
    flexDirection: "row",
    gap: 8,
  },
  debugActionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF14",
  },
  debugActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  letterBubbleWrapper: {
    alignItems: "center",
    paddingHorizontal: 14,
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
  roomWrapper: {
    alignItems: "center",
  },
  wishlistWrapper: {
    paddingHorizontal: 0,
  },
  roomContainer: {
    position: "relative",
    alignItems: "center",
    zIndex: 3,
  },
  roomImage: {
    resizeMode: "contain",
  },
  hitSanta: {
    position: "absolute",
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
  talkButtonDisabled: {
    backgroundColor: "#6B4A47",
    opacity: 0.9,
  },
  talkButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  debugRankupTrigger: {
    position: "absolute",
    right: 18,
    bottom: 98,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF18",
    borderWidth: 1,
    borderColor: "#FFFFFF22",
  },
  debugRankupTriggerText: {
    color: "#FFFFFFCC",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
