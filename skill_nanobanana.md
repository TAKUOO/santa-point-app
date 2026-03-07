# Nano Banana 画像生成スキル

## 概要
fal.ai経由でNano Banana 2（Gemini 3.1 Flash Image）APIを使い、クレイ調キャラクター画像をバッチ生成するパターン。

## インストール
```bash
npm install @fal-ai/client
```

## 環境変数
```
FAL_KEY=your_fal_api_key
```

## 基本呼び出しパターン
```typescript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/nano-banana-2", {
  input: {
    prompt: "YOUR PROMPT HERE",
    num_images: 1,
    aspect_ratio: "1:1",
  },
});

const imageUrl = result.data.images[0].url;
```

## クレイ調キャラクター生成のベーススタイル
```typescript
const CLAY_BASE_STYLE = [
  "isometric 3D claymation style",
  "cute chibi character",
  "clay texture, soft rounded shapes",
  "warm studio lighting",
  "pastel colors, gentle shadows",
  "white background, full body, centered",
  "high quality render, 1:1 aspect ratio",
].join(", ");

const buildPrompt = (trait: string) =>
  `${CLAY_BASE_STYLE}, ${trait}`;
```

## バッチ生成パターン（100枚など）
```typescript
import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = "./assets/generated";

async function generateImage(id: number, prompt: string) {
  const result = await fal.subscribe("fal-ai/nano-banana-2", {
    input: { prompt, num_images: 1, aspect_ratio: "1:1" },
  });

  const imageUrl = result.data.images[0].url;
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const filename = `image_${String(id).padStart(3, "0")}.png`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.from(buffer));
  console.log(`✅ ${id}: ${filename}`);
}

async function batchGenerate(items: Array<{ id: number; prompt: string }>) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const item of items) {
    await generateImage(item.id, item.prompt);
    await new Promise((r) => setTimeout(r, 1000)); // レート制限対策
  }
  console.log("🎉 全画像生成完了！");
}
```

## コスト目安
- Nano Banana 2（1K）: 約$0.02/枚
- 100枚: 約$2（≈200円）
- 再生成・調整込みで$5〜10以内

## 推奨ワークフロー
1. **1〜3枚テスト生成** → プロンプト・スタイルを調整
2. **スタイル確定後にバッチ実行**
3. 生成画像を確認・NG品を個別再生成
4. `assets/` フォルダに格納してアプリに組み込み
