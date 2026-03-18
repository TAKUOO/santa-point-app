# 🎅 Santa Point App - Claude Code 引き継ぎプロンプト

## プロジェクトの場所
`/Users/matsuitakafumi/workspace/santa-point-app`

---

## まず最初にやること

```bash
cd /Users/matsuitakafumi/workspace/santa-point-app
npx create-expo-app . --template blank-typescript
```

### 必要パッケージのインストール
```bash
npx expo install expo-speech expo-av expo-notifications expo-file-system expo-document-picker
npm install @react-native-async-storage/async-storage
npm install react-native-reanimated
```

---

## アプリ概要

3〜7歳の子どもが自分だけの担当サンタに毎日話しかけてポイントを貯め、プレゼントやメダルを集める**通年利用の子ども向けアプリ**。

- **担当サンタ**：赤いサンタ1人（固定）。4年間同じサンタが担当
- **ポイント**：話しかけるたびに1〜3ptランダム付与（優劣なし）
- **メダルランク**：累計ポイントで10段階グレード昇格。ホームでランク表示（図鑑なし）
- **データ**：AsyncStorageでローカル保存。JSONエクスポート/インポートで端末引き継ぎ

---

## 画面構成

```
├── スプラッシュ画面
├── オンボーディング（初回のみ）
│   ├── 新しく始める → 名前・生年月日入力 → 担当サンタ決定演出
│   └── データを引き継ぐ → JSONファイルインポート
├── ホーム（メイン・常駐）
│   ├── プロフィールタブ（子ども切り替え）
│   ├── 数値バッジ（クリスマスまでXX日 / XXXpt / 🎅ランク）
│   ├── お手紙バナー（未読時のみ）
│   ├── サンタのお部屋ビジュアル（アイソメトリック・リアルタイム連動）
│   ├── ウィッシュリスト
│   └── 「サンタさんとはなす」固定ボタン
└── 設定画面（唯一の別画面）
    ├── 子どもの追加
    ├── データエクスポート
    ├── データインポート
    ├── 関連サービス設定
    └── 法的情報
```

**ホーム以外はすべてモーダルで表示：**
- 🎤 サンタにほうこく（チャットUI・音声入力）
- 📜 サンタからのおてがみ
- 📊 ダッシュボード（ポイント・ウィッシュリスト進捗）

※メダルは10段階ランク制。図鑑画面はなし。ホームのバッジで現在ランクを表示。

---

## ディレクトリ構成（推奨）

```
santa-point-app/
├── app/
│   ├── index.tsx          # スプラッシュ → ルーティング
│   ├── onboarding.tsx     # オンボーディング
│   ├── home.tsx           # ホーム（メイン）
│   └── settings.tsx       # 設定
├── components/
│   ├── room/
│   │   └── SantaRoom.tsx  # アイソメトリックお部屋SVG
│   ├── modals/
│   │   ├── ChatModal.tsx  # サンタにほうこく
│   │   ├── LetterModal.tsx
│   │   └── DashboardModal.tsx
│   └── ui/
│       ├── ProfileTabs.tsx
│       ├── StatsBadges.tsx
│       └── WishList.tsx
├── hooks/
│   ├── useChild.ts        # 子どもデータ管理
│   ├── usePoints.ts       # ポイント管理
│   ├── useMedals.ts       # メダル管理
│   └── useRoomState.ts    # お部屋のリアルタイム状態
├── services/
│   ├── claude.ts          # Claude API呼び出し
│   ├── tts.ts             # ElevenLabs TTS
│   ├── storage.ts         # AsyncStorage CRUD
│   └── dataTransfer.ts    # JSON エクスポート/インポート
├── constants/
│   ├── santas.ts          # 赤いサンタ＋ランク用10体
│   └── ranks.ts           # ランク閾値・ランク別サンタ定義
└── types/
    └── index.ts           # 型定義
```

---

## データ型定義（types/index.ts）

```typescript
export type Santa = {
  id: number;          // 1〜100
  name: string;        // 例：「まほうつかいのサンタ」
  message: string;     // ひとこと
  emoji: string;
};

export type Child = {
  id: string;
  name: string;
  birthdate: string;   // YYYY-MM-DD
  assignedSanta: Santa;
  pointsThisYear: number;   // 毎年1/1リセット
  pointsAllTime: number;    // 累計・リセットなし
  ranks: number[];          // 到達済みランクID配列
  wishlist: string[];
  chatHistory: ChatMessage[];
  letters: Letter[];
  lastResetYear: number;    // ポイントリセット管理
};

export type ChatMessage = {
  id: string;
  role: 'child' | 'santa';
  text: string;
  points?: number;     // サンタ返答時のポイント付与数
  timestamp: string;
};

export type Letter = {
  id: string;
  title: string;
  body: string;
  to: 'child' | 'parent';
  date: string;
  isRead: boolean;
};
```

