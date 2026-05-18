import type { TradeLog } from '../types/trade';

const GAS_URL_KEY = 'trade-diary-gas-url';

export function getGasUrl(): string {
  return localStorage.getItem(GAS_URL_KEY) ?? '';
}

export function saveGasUrl(url: string): void {
  localStorage.setItem(GAS_URL_KEY, url);
}

export async function exportTradesToSheet(trades: TradeLog[]): Promise<void> {
  const url = getGasUrl();
  if (!url) throw new Error('GAS URLが設定されていません');

  const rows = trades.map((t) => {
    const evaluation =
      t.entryPrice !== null && t.quantity !== null && t.quantity > 0
        ? Math.round(t.entryPrice * t.quantity)
        : '';
    const sideLabel =
      t.tradeType === 'margin'
        ? t.side === 'long'
          ? 'ロング'
          : 'ショート'
        : '';
    const statusLabel =
      t.status === 'planned' ? '予定' : t.status === 'active' ? '保有中' : '終了';

    return [
      t.date,
      t.symbol,
      t.tradeType === 'spot' ? '現物' : '信用',
      sideLabel,
      statusLabel,
      t.entryPrice ?? '',
      t.quantity ?? '',
      evaluation,
      t.stopLossPrice ?? '',
      t.takeProfitHalfPrice ?? '',
      t.entryReason,
      t.duringMemo,
      t.result,
      t.finalReflection,
      t.createdAt,
      t.updatedAt,
    ];
  });

  const payload = { rows };

  // GAS は no-cors で送信（レスポンス読み取り不可だが書き込みは成功する）
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });
}
