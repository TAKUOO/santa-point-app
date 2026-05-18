import { useState, useCallback } from 'react';
import type { TradeLog, TradeSide, TradeType } from '../types/trade';
import { fetchCurrentPrice, SPOT_SYMBOLS, MARGIN_SYMBOLS } from '../services/gmoApi';
import { saveTrade } from '../services/storage';

function formatDateForInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateForStorage(val: string): string {
  return val.replace('T', ' ');
}

function calcStopLoss(price: number, side: TradeSide): number {
  return Number((side === 'long' ? price * 0.99 : price * 1.01).toFixed(3));
}

function baseCurrency(symbol: string): string {
  return symbol.split('_')[0];
}

type RiskReward = {
  riskPct: string;
  rewardPct: string;
  rr: string;
} | null;

function calcRiskReward(
  entry: number,
  stopLoss: number,
  takeProfit: number,
  side: TradeSide
): RiskReward {
  if (!entry || !stopLoss || !takeProfit) return null;
  const risk = side === 'long' ? entry - stopLoss : stopLoss - entry;
  const reward = side === 'long' ? takeProfit - entry : entry - takeProfit;
  if (risk <= 0 || reward <= 0) return null;
  const rr = reward / risk;
  return {
    riskPct: ((risk / entry) * 100).toFixed(2),
    rewardPct: ((reward / entry) * 100).toFixed(2),
    rr: rr.toFixed(2),
  };
}

type Props = {
  onSaved: () => void;
};

