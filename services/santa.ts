import { ChatMessage, Child, Letter, Santa } from "../types";
import { RANK_MAX_COUNT, RANK_SANTA_IDS, RED_SANTA } from "../constants/santas";
import { getCurrentRank } from "../constants/ranks";

export function createUniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function assignSanta(name: string, birthdate: string): Santa {
  return RED_SANTA;
}

export function getAssignedSantaForRankCount(rankCount: number): Santa {
  const rank = getCurrentRank(rankCount);

  return {
    id: rank.id,
    name: rank.santa.name,
    message: `${rank.name}ランクのサンタだよ。きょうのおはなしをきかせてね！`,
    emoji: "🎅",
  };
}

export function getChildRankIds(child: Child): number[] {
  const legacyRanks = (child as Child & { medals?: number[] }).medals ?? [];
  return Array.isArray(child.ranks) ? child.ranks : legacyRanks;
}

export function getChildRankCount(child: Child): number {
  return getChildRankIds(child).length;
}

export function getRandomPoints(): number {
  return Math.floor(Math.random() * 3) + 1;
}

export function buildSantaReply(
  child: Child,
  _reportText: string,
  points: number,
  wishlistAdded: boolean,
): string {
  const wishlistReplies = [
    "わかったよ！欲しいものに追加して覚えておくね！",
    "おっほっほ！欲しいものリストにのせておくね！",
    "ちゃんとメモしたよ！楽しみにしていてね！",
  ];

  if (wishlistAdded) {
    return `${child.assignedSanta.name}だよ。\n${wishlistReplies[points % wishlistReplies.length]}`;
  }

  const starters = ["おっほっほ！", "わあ、すてきだね！", "それはうれしいおしらせだ！"];
  const praise = [
    `${child.name}ちゃん、きょうもがんばったね！`,
    `${child.name}ちゃん、よくできたね、えらいぞ！`,
    `${child.name}ちゃん、がんばりをきけてサンタもうれしいよ！`,
    `${child.name}ちゃん、そのちょうしだよ！`,
  ];
  const encouragement = [
    `${child.name}ちゃん、これからもいっしょにがんばろうね！`,
    `${child.name}ちゃんの「できた！」はとってもすてきだよ！`,
    "サンタはいつでもみかただよ！",
    "またおはなしをきかせてね！",
  ];
  const closers = [
    `${points}ポイントプレゼントだよ！`,
    `きょうは ${points}ポイントをどうぞ！`,
    `${points}ポイントをサンタからおくるね！`,
  ];
  return [
    `${child.assignedSanta.name}だよ。`,
    starters[points % starters.length],
    praise[points % praise.length],
    encouragement[points % encouragement.length],
    closers[points % closers.length],
  ].join("\n");
}

export function buildSantaSpeechReply(
  child: Child,
  _reportText: string,
  points: number,
  wishlistAdded: boolean,
): string {
  const wishlistReplies = [
    "わかったよ！欲しいものに追加して覚えておくね！",
    "おっほっほ！欲しいものリストにのせておくね！",
    "ちゃんとメモしたよ！楽しみにしていてね！",
  ];

  if (wishlistAdded) {
    return `${child.assignedSanta.name}だよ。${wishlistReplies[points % wishlistReplies.length]}`;
  }

  const starters = ["おっほっほ！", "わあ、すてきだね！", "それはうれしいおしらせだ！"];
  const praise = [
    "きょうもがんばったね！",
    "よくできたね、えらいぞ！",
    "がんばりをきけてサンタもうれしいよ！",
    "そのちょうしだよ！",
  ];
  const encouragement = [
    "これからもいっしょにがんばろうね！",
    "きみの「できた！」はとってもすてきだよ！",
    "サンタはいつでもみかただよ！",
    "またおはなしをきかせてね！",
  ];
  const closers = [
    `${points}ポイントプレゼントだよ！`,
    `きょうは ${points}ポイントをどうぞ！`,
    `${points}ポイントをサンタからおくるね！`,
  ];

  return [
    `${child.assignedSanta.name}だよ。`,
    starters[points % starters.length],
    praise[points % praise.length],
    encouragement[points % encouragement.length],
    closers[points % closers.length],
  ].join("\n");
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
  return [];
}

