import { useState, useEffect, useCallback } from 'react';
import { NewTradeForm } from './components/NewTradeForm';
import { TradeList } from './components/TradeList';
import { TradeDetail } from './components/TradeDetail';
import { getAllTrades } from './services/storage';
import type { TradeLog } from './types/trade';
import './index.css';

type View = 'list' | 'new' | 'detail';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<TradeLog | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            className="text-xl font-bold text-gray-800 hover:text-gray-600"
            onClick={handleBack}
          >
            📓 トレード日記
          </button>
          {view !== 'new' && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setView('new')}
            >
              ＋ 新規記録
            </button>
          )}
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
    </div>
  );
}
