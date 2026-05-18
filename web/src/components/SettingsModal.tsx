import { useState } from 'react';
import { getGasUrl, saveGasUrl } from '../services/gasApi';

const GAS_SCRIPT = `function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("トレード記録") || ss.getActiveSheet();

    const headers = ["日付","銘柄","取引種別","方向","ステータス",
      "エントリー価格","数量","評価額","損切り価格","利確50%価格",
      "エントリー理由","途中メモ","結果","最終反省","作成日時","更新日時"];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    } else {
      const existing = sheet.getRange(1,1,1,headers.length).getValues()[0];
      if (existing[0] !== headers[0]) sheet.insertRowBefore(1);
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
    }

    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    (data.rows || []).forEach(row => sheet.appendRow(row));

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

type Props = {
  onClose: () => void;
};

export function SettingsModal({ onClose }: Props) {
  const [url, setUrl] = useState(getGasUrl());
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(GAS_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveGasUrl(url.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">⚙️ スプレッドシート連携設定</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">① スプレッドシートでスクリプトを設定</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>スプレッドシートを開く</li>
              <li>メニューの「拡張機能」→「Apps Script」をクリック</li>
              <li>既存のコードを削除して下記を貼り付ける</li>
              <li>「デプロイ」→「新しいデプロイ」→ 種類: ウェブアプリ</li>
              <li>「次のユーザーとして実行」→ 自分、「アクセスできるユーザー」→ 全員</li>
              <li>デプロイしてURLをコピー</li>
            </ol>

            <div className="relative">
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto text-gray-700 leading-relaxed">
                {GAS_SCRIPT}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-white border border-gray-300 text-xs px-2 py-1 rounded hover:bg-gray-50 transition-colors"
              >
                {copied ? '✓ コピー済み' : 'コピー'}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">② デプロイURLを貼り付ける</p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!url.trim() || saved}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saved ? '✓ 保存しました！' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
