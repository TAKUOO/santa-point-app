import type { TradeLog } from '../types/trade';

const STORAGE_KEY = 'trade-diary-logs';

function load(): TradeLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TradeLog[]) : [];
  } catch {
    return [];
  }
}

function save(logs: TradeLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function getAllTrades(): TradeLog[] {
  return load().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveTrade(log: TradeLog): void {
  const logs = load();
  const idx = logs.findIndex((l) => l.id === log.id);
  const now = new Date().toISOString();
  if (idx >= 0) {
    logs[idx] = { ...log, updatedAt: now };
  } else {
    logs.push({ ...log, createdAt: now, updatedAt: now });
  }
  save(logs);
}

export function deleteTrade(id: string): void {
  save(load().filter((l) => l.id !== id));
}
