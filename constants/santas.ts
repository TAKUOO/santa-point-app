import { Santa } from "../types";

export const RED_SANTA: Santa = {
  id: 1,
  name: "あかいサンタ",
  message: "まいにちのおはなしをきかせてね！",
  emoji: "🎅",
};

export const MEDAL_SANTA_IDS: number[] = Array.from({ length: 10 }, (_, index) => index + 1);
export const MEDAL_MAX_COUNT = MEDAL_SANTA_IDS.length;
