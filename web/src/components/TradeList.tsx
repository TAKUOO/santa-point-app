import type { TradeLog, TradeStatus } from '../types/trade';

const STATUS_LABEL: Record<TradeStatus, string> = {
  planned: '予定',
  active: '保有中',
  closed: '終了',
};

const STATUS_CLASS: Record<TradeStatus, string> = {
  planned: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-500',
};

function baseCurrency(symbol: string): string {
  return symbol.split('_')[0];
}

type Props = {
  trades: TradeLog[];
  onSelect: (trade: TradeLog) => void;
};

export function TradeList({ trades, onSelect }: Props) {
  if (trades.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">
        <p className="text-base">まだトレード記録がありません。</p>
        <p className="text-sm mt-1">「新規記録」ボタンから始めましょう。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trades.map((t) => {
        const evaluationAmount =
          t.entryPrice !== null && t.quantity !== null && t.quantity > 0
            ? t.entryPrice * t.quantity
            : null;

        return (
          <button
            key={t.id}
            className="w-full text-left"
            onClick={() => onSelect(t)}
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{t.symbol}</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">{t.date}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {t.tradeType === 'spot' ? '現物' : '信用'}
                </span>
                {t.tradeType === 'margin' && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.side === 'long' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {t.side === 'long' ? 'ロング' : 'ショート'}
                  </span>
                )}
              </div>

              {/* Price grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium">エントリー</p>
                  <p className="text-base font-semibold text-gray-800">
                    {t.entryPrice !== null ? t.entryPrice.toLocaleString() : '---'} 円
                  </p>
                </div>
                {t.quantity !== null && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium">数量</p>
                    <p className="text-base font-semibold text-gray-800">
                      {t.quantity.toLocaleString()} {baseCurrency(t.symbol)}
                    </p>
                  </div>
                )}
                {evaluationAmount !== null && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium">評価額</p>
                    <p className="text-base font-bold text-blue-600">
                      {Math.round(evaluationAmount).toLocaleString()} 円
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-medium">損切り</p>
                  <p className="text-base font-semibold text-red-500">
                    {t.stopLossPrice !== null ? t.stopLossPrice.toLocaleString() : '---'} 円
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">利確50%</p>
                  <p className="text-base font-semibold text-emerald-600">
                    {t.takeProfitHalfPrice !== null ? t.takeProfitHalfPrice.toLocaleString() : '---'} 円
                  </p>
                </div>
              </div>

              {/* Memos */}
              {(t.entryReason || t.duringMemo || t.result || t.finalReflection) && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  {t.entryReason && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">エントリー理由</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{t.entryReason}</p>
                    </div>
                  )}
                  {t.duringMemo && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">途中メモ</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{t.duringMemo}</p>
                    </div>
                  )}
                  {t.result && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">結果</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{t.result}</p>
                    </div>
                  )}
                  {t.finalReflection && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">最終反省</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{t.finalReflection}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