---

## サンタのお部屋・リアルタイム連動

現在日時を取得して以下の状態を切り替える：

### 時間帯（8パターン）
| 時間 | サンタの状態 |
|------|------------|
| 0〜5時 | 眠っている |
| 6〜8時 | 目をこすっている |
| 9〜11時 | 朝ごはん・コーヒー |
| 12〜13時 | 昼寝 or 外出 |
| 14〜17時 | プレゼント作業・読書 |
| 18〜19時 | お茶・くつろぎ |
| 20〜22時 | パジャマ |
| 23時〜 | 歯磨き・就寝準備 |

### 季節（4パターン）
| 季節 | 時期 | お部屋 |
|------|------|--------|
| 春 | 3〜5月 | 花・雪解け |
| 夏 | 6〜8月 | 緑・明るい・アイス |
| 秋 | 9〜11月 | 紅葉・読書 |
| 冬 | 12〜2月 | 雪・暖炉・クリスマス |

### 特別日付
- 子どもの誕生日・1/1・5/5・7/7・10/31・12/1〜25

---

## Claude API 呼び出し仕様

```typescript
// services/claude.ts
const systemPrompt = (child: Child) => `
あなたは「${child.assignedSanta.name}」というサンタクロースです。
口癖やひとこと：「${child.assignedSanta.message}」
担当している子どもの名前は「${child.name}」ちゃん/くんです。
必ずひらがなを多用し、3〜7歳の子どもにわかる言葉で返答してください。
返答は3文以内・明るく・褒めて・ポイントを伝えてください。
ポイントは1〜3のランダムな数字を返答に含めてください。
`;
```

---

## ポイント・メダル設計

### ポイント付与
- 毎回 `Math.floor(Math.random() * 3) + 1` で1〜3pt
- `pointsThisYear` と `pointsAllTime` 両方に加算
- 毎年1/1: `pointsThisYear` をリセット（`pointsAllTime` はそのまま）

### ランク到達閾値（累計ポイント）
```typescript
const RANK_THRESHOLDS = [
  10, 25, 50, 80, 120, 170, 230, 300,      // 1〜8枚目
  380, 470, 570, 680, 800, 930, 1070,       // 9〜15枚目
  // 以降50ptごとに1枚（16枚目〜100枚目）
  ...Array.from({length: 85}, (_, i) => 1220 + i * 50)
];
```

---

## 担当サンタ決定ロジック

```typescript
function assignSanta(name: string, birthdate: string): Santa {
  const nameSum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const dateSum = birthdate.replace(/-/g, '').split('').reduce((acc, c) => acc + parseInt(c), 0);
  const index = (nameSum + dateSum) % 100;
  return SANTAS[index]; // 0〜99のインデックス
}
```

---

## MVP実装順序

### Phase 1（最初に作る）
1. `types/index.ts` - 型定義
2. `constants/santas.ts` - 100人リスト
3. `services/storage.ts` - AsyncStorage CRUD
4. オンボーディング画面（名前・生年月日入力 → サンタ決定演出）
5. ホーム画面（基本レイアウト・数値バッジ）
6. SantaRoom.tsx（SVGベースのアイソメトリックお部屋・時間帯連動）

### Phase 2
7. ChatModal.tsx（テキスト入力 → Claude API → 返答表示）
8. `services/claude.ts` - API呼び出し
9. ポイント付与ロジック
10. LetterModal.tsx

### Phase 3
11. メダル付与ロジック（ランクはホームバッジで表示。図鑑なし）
12. DashboardModal.tsx
13. 設定画面（エクスポート・インポート）

### Phase 4
15. 音声入力（expo-speech）
16. TTS（ElevenLabs）
17. 季節・特別日付演出
18. プッシュ通知

---

## デザイン参考

- 世界観：ダーク背景（深い紫 `#1a0a2e`）＋クリスマス（赤・金）
- お部屋：アイソメトリック・クレイ調・暖炉の暖かい光
- フォント：Nunito（丸みがあって子どもに読みやすい）
- ボタン：大きめ・角丸・赤（`#CC0000`）
- 参考モックあり（別途画像ファイル参照）

---

## 環境変数（.env.local）

- 開発時は `.env.local` に記載（コミットしないこと）
- `app.config.js` が読み込み、Expo の `extra` に渡す

