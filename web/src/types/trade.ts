export type TradeType = 'spot' | 'margin';

export type TradeSide = 'long' | 'short';

export type TradeStatus = 'planned' | 'active' | 'closed';

export type TradeLog = {
  id: string;
  date: string;

  tradeType: TradeType;
  symbol: string;
  side: TradeSide;

  currentPrice: number | null;
  entryPrice: number | null;
  stopLossPrice: number | null;
  takeProfitHalfPrice: number | null;
  quantity: number | null;

  entryReason: string;
  duringMemo: string;
  result: string;
  finalReflection: string;

  status: TradeStatus;

  createdAt: string;
  updatedAt: string;
};
