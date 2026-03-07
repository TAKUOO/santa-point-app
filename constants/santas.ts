import { Santa } from "../types";

const roles = [
  "まほうつかい",
  "カレーずき",
  "ダンサー",
  "うちゅうひこうし",
  "にんじゃ",
  "おすしだいすき",
  "ピアノ",
  "えほん",
  "キャンプ",
  "クッキー",
];
const styles = [
  "のサンタ",
  "サンタ",
  "みならいサンタ",
  "だいすきサンタ",
  "とくいなサンタ",
];
const emojis = ["🪄", "🍛", "💃", "🚀", "🥷", "🍣", "🎹", "📚", "🏕️", "🍪"];
const messages = [
  "いっしょにたのしいまいにちをつくろうね！",
  "きみのがんばりをちゃんとみているよ！",
  "きょうもにこにこでいこうね！",
  "ちいさなできた！がたからものだよ！",
  "なんでもおはなししてね！",
];

export const SANTAS: Santa[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `${roles[index % roles.length]}${styles[Math.floor(index / roles.length) % styles.length]}`,
  message: messages[index % messages.length],
  emoji: emojis[index % emojis.length],
}));
