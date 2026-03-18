# ElevenLabs サンタボイス（TTS）の設定

サンタの返答を ElevenLabs のサンタボイスで読み上げる場合の設定手順です。

## 1. .env.local に追加

プロジェクトルートの `.env.local` に以下を追加します。

```bash
# ElevenLabs（サンタの声で読み上げ）
ELEVENLABS_API_KEY=あなたのAPIキー
ELEVENLABS_VOICE_ID=使うボイスのvoice_id
```

- **ELEVENLABS_API_KEY**: ElevenLabs の設定 → APIキー で作成したキーをコピー
- **ELEVENLABS_VOICE_ID**: 使いたいサンタボイスの ID（下記で取得）

## 2. voice_id の取得方法

### 方法A: ブラウザの URL から

1. ElevenLabs にログイン
2. 左メニュー「ボイス」→「自分の音声」
3. 使うボイス（例: Jerry B - Jolly Santa Claus）の名前をクリック
4. 開いたページの URL に `voiceId=xxxxx` が含まれていれば、その `xxxxx` が voice_id

### 方法B: API で一覧取得

```bash
curl -s -H "xi-api-key: あなたのAPIキー" https://api.elevenlabs.io/v1/voices | jq '.voices[] | {name, voice_id}'
```

表示された一覧から、使いたいボイスの `voice_id` をコピーして `ELEVENLABS_VOICE_ID` に設定します。

## 3. 動作確認

- `.env.local` を保存したら、**Expo の開発サーバーを一度止めてから `npm start` で再起動**してください（環境変数は起動時に読み込まれます）
- サンタと話す画面で送信し、ElevenLabs のサンタボイスで読み上げられれば成功です
- API キーや voice_id が未設定・無効の場合は、従来どおり端末内蔵の TTS にフォールバックします

## 4. 音声パックの一括生成（CSV → MP3）

返答文を事前生成してアプリに同梱する場合は、以下のスクリプトを使います。

### 入力CSV

- 既定: `docs/santa_voice_lines_v1.csv`
- 列: `id,category,text`
- 出力ファイル名: `id.mp3`

### 実行コマンド

```bash
# 対象確認のみ（生成しない）
npm run generate:santa:voices:dry

# 実生成
npm run generate:santa:voices
```

### オプション

```bash
node scripts/generate-santa-voices.mjs \
  --input docs/santa_voice_lines_v1.csv \
  --out assets/audio/santa \
  --limit 10 \
  --force \
  --dry-run
```

- `--limit`: 先頭N件だけ生成（試運転向け）
- `--force`: 既存MP3を上書き
- `--dry-run`: 生成せず対象のみ表示

### 生成先

- 既定: `assets/audio/santa/`

## 5. トラブルシュート

- `HTTP 402 paid_plan_required`
  - Voice Libraryの音声をAPIで使うには有料プランが必要です。
- `HTTP 429`
  - レート制限です。少し待って再実行するか、`--limit` で分割生成してください。
- `HTTP 401 / 403`
  - `ELEVENLABS_API_KEY` が無効、または権限不足です。
- `HTTP 404`
  - `ELEVENLABS_VOICE_ID` が誤っている可能性があります。
- 生成されるのにアプリで再生されない
  - ファイル名（`id.mp3`）と再生側のマッピングが一致しているか確認してください。