```
# サンタの声（ElevenLabs）※任意。未設定なら端末のTTSを使用
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

詳細は [docs/elevenlabs_tts.md](elevenlabs_tts.md) を参照。

---

## 🎨 サンタ画像生成スクリプト（Nano Banana API）

### 概要
- nanobananaはGoogleのGemini画像生成機能（`gemini-3-pro-image-preview`）のAPIラッパー
- fal.aiまたはnanobananaapi.aiでAPIキーを取得して使用
- **進め方：まず1枚スタイル確定 → バッチで100枚生成**

### ディレクトリ追加
```
santa-point-app/
└── scripts/
    ├── generate-santa.ts       # 1枚テスト生成
    ├── generate-all-santas.ts  # 100枚バッチ生成
    └── santas-prompt-list.ts   # 各サンタのプロンプト定義
```

### 環境変数に追加（.env）
```
NANOBANANA_API_KEY=your_key_here
# fal.aiを使う場合
FAL_KEY=your_key_here
```

### スタイル確定用プロンプトテンプレート
```typescript
// scripts/generate-santa.ts

const BASE_STYLE = `
  isometric 3D claymation style,
  cute chibi Santa Claus character,
  clay texture, soft rounded shapes,
  warm studio lighting, pastel Christmas colors,
  white background, full body, centered,
  high quality, 1:1 aspect ratio
`.trim().replace(/\n\s+/g, ', ');

const buildPrompt = (santa: { name: string; emoji: string; trait: string }) => `
  ${BASE_STYLE},
  ${santa.trait},
  holding or wearing something related to their personality
`;
```

### バッチ生成スクリプト
```typescript
// scripts/generate-all-santas.ts
import { fal } from "@fal-ai/client";
import { SANTAS } from "../constants/santas";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = "./assets/santas";

async function generateSanta(santa: typeof SANTAS[0]) {
  const prompt = buildPrompt(santa);

  const result = await fal.subscribe("fal-ai/nano-banana-2", {
    input: {
      prompt,
      num_images: 1,
      aspect_ratio: "1:1",
    },
  });

  // 画像を保存
  const imageUrl = result.data.images[0].url;
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const filename = `santa_${String(santa.id).padStart(3, "0")}.png`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.from(buffer));

  console.log(`✅ ${santa.id}: ${santa.name} → ${filename}`);
}

async function generateAll() {
  // まず1枚テストしてスタイルを確認してから実行
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const santa of SANTAS) {
    await generateSanta(santa);
    // レート制限対策で少し待つ
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("🎅 全100人のサンタ生成完了！");
}

generateAll();
```

### 各サンタのtrait定義（santas-prompt-list.ts）
```typescript
// constants/santas.ts に trait フィールドを追加
export const SANTAS = [
  { id: 1,  name: "まほうつかいのサンタ", emoji: "🪄", message: "ふしぎなまほうでプレゼントをとどけるよ！", trait: "wearing wizard hat and robe, holding a magic wand with stars" },
  { id: 2,  name: "にんじゃのサンタ", emoji: "🥷", message: "しゅりけんよりはやくとどけるぞ！", trait: "wearing ninja mask and outfit with Santa hat, holding shuriken" },
  { id: 3,  name: "うちゅうひこうしのサンタ", emoji: "🚀", message: "そらのむこうからもみえてるよ！", trait: "wearing astronaut suit with Santa hat, helmet under arm" },
  // ...以降100人分
];
```

### 推奨ワークフロー

```
Step 1: まず1〜3枚テスト生成してスタイルを確認
         → BASE_STYLEプロンプトを調整

Step 2: スタイルが決まったらバッチ実行
         npx ts-node scripts/generate-all-santas.ts

Step 3: 生成された画像を確認・NG品を再生成
         npx ts-node scripts/generate-santa.ts --id=42

Step 4: assets/santas/ フォルダに格納してアプリに組み込み
         constants/santas.ts の imageSource に require() で参照
```

### アプリ内での画像参照
```typescript
// constants/santas.ts
export const SANTA_IMAGES: Record<number, any> = {
  1:  require('../assets/santas/santa_001.png'),
  2:  require('../assets/santas/santa_002.png'),
  // ...
  100: require('../assets/santas/santa_100.png'),
};

// 使用例
const image = SANTA_IMAGES[child.assignedSanta.id];
<Image source={image} style={{ width: 120, height: 120 }} />
```

### コスト試算
- fal.ai Nano Banana 2：約$0.02/枚
- 100人分：約$2（200円程度）
- 再生成・調整含めても$5〜10以内に収まる想定