export function createInitialLetter(childName: string, santa: Santa): Letter {
  return {
    id: createUniqueId("letter"),
    title: "はじめまして！",
    body: buildInitialLetterBody(childName, santa),
    to: "child",
    date: new Date().toISOString(),
    isRead: false,
    kind: "welcome",
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
      body: buildAutumnLetterBody(childName, santa),
      to: "child",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
      isRead: true,
    },
  ];
}

export function createInitialLetters(childName: string, santa: Santa): Letter[] {
  return [createInitialLetter(childName, santa)];
}

export function createInitialChatHistory(santa: Santa): ChatMessage[] {
  return [
    {
      id: createUniqueId("chat"),
      role: "santa",
      text: buildInitialChatMessage(santa),
      timestamp: new Date().toISOString(),
    },
  ];
}

export function syncChildAssignedSanta(child: Child): Child {
  const nextAssignedSanta = getAssignedSantaForRankCount(getChildRankCount(child));
  const chatHistory =
    child.chatHistory.length > 0
      ? child.chatHistory.map((message, index) =>
          index === 0 && message.role === "santa" && message.points == null
            ? { ...message, text: buildInitialChatMessage(nextAssignedSanta) }
            : message,
        )
      : createInitialChatHistory(nextAssignedSanta);
  const letters =
    child.letters.length > 0
      ? child.letters.map((letter) => {
          if (letter.title === "はじめまして！") {
            return { ...letter, body: buildInitialLetterBody(child.name, nextAssignedSanta) };
          }
          if (letter.title === "あきのおたより") {
            return { ...letter, body: buildAutumnLetterBody(child.name, nextAssignedSanta) };
          }
          return letter;
        })
      : createInitialLetters(child.name, nextAssignedSanta);

  return {
    ...child,
    assignedSanta: nextAssignedSanta,
    chatHistory,
    letters,
  };
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
  const rawRanks = getChildRankIds(child);
  const normalizedRanks = rawRanks
    .filter((rankId) => RANK_SANTA_IDS.includes(rankId))
    .slice(0, RANK_MAX_COUNT);
  const normalizedAssignedSanta = getAssignedSantaForRankCount(normalizedRanks.length);
  const normalizedChatHistory =
    child.chatHistory.length > 0 ? child.chatHistory : createInitialChatHistory(normalizedAssignedSanta);

  if (child.lastResetYear === currentYear) {
    return ensureMonthlyLetter(
      syncChildAssignedSanta({
        ...child,
        assignedSanta: normalizedAssignedSanta,
        ranks: normalizedRanks,
        chatHistory: normalizedChatHistory,
      }),
      now,
    );
  }

  return ensureMonthlyLetter(
    syncChildAssignedSanta({
      ...child,
      assignedSanta: normalizedAssignedSanta,
      ranks: normalizedRanks,
      pointsThisYear: 0,
      lastResetYear: currentYear,
      chatHistory: normalizedChatHistory,
    }),
    now,
  );
}

function buildInitialLetterBody(childName: string, santa: Santa): string {
  return `${childName}ちゃん、こんにちは！\nわたしが${santa.name}だよ。\nこれからたのしくおはなししようね！`;
}

function buildAutumnLetterBody(childName: string, santa: Santa): string {
  return `すずしいきせつになってきたね。\n${santa.name}はあたたかいココアをのみながら、${childName}ちゃんのことをおもいだしていたよ。`;
}

function buildInitialChatMessage(santa: Santa): string {
  return `おっほっほ！\nわたしは${santa.name}だよ。\nきょうのことをなんでもおしえてね！`;
}

