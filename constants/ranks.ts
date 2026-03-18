export const RANK_THRESHOLDS = [
  20, 60, 120, 220, 360, 560, 840, 1220, 1750, 2500,
];

/** 各ランクに対応するサンタ */
export type RankSanta = {
  id: number;
  name: string;
  /** ランク画像生成用の短い説明（nanobananaプロンプト用） */
  descriptionForImage: string;
};

export type SantaRank = {
  id: number;
  name: string;
  icon: string;
  /** このランクに対応するサンタ */
  santa: RankSanta;
};

const RANK_SANTAS: RankSanta[] = [
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

export const SANTA_RANKS: SantaRank[] = [
  { id: 1, name: "ノーマル", icon: "⚪", santa: RANK_SANTAS[0] },
  { id: 2, name: "ブロンズ", icon: "🥉", santa: RANK_SANTAS[1] },
  { id: 3, name: "シルバー", icon: "🥈", santa: RANK_SANTAS[2] },
  { id: 4, name: "ゴールド", icon: "🥇", santa: RANK_SANTAS[3] },
  { id: 5, name: "プラチナ", icon: "💠", santa: RANK_SANTAS[4] },
  { id: 6, name: "サファイア", icon: "🔷", santa: RANK_SANTAS[5] },
  { id: 7, name: "ルビー", icon: "🔴", santa: RANK_SANTAS[6] },
  { id: 8, name: "エメラルド", icon: "🟢", santa: RANK_SANTAS[7] },
  { id: 9, name: "ダイヤ", icon: "💎", santa: RANK_SANTAS[8] },
  { id: 10, name: "にじいろ", icon: "🌈", santa: RANK_SANTAS[9] },
];

export function calculateRankCount(pointsAllTime: number): number {
  return RANK_THRESHOLDS.filter((threshold) => pointsAllTime >= threshold).length;
}

export function getCurrentRank(rankCount: number): SantaRank {
  const index = Math.min(Math.max(0, rankCount), SANTA_RANKS.length - 1);
  return SANTA_RANKS[index];
}
