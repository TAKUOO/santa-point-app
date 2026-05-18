import { useState } from 'react';
import type { TradeLog, TradeStatus } from '../types/trade';
import { saveTrade, deleteTrade } from '../services/storage';

const STATUS_OPTIONS: { value: TradeStatus; label: string }[] = [
  { value: 'planned', label: '予定' },
  { value: 'active', label: '保有中' },
  { value: 'closed', label: '終了' },
];

function baseCurrency(symbol: string): string {
  return symbol.split('_')[0];
}

type Props = {
  trade: TradeLog;
  onBack: () => void;
  onUpdated: () => void;
};

export function TradeDetail({ trade, onBack, onUpdated }: Props) {
  const [entryReason, setEntryReason] = useState(trade.entryReason);
  const [duringMemo, setDuringMemo] = useState(trade.duringMemo);
  const [result, setResult] = useState(trade.result);
  const [finalReflection, setFinalReflection] = useState(trade.finalReflection);
  const [status, setStatus] = useState<TradeStatus>(trade.status);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const evaluationAmount =
    trade.entryPrice !== null && trade.quantity !== null && trade.quantity > 0
      ? trade.entryPrice * trade.quantity
      : null;

  const handleSave = () => {
    saveTrade({
      ...trade,
      entryReason,
      duringMemo,
      result,
      finalReflection,
      status,
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onUpdated();
      onBack();
    }, 800);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTrade(trade.id);
    onUpdated();
    onBack();
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-base font-medium text-gray-700 mb-1.5';

  return (
    <div className="space-y-4">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium"
        >
          ← 一覧へ
        </button>
        <h2 className="text-xl font-bold text-gray-800">{trade.symbol} 詳細</h2>
      </div>

      {/* Info grid */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">トレード情報</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium">日付</p>
            <p className="text-base font-semibold text-gray-800 mt-0.5">{trade.date}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">取引種別</p>
            <p className="text-base font-semibold text-gray-800 mt-0.5">
              {trade.tradeType === 'spot' ? '現物' : '信用'}
            </p>
          </div>
          {trade.tradeType === 'margin' && (
            <div>
              <p className="text-xs text-gray-400 font-medium">方向</p>
              <p className={`text-base font-bold mt-0.5 ${trade.side === 'long' ? 'text-emerald-600' : 'text-red-500'}`}>
                {trade.side === 'long' ? 'ロング' : 'ショート'}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 font-medium">エントリー価格</p>
            <p className="text-base font-semibold text-gray-800 mt-0.5">
              {trade.entryPrice !== null ? `${trade.entryPrice.toLocaleString()} 円` : '---'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">数量</p>
            <p className="text-base font-semibold text-gray-800 mt-0.5">
              {trade.quantity !== null
                ? `${trade.quantity.toLocaleString()} ${baseCurrency(trade.symbol)}`
                : '---'}
            </p>
          </div>
          {evaluationAmount !== null && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 font-medium">評価額</p>
              <p className="text-xl font-bold text-blue-600 mt-0.5">
                {Math.round(evaluationAmount).toLocaleString()} 円
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 font-medium">損切り価格</p>
            <p className="text-base font-semibold text-red-500 mt-0.5">
              {trade.stopLossPrice !== null ? `${trade.stopLossPrice.toLocaleString()} 円` : '---'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">利確50%予定</p>
            <p className="text-base font-semibold text-emerald-600 mt-0.5">
              {trade.takeProfitHalfPrice !== null
                ? `${trade.takeProfitHalfPrice.toLocaleString()} 円`
                : '---'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">記録・更新</p>

        {/* ステータス */}
        <div>
          <label className={labelClass}>ステータス</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TradeStatus)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* エントリー理由 */}
        <div>
          <label className={labelClass}>エントリー理由</label>
          <textarea
            value={entryReason}
            onChange={(e) => setEntryReason(e.target.value)}
            rows={3}
            placeholder="エントリー理由を入力"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 途中メモ */}
        <div>
          <label className={labelClass}>途中メモ</label>
          <textarea
            value={duringMemo}
            onChange={(e) => setDuringMemo(e.target.value)}
            rows={3}
            placeholder="保有中の気づきなど"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 結果 */}
        <div>
          <label className={labelClass}>結果</label>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={3}
            placeholder="トレード結果を入力"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 最終反省 */}
        <div>
          <label className={labelClass}>最終反省</label>
          <textarea
            value={finalReflection}
            onChange={(e) => setFinalReflection(e.target.value)}
            rows={4}
            placeholder="反省点・学びを入力"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saved ? '✓ 保存しました！' : '更新して閉じる'}
          </button>
          <button
            onClick={handleDelete}
            className={`px-4 py-3 rounded-lg text-base font-semibold border transition-colors ${
              confirmDelete
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'text-red-500 border-red-300 hover:bg-red-50'
            }`}
          >
            {confirmDelete ? '本当に削除する' : '🗑 削除'}
          </button>
        </div>
      </div>
    </div>
  );
}
