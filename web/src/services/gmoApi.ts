const GMO_API_BASE = '/gmo-api/public';

export const SPOT_SYMBOLS = ['BTC', 'ETH', 'XRP', 'DOGE', 'SOL', 'ADA'] as const;

export const MARGIN_SYMBOLS = [
  'BTC_JPY',
  'ETH_JPY',
  'XRP_JPY',
  'DOGE_JPY',
  'SOL_JPY',
  'ADA_JPY',
] as const;

export async function fetchCurrentPrice(symbol: string): Promise<number> {
  const res = await fetch(`${GMO_API_BASE}/v1/ticker?symbol=${symbol}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 0) throw new Error(`API error: ${json.messages?.[0]?.message}`);
  const last = json.data?.[0]?.last;
  if (!last) throw new Error('No price data');
  return Number(last);
}
