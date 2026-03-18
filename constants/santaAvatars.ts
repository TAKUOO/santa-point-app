import { ImageSourcePropType } from "react-native";
import { getCurrentRank } from "./ranks";

const NORMAL_SANTA = require("../assets/rooms/santas/normal-santa.png");
const BRONZE_SANTA = require("../assets/rooms/santas/bronze-santa.png");
const SILVER_SANTA = require("../assets/rooms/santas/silver-santa.png");
const GOLD_SANTA = require("../assets/rooms/santas/gold-santa.png");
const PLATINUM_SANTA = require("../assets/rooms/santas/platinum-santa.png");
const SAPPHIRE_SANTA = require("../assets/rooms/santas/sapphire-santa.png");
const EMERALD_SANTA = require("../assets/rooms/santas/emerald-santa.png");
const RUBY_SANTA = require("../assets/rooms/santas/ruby-santa.png");
// NOTE: ファイル名が daiamond-santa.png になっているため、現状はそれに合わせる
const DIAMOND_SANTA = require("../assets/rooms/santas/daiamond-santa.png");
const RAINBOW_SANTA = require("../assets/rooms/santas/rainbow-santa.png");

export function getSantaAvatarSourceForRankId(rankId: number): ImageSourcePropType {
  switch (rankId) {
    case 1:
      return NORMAL_SANTA;
    case 2:
      return BRONZE_SANTA;
    case 3:
      return SILVER_SANTA;
    case 4:
      return GOLD_SANTA;
    case 5:
      return PLATINUM_SANTA;
    case 6:
      return SAPPHIRE_SANTA;
    case 7:
      return RUBY_SANTA;
    case 8:
      return EMERALD_SANTA;
    case 9:
      return DIAMOND_SANTA;
    case 10:
      return RAINBOW_SANTA;
    default:
      return NORMAL_SANTA;
  }
}

export function getSantaAvatarSourceForRankCount(rankCount: number): ImageSourcePropType {
  const rank = getCurrentRank(rankCount);
  return getSantaAvatarSourceForRankId(rank.id);
}