function ensureMonthlyLetter(child: Child, now: Date): Child {
  const previousMonth = getPreviousMonthRange(now);
  const welcomeLetter = child.letters.find((letter) => letter.kind === "welcome")
    ?? child.letters.find((letter) => letter.title === "はじめまして！");

  if (!welcomeLetter) {
    return child;
  }

  const welcomeDate = new Date(welcomeLetter.date);
  if (Number.isNaN(welcomeDate.getTime()) || welcomeDate > previousMonth.end) {
    return child;
  }

  const alreadySent = child.letters.some((letter) =>
    letter.kind === "monthly" && letter.periodKey === previousMonth.periodKey,
  );
  if (alreadySent) {
    return child;
  }

  return {
    ...child,
    letters: [
      createMonthlyLetter(child, previousMonth.periodKey, now, previousMonth.start, previousMonth.end),
      ...child.letters,
    ],
  };
}

function createMonthlyLetter(
  child: Child,
  periodKey: string,
  now: Date,
  monthStart: Date,
  monthEnd: Date,
): Letter {
  const monthLabel = `${monthStart.getMonth() + 1}月`;
  const childMessages = child.chatHistory.filter((message) =>
    message.role === "child" && isWithinRange(message.timestamp, monthStart, monthEnd),
  );
  const awardedPoints = child.chatHistory
    .filter((message) =>
      message.role === "santa" &&
      typeof message.points === "number" &&
      isWithinRange(message.timestamp, monthStart, monthEnd),
    )
    .reduce((total, message) => total + (message.points ?? 0), 0);
  const topTopics = extractMonthlyTopics(childMessages.map((message) => message.text));

  return {
    id: createUniqueId("letter"),
    title: `${monthLabel}のおてがみ`,
    body: buildMonthlyLetterBody(child, monthLabel, childMessages.length, awardedPoints, topTopics),
    to: "child",
    date: now.toISOString(),
    isRead: false,
    kind: "monthly",
    periodKey,
  };
}

function buildMonthlyLetterBody(
  child: Child,
  monthLabel: string,
  reportCount: number,
  awardedPoints: number,
  topTopics: string[],
): string {
  const topicLine = topTopics.length > 0
    ? `${topTopics.join("や")}のおはなしを、たくさんきかせてくれたね。`
    : "まいにちのいろいろなおはなしを、きかせてくれてうれしかったよ。";

  const activityLine =
    reportCount > 0
      ? `${monthLabel}は ${reportCount}回 おはなししてくれて、${awardedPoints}ポイントたまったよ。`
      : `${monthLabel}はのんびりペースだったけれど、サンタはいつでもおはなしをまっているよ。`;

  return [
    `${child.name}ちゃん、${monthLabel}もありがとう！`,
    topicLine,
    activityLine,
    `${child.assignedSanta.name}は、${child.name}ちゃんのがんばりをちゃんとみているよ。`,
    "またたのしいおはなしをきかせてね！",
  ].join("\n");
}

function getPreviousMonthRange(now: Date): {
  start: Date;
  end: Date;
  periodKey: string;
} {
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return {
    start,
    end,
    periodKey: `${year}-${String(month + 1).padStart(2, "0")}`,
  };
}

function isWithinRange(timestamp: string, start: Date, end: Date): boolean {
  const date = new Date(timestamp);
  return !Number.isNaN(date.getTime()) && date >= start && date <= end;
}

function extractMonthlyTopics(texts: string[]): string[] {
  const stopWords = new Set([
    "きょう", "今日は", "した", "したよ", "したよー", "できた", "できたよ", "がんばった",
    "ちゃん", "ぼく", "わたし", "サンタ", "サンタさん", "こと", "もの", "たのしい",
  ]);
  const counts = new Map<string, number>();

  texts.forEach((text) => {
    const normalized = text
      .replace(/[！!。？?、,\n]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2 && !stopWords.has(token));

    normalized.forEach((token) => {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([token]) => token);
}
