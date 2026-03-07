export const MEDAL_THRESHOLDS = [
  10, 25, 50, 80, 120, 170, 230, 300, 380, 470, 570, 680, 800, 930, 1070,
  ...Array.from({ length: 85 }, (_, index) => 1220 + index * 50),
];

export function calculateMedalCount(pointsAllTime: number): number {
  return MEDAL_THRESHOLDS.filter((threshold) => pointsAllTime >= threshold).length;
}
