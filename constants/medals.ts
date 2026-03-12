export const MEDAL_THRESHOLDS = [
  20, 60, 120, 220, 360, 560, 840, 1220, 1750, 2500,
];

/** メダル絵柄に描かれるサンタ（各ランク1体） */
export type MedalSanta = {
  id: number;
  name: string;
  /** メダル画像生成用の短い説明（nanobananaプロンプト用） */
  descriptionForImage: string;
};

export type MedalRank = {
  id: number;
  name: string;
  icon: string;
  /** このランクのメダルに描くサンタ */
  santa: MedalSanta;
};

const MEDAL_SANTAS: MedalSanta[] = [
  { id: 1, name: "ノーマルサンタ", descriptionForImage: "normal classic red clay santa" },
  { id: 2, name: "ブロンズサンタ", descriptionForImage: "bronze copper colored clay santa" },
  { id: 3, name: "シルバーサンタ", descriptionForImage: "silver shiny metallic clay santa" },
  { id: 4, name: "ゴールドサンタ", descriptionForImage: "golden shiny metallic clay santa" },
  { id: 5, name: "プラチナサンタ", descriptionForImage: "platinum pearlescent clay santa" },
  { id: 6, name: "サファイアサンタ", descriptionForImage: "sapphire blue gem-like clay santa" },
  { id: 7, name: "ルビーサンタ", descriptionForImage: "ruby red gem-like clay santa" },
  { id: 8, name: "エメラルドサンタ", descriptionForImage: "emerald green gem-like clay santa" },
  { id: 9, name: "ダイヤサンタ", descriptionForImage: "diamond crystal sparkle clay santa" },
  { id: 10, name: "にじいろサンタ", descriptionForImage: "rainbow prismatic iridescent clay santa" },
];

export const MEDAL_RANKS: MedalRank[] = [
  { id: 1, name: "ノーマル", icon: "⚪", santa: MEDAL_SANTAS[0] },
  { id: 2, name: "ブロンズ", icon: "🥉", santa: MEDAL_SANTAS[1] },
  { id: 3, name: "シルバー", icon: "🥈", santa: MEDAL_SANTAS[2] },
  { id: 4, name: "ゴールド", icon: "🥇", santa: MEDAL_SANTAS[3] },
  { id: 5, name: "プラチナ", icon: "💠", santa: MEDAL_SANTAS[4] },
  { id: 6, name: "サファイア", icon: "🔷", santa: MEDAL_SANTAS[5] },
  { id: 7, name: "ルビー", icon: "🔴", santa: MEDAL_SANTAS[6] },
  { id: 8, name: "エメラルド", icon: "🟢", santa: MEDAL_SANTAS[7] },
  { id: 9, name: "ダイヤ", icon: "💎", santa: MEDAL_SANTAS[8] },
  { id: 10, name: "にじいろ", icon: "🌈", santa: MEDAL_SANTAS[9] },
];

export function calculateMedalCount(pointsAllTime: number): number {
  return MEDAL_THRESHOLDS.filter((threshold) => pointsAllTime >= threshold).length;
}

export function getCurrentMedalRank(medalCount: number): MedalRank {
  const index = Math.min(Math.max(0, medalCount), MEDAL_RANKS.length - 1);
  return MEDAL_RANKS[index];
}
