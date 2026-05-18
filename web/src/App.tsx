import { useState, useEffect, useCallback } from 'react';
import { NewTradeForm } from './components/NewTradeForm';
import { TradeList } from './components/TradeList';
import { TradeDetail } from './components/TradeDetail';
import { SettingsModal } from './components/SettingsModal';
import { getAllTrades } from './services/storage';
import { getGasUrl, exportTradesToSheet } from './services/gasApi';
import type { TradeLog } from './types/trade';
import './index.css';

type View = 'list' | 'new' | 'detail';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<TradeLog | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<'success' | 'error' | null>(null);

  const refreshTrades = useCallback(() => {
    setTrades(getAllTrades());
  }, []);

  useEffect(() => {
    refreshTrades();
  }, [refreshTrades]);

  const handleSelectTrade = (trade: TradeLog) => {
    setSelectedTrade(trade);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedTrade(null);
    setView('list');
  };

  const handleSaved = () => {
    refreshTrades();
    setView('list');
  };

  const handleExport = async () => {
    if (!getGasUrl()) {
      setShowSettings(true);
      return;
    }
    setExporting(true);
    setExportResult(null);
    try {
      await exportTradesToSheet(trades);
      setExportResult('success');
    } catch {
      setExportResult('error');
    } finally {
      setExporting(false);
      setTimeout(() => setExportResult(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <button
            className="text-xl font-bold text-gray-800 hover:text-gray-600 shrink-0"
            onClick={handleBack}
          >
            📓 トレード日記
          </button>

          <div className="flex items-center gap-2">
            {/* スプシ送信ボタン */}
            {view === 'list' && trades.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                  exportResult === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : exportResult === 'error'
                    ? 'bg-red-50 text-red-600 border-red-300'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {exportResult === 'success'
                  ? '✓ 送信完了'
                  : exportResult === 'error'
                  ? '⚠ 送信失敗'
                  : exporting
                  ? '送信中...'
                  : '📊 スプシへ送信'}
              </button>
            )}

            {/* 設定ボタン */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              title="設定"
            >
              ⚙️
            </button>

            {/* 新規記録ボタン */}
            {view !== 'new' && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={() => setView('new')}
              >
                ＋ 新規記録
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {view === 'new' && (
          <NewTradeForm onSaved={handleSaved} />
        )}
        {view === 'list' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              保存済みトレード一覧
            </h2>
            <TradeList trades={trades} onSelect={handleSelectTrade} />
          </div>
        )}
        {view === 'detail' && selectedTrade && (
          <TradeDetail
            trade={selectedTrade}
            onBack={handleBack}
            onUpdated={refreshTrades}
          />
        )}
      </main>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