export function NewTradeForm({ onSaved }: Props) {
  const now = new Date();
  const [date, setDate] = useState(formatDateForInput(now));
  const [tradeType, setTradeType] = useState<TradeType>('spot');
  const [symbol, setSymbol] = useState<string>('BTC');
  const [side, setSide] = useState<TradeSide>('long');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [takeProfitHalfPrice, setTakeProfitHalfPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [entryReason, setEntryReason] = useState('');
  const [priceError, setPriceError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleTradeTypeChange = (t: TradeType) => {
    setTradeType(t);
    if (t === 'spot') {
      setSide('long');
      setSymbol('BTC');
    } else {
      setSymbol('BTC_JPY');
    }
    setCurrentPrice(null);
    setEntryPrice('');
    setStopLossPrice('');
  };

  const handleFetchPrice = useCallback(async () => {
    setLoading(true);
    setPriceError('');
    try {
      const price = await fetchCurrentPrice(symbol);
      setCurrentPrice(price);
      setEntryPrice(String(price));
      setStopLossPrice(String(calcStopLoss(price, side)));
    } catch {
      setPriceError('価格取得に失敗しました。手入力してください。');
      setCurrentPrice(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, side]);

  const handleSideChange = (newSide: TradeSide) => {
    setSide(newSide);
    const ep = parseFloat(entryPrice);
    if (!isNaN(ep)) {
      setStopLossPrice(String(calcStopLoss(ep, newSide)));
    }
  };

  const handleEntryPriceChange = (val: string) => {
    setEntryPrice(val);
    const ep = parseFloat(val);
    if (!isNaN(ep)) {
      setStopLossPrice(String(calcStopLoss(ep, side)));
    }
  };

  const ep = parseFloat(entryPrice);
  const sl = parseFloat(stopLossPrice);
  const tp = parseFloat(takeProfitHalfPrice);
  const qty = parseFloat(quantity);
  const evaluationAmount = !isNaN(ep) && !isNaN(qty) && qty > 0 ? ep * qty : null;
  const rr = !isNaN(ep) && !isNaN(sl) && !isNaN(tp) ? calcRiskReward(ep, sl, tp, side) : null;

  const handleSubmit = () => {
    const log: TradeLog = {
      id: crypto.randomUUID(),
      date: formatDateForStorage(date),
      tradeType,
      symbol,
      side,
      currentPrice,
      entryPrice: isNaN(ep) ? null : ep,
      stopLossPrice: isNaN(sl) ? null : sl,
      takeProfitHalfPrice: isNaN(tp) ? null : tp,
      quantity: isNaN(qty) ? null : qty,
      entryReason,
      duringMemo: '',
      result: '',
      finalReflection: '',
      status: 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTrade(log);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved();
    }, 800);
  };

  const symbols = tradeType === 'spot' ? SPOT_SYMBOLS : MARGIN_SYMBOLS;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-base font-medium text-gray-700 mb-1.5';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
      <h2 className="text-xl font-bold text-gray-800">新規トレード記録</h2>

      {/* 日付 */}
      <div>
        <label className={labelClass}>日付</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* 取引種別 */}
      <div>
        <label className={labelClass}>取引種別</label>
        <div className="flex gap-6">
          {(['spot', 'margin'] as TradeType[]).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer text-base">
              <input
                type="radio"
                name="tradeType"
                value={t}
                checked={tradeType === t}
                onChange={() => handleTradeTypeChange(t)}
                className="w-4 h-4 accent-blue-600"
              />
              {t === 'spot' ? '現物' : '信用'}
            </label>
          ))}
        </div>
      </div>

      {/* 銘柄 */}
      <div>
        <label className={labelClass}>銘柄</label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className={inputClass}
        >
          {symbols.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* 方向（信用のみ） */}
      {tradeType === 'margin' && (
        <div>
          <label className={labelClass}>方向</label>
          <div className="flex gap-6">
            {(['long', 'short'] as TradeSide[]).map((s) => (
              <label key={s} className={`flex items-center gap-2 cursor-pointer text-base font-medium ${s === 'long' ? 'text-emerald-600' : 'text-red-500'}`}>
                <input
                  type="radio"
                  name="side"
                  value={s}
                  checked={side === s}
                  onChange={() => handleSideChange(s)}
                  className="w-4 h-4 accent-blue-600"
                />
                {s === 'long' ? 'ロング' : 'ショート'}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 現在価格 */}
      <div>
        <label className={labelClass}>現在価格</label>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-800 min-w-[160px]">
            {currentPrice !== null ? `${currentPrice.toLocaleString()} 円` : '---'}
          </span>
          <button
            type="button"
            onClick={handleFetchPrice}
            disabled={loading}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '取得中...' : '🔄 価格を更新'}
          </button>
        </div>
        {priceError && (
          <p className="text-sm text-red-500 mt-1">{priceError}</p>
        )}
      </div>

      {/* エントリー価格 */}
      <div>
        <label className={labelClass}>エントリー価格</label>
        <input
          type="number"
          value={entryPrice}
          onChange={(e) => handleEntryPriceChange(e.target.value)}
          placeholder="価格を入力"
          className={inputClass}
        />
      </div>

      {/* 数量 */}
      <div>
        <label className={labelClass}>数量（{baseCurrency(symbol)}）</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="数量を入力"
          min="0"
          step="any"
          className={inputClass}
        />
        {evaluationAmount !== null && (
          <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <span className="text-sm font-medium text-blue-600">評価額</span>
            <span className="text-lg font-bold text-blue-700 ml-auto">
              {Math.round(evaluationAmount).toLocaleString()} 円
            </span>
          </div>
        )}
      </div>

      {/* 損切り価格 */}
      <div>
        <label className={`${labelClass} text-red-600`}>損切り価格</label>
        <input
          type="number"
          value={stopLossPrice}
          onChange={(e) => setStopLossPrice(e.target.value)}
          placeholder="価格を入力"
          className="w-full border border-red-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        />
      </div>

      {/* 利確価格 */}
      <div>
        <label className={`${labelClass} text-emerald-600`}>利確50%予定価格</label>
        <input
          type="number"
          value={takeProfitHalfPrice}
          onChange={(e) => setTakeProfitHalfPrice(e.target.value)}
          placeholder="価格を入力"
          className="w-full border border-emerald-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        />
      </div>

      {/* リスクリワード */}
      {rr && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">リスクリワード分析</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-red-50 border border-red-100 rounded-lg px-2 py-3">
              <p className="text-sm text-red-500 font-medium">損切り幅</p>
              <p className="text-lg font-bold text-red-600">-{rr.riskPct}%</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-3">
              <p className="text-sm text-emerald-500 font-medium">利確幅</p>
              <p className="text-lg font-bold text-emerald-600">+{rr.rewardPct}%</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-3">
              <p className="text-sm text-blue-500 font-medium">RR比</p>
              <p className="text-lg font-bold text-blue-700">1 : {rr.rr}</p>
            </div>
          </div>
        </div>
      )}

      {/* エントリー理由 */}
      <div>
        <label className={labelClass}>エントリー理由</label>
        <textarea
          value={entryReason}
          onChange={(e) => setEntryReason(e.target.value)}
          placeholder="ここに入力"
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={saved}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saved ? '✓ 保存しました！' : '保存'}
      </button>
    </div>
  );
}
