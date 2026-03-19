# Santa Point App

Santa Point App は、3〜7歳の子どもがサンタさんに日々の「できた！」を報告してポイントを貯め、ランクアップに応じて担当サンタやお部屋の見た目が変わっていく Expo / React Native アプリです。

## 概要

- 音声またはテキストでサンタさんに報告できる
- 報告ごとに 1〜3pt をランダム付与
- 累計ポイントでランクアップし、担当サンタが変化する
- お部屋ビジュアルがランクや時間帯に応じて変化する
- ウィッシュリストとおてがみ機能がある
- 複数プロフィールをローカル保存できる

## 現在の実装範囲

### 実装済み

- オンボーディング
  - 初回開始
  - 遊び方ステップ
  - 子ども情報入力
- ホーム画面
  - プロフィール切り替え
  - クリスマスまでの日数
  - 今年のポイント
  - 現在ランク表示
- サンタへの報告
  - 音声認識
  - テキスト送信
  - ローカル音声または端末 TTS 再生
- ランクアップ演出
- おてがみ
  - 初回は `はじめまして！` の 1 通
  - 月 1 回のテンプレートベースおてがみ
- ウィッシュリスト
- 子どもプロフィールの追加 / 編集 / 削除
- アカウント削除
- 利用規約 / プライバシーポリシー画面
- AsyncStorage によるローカル保存

### リリース時点の方針

- 年間イベント演出は後回し
- 月 1 回のおてがみはテンプレートベース
- Claude API 連携によるおてがみ生成は将来検討
- 初回リリースの room 素材はランク 4（ゴールド）までを主対象とする
- ランク 5 以降のお部屋は当面フォールバックを許容する

### 未実装 / 後回し

- データ引き継ぎ（エクスポート / インポート）
- 関連サービス設定
- 年間イベント演出（正月 / 誕生日 / クリスマス）
- 年間ふりかえり系
- Claude API によるおてがみ生成

## 主要仕様

### ポイントとランク

- 報告ごとに `1〜3pt` をランダム付与
- `pointsThisYear`
  - 毎年 1/1 にリセット
  - プレゼント交換など年間利用向け
- `pointsAllTime`
  - リセットなし
  - ランク計算に使用

ランク閾値:

| ランク | 累計ポイント |
| --- | ---: |
| 1 | 20 |
| 2 | 60 |
| 3 | 120 |
| 4 | 220 |
| 5 | 360 |
| 6 | 560 |
| 7 | 840 |
| 8 | 1220 |
| 9 | 1750 |
| 10 | 2500 |

### 担当サンタ同期

現在ランクのサンタが、以下に一貫して反映されます。

- ホーム画面の部屋 / サンタ表示
- 会話モーダル
- ランクアップ演出
- おてがみ文面
- 会話返答テキスト

### おてがみ

- 初回作成時
  - `はじめまして！` の 1 通だけを生成
- 月次おてがみ
  - 前月ぶんの報告回数
  - 前月にもらったポイント合計
  - 前月によく出た話題
  をもとにテンプレート生成
- 生成タイミング
  - 起動時やプロフィール切り替え時など、プロフィール正規化タイミング

### 誕生日入力

- 初回オンボーディング
- 子ども情報編集モーダル

の両方で、数字入力に応じて `YYYY/MM/DD` に自動整形されます。保存時は `YYYY-MM-DD` に正規化します。

## 技術スタック

- Expo 55
- React 19
- React Native 0.83
- TypeScript
- AsyncStorage
- expo-speech
- expo-speech-recognition
- expo-audio

## セットアップ

### 必要環境

- Node.js
- npm
- Expo CLI を使える環境
- iOS Simulator / Android Emulator / Expo Go のいずれか

### インストール

```bash
npm install
```

### 起動

```bash
npm run start
```

個別起動:

```bash
npm run ios
npm run android
npm run web
```

### 型チェック

```bash
npm run typecheck
```

## 音声まわり

- ローカル音声アセットがある場合はそれを優先
- 利用できない場合は端末 TTS にフォールバック
- ElevenLabs 連携用のコードはあるが、初回リリース前提では必須ではない

## 画像 / アセット生成

room 素材や音声素材生成用に以下のスクリプトがあります。

- `scripts/generate-room-scenes.mjs`
- `scripts/generate-room-variants.sh`
- `scripts/generate-santa-voices.mjs`

## 重要ファイル

- `App.tsx`
- `components/OnboardingFlow.tsx`
- `components/home/HomeScreen.tsx`
- `components/modals/TalkModal.tsx`
- `components/modals/LetterModal.tsx`
- `components/modals/SettingsModal.tsx`
- `components/modals/ChildEditorModal.tsx`
- `components/modals/RankUpCelebrationModal.tsx`
- `components/screens/LegalDocumentScreen.tsx`
- `services/santa.ts`
- `services/storage.ts`
- `services/tts.ts`
- `constants/ranks.ts`
- `constants/roomScenes.ts`
- `constants/legalDocuments.ts`

## ドキュメント

仕様や残タスクの参照順は以下です。

1. `docs/remaining_tasks.md`
2. `docs/santa_spec_v7_final.md`
3. `docs/claude_code_handoff.md`

## 備考

- 申請用スクリーンショットのため、デバッグ導線は `App.tsx` のフラグで一時的に非表示にできます
- 開発時の仕様と実装差分は `docs/remaining_tasks.md` に寄せて管理します
