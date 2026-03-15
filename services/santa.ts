import { ChatMessage, Child, Letter, Santa } from "../types";
import { MEDAL_MAX_COUNT, MEDAL_SANTA_IDS, RED_SANTA } from "../constants/santas";

export function createUniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function assignSanta(name: string, birthdate: string): Santa {
  return RED_SANTA;
}

export function getRandomPoints(): number {
  return Math.floor(Math.random() * 3) + 1;
}

export function buildSantaReply(
  child: Child,
  reportText: string,
  points: number,
  wishlistAdded: boolean,
): string {
  const wishlistReplies = [
    "わかったよ！欲しいものに追加して覚えておくね！",
    "おっほっほ！欲しいものリストにのせておくね！",
    "ちゃんとメモしたよ！楽しみにしていてね！",
  ];

  if (wishlistAdded) {
    return wishlistReplies[points % wishlistReplies.length];
  }

  const starters = [
    "おっほっほ！",
    "わあ、すてきだね！",
    "それはうれしいおしらせだ！",
    "ちゃんときかせてくれてありがとう！",
  ];
  const praise = [
    `${child.name}ちゃん、よくがんばったね！`,
    `${child.name}ちゃんって、ほんとうにえらいね！`,
    `そんなおはなしがきけてうれしいよ！`,
    `きみの「できた！」はとてもすてきだよ！`,
  ];
  const closers = [
    `${points}ポイントプレゼントだよ！`,
    `きょうは ${points}ポイントをどうぞ！`,
    `${points}ポイントをサンタからおくるね！`,
  ];

  const mention =
    reportText.length > 18
      ? "たくさんおしえてくれてありがとう！"
      : `${reportText}っておはなししてくれたんだね！`;

  return [starters[points % starters.length], praise[points % praise.length], mention, closers[points % closers.length]].join(
    "\n",
  );
}

export function extractWishlistItem(text: string): string | null {
  const normalized = text.replace(/[！!。？?]/g, " ").trim();
  const patterns = [
    /(.+?)\s*(が|を)?\s*(ほしい|欲しい)/,
    /(.+?)\s*(を)?\s*(おねがい|お願い)(したい|します)?/,
    /(.+?)\s*(を)?\s*(ください|ちょうだい)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const rawItem = match?.[1]?.trim();
    if (!rawItem) {
      continue;
    }

    const cleaned = rawItem
      .replace(/^(サンタさんに|サンタさんへ|こんど|今日|きょう)/, "")
      .replace(/^(ぼくは|わたしは|ぼくの|わたしの)/, "")
      .trim();

    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  return null;
}

export function createInitialWishlist(): string[] {
  return ["ゲームソフト", "プリンセスのドレス", "サッカーボール"];
}

export function createInitialLetter(childName: string, santa: Santa): Letter {
  return {
    id: createUniqueId("letter"),
    title: "はじめまして！",
    body: `${childName}ちゃん、こんにちは！\nわたしが${santa.name}だよ。\n${santa.message}`,
    to: "child",
    date: new Date().toISOString(),
    isRead: false,
  };
}

export function createDemoLetters(childName: string, santa: Santa): Letter[] {
  return [
    createInitialLetter(childName, santa),
    {
      id: createUniqueId("letter"),
      title: "きょうもありがとう",
      body: `${childName}ちゃん、きのうもおはなししてくれてありがとう。\nちいさな「できた！」をサンタはちゃんとみているよ。`,
      to: "child",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      isRead: true,
    },
    {
      id: createUniqueId("letter"),
      title: "あきのおたより",
      body: `すずしいきせつになってきたね。\n${santa.name}はあたたかいココアをのみながら、${childName}ちゃんのことをおもいだしていたよ。`,
      to: "child",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
      isRead: true,
    },
  ];
}

export function createInitialChatHistory(santa: Santa): ChatMessage[] {
  return [
    {
      id: createUniqueId("chat"),
      role: "santa",
      text: `おっほっほ！\nわたしは${santa.name}だよ。\nきょうのことをなんでもおしえてね！`,
      timestamp: new Date().toISOString(),
    },
  ];
}

export function daysUntilChristmas(baseDate = new Date()): number {
  const christmas = new Date(baseDate.getFullYear(), 11, 25);
  const targetDate =
    baseDate > christmas ? new Date(baseDate.getFullYear() + 1, 11, 25) : christmas;

  return Math.max(
    0,
    Math.ceil((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export type RoomTimeSlot = "lateNight" | "morning" | "daytime" | "night";

export function getRoomTimeSlot(date = new Date()): RoomTimeSlot {
  const hour = date.getHours();

  if (hour < 6 || hour >= 23) {
    return "lateNight";
  }
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "daytime";
  }
  return "night";
}

export function getRoomStateLabel(date = new Date()): string {
  const slot = getRoomTimeSlot(date);

  switch (slot) {
    case "lateNight":
      return "ぐっすりねているよ";
    case "morning":
      return "あさのじかんをすごしているよ";
    case "daytime":
      return "プレゼントをつくっているよ";
    case "night":
      return "よるのじかんをすごしているよ";
    default:
      return "よるのじかんをすごしているよ";
  }
}

export function normalizeChildForCurrentYear(child: Child, now = new Date()): Child {
  const currentYear = now.getFullYear();
  const normalizedMedals = child.medals
    .filter((medalId) => MEDAL_SANTA_IDS.includes(medalId))
    .slice(0, MEDAL_MAX_COUNT);
  const normalizedChatHistory =
    child.chatHistory.length > 0 ? child.chatHistory : createInitialChatHistory(child.assignedSanta);

  if (child.lastResetYear === currentYear) {
    return {
      ...child,
      medals: normalizedMedals,
      chatHistory: normalizedChatHistory,
    };
  }

  return {
    ...child,
    medals: normalizedMedals,
    pointsThisYear: 0,
    lastResetYear: currentYear,
    chatHistory: normalizedChatHistory,
  };
}
