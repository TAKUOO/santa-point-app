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
