export type Santa = {
  id: number;
  name: string;
  message: string;
  emoji: string;
};

export type ChatMessage = {
  id: string;
  role: "child" | "santa";
  text: string;
  points?: number;
  timestamp: string;
};

export type Letter = {
  id: string;
  title: string;
  body: string;
  to: "child" | "parent";
  date: string;
  isRead: boolean;
  kind?: "welcome" | "monthly" | "event";
  periodKey?: string;
};

export type Child = {
  id: string;
  name: string;
  birthdate: string;
  assignedSanta: Santa;
  pointsThisYear: number;
  pointsAllTime: number;
  ranks: number[];
  wishlist: string[];
  chatHistory: ChatMessage[];
  letters: Letter[];
  lastResetYear: number;
};
