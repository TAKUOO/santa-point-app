import { RoomTimeSlot } from "../services/santa";

export type AvailableRoomRankKey = "normal" | "bronze" | "silver" | "gold";
export type RoomScenePresentation = {
  scale: number;
};

const ROOM_SCENES: Record<AvailableRoomRankKey, Record<RoomTimeSlot, number>> = {
  normal: {
    lateNight: require("../assets/generated/rooms/normal/normal-santa-late-night.png"),
    morning: require("../assets/generated/rooms/normal/normal-santa-morning.png"),
    daytime: require("../assets/generated/rooms/normal/normal-santa-daytime.png"),
    night: require("../assets/generated/rooms/normal/normal-santa-night.png"),
  },
  bronze: {
    lateNight: require("../assets/generated/rooms/bronze/bronze-santa-late-night.png"),
    morning: require("../assets/generated/rooms/bronze/bronze-santa-morning.png"),
    daytime: require("../assets/generated/rooms/bronze/bronze-santa-daytime.png"),
    night: require("../assets/generated/rooms/bronze/bronze-santa-night.png"),
  },
  silver: {
    lateNight: require("../assets/generated/rooms/silver/silver-santa-late-night.png"),
    morning: require("../assets/generated/rooms/silver/silver-santa-morning.png"),
    daytime: require("../assets/generated/rooms/silver/silver-santa-daytime.png"),
    night: require("../assets/generated/rooms/silver/silver-santa-night.png"),
  },
  gold: {
    lateNight: require("../assets/generated/rooms/gold/gold-santa-late-night.png"),
    morning: require("../assets/generated/rooms/gold/gold-santa-morning.png"),
    daytime: require("../assets/generated/rooms/gold/gold-santa-daytime.png"),
    night: require("../assets/generated/rooms/gold/gold-santa-night.png"),
  },
};

export function getAvailableRoomRankKey(rankId: number): AvailableRoomRankKey {
  if (rankId >= 4) {
    return "gold";
  }
  if (rankId === 3) {
    return "silver";
  }
  if (rankId === 2) {
    return "bronze";
  }
  return "normal";
}

export function getRoomSceneSource(rankId: number, timeSlot: RoomTimeSlot): number {
  const roomRankKey = getAvailableRoomRankKey(rankId);
  return ROOM_SCENES[roomRankKey][timeSlot];
}

export function getRoomScenePresentation(rankId: number): RoomScenePresentation {
  const roomRankKey = getAvailableRoomRankKey(rankId);

  switch (roomRankKey) {
    case "normal":
      return { scale: 0.96 };
    default:
      return { scale: 1 };
  }
}
