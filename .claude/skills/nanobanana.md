---
name: nanobanana
description: Generate Santa Point room illustrations with fal.ai Nano Banana. Use when creating clay-style Santa room images, normal-santa 4 time-slot assets, or batch image prompts for room scenes.
---

# Nano Banana

## 用途
Santa Point の `room` 素材を fal.ai の Nano Banana で生成するときの標準手順。

現在の主用途:
- `ノーマルサンタ x 4時間帯` の静止画生成
- 後続の `Kling.ai` 用 image-to-video 元画像の作成

## 前提
```bash
npm install
```

`.env.local` か環境変数に `FAL_KEY` を設定する。

```bash
FAL_KEY=your_fal_api_key
```

## 生成方針
- スタイルは `isometric 3D clay diorama`
- 季節は `winter fixed`
- 構図は毎回できるだけ固定
- まずは `1:1` で生成
- 背景透過を前提にせず、**切り抜きやすい単色背景**で出す
- 1回で大量生成せず、**テスト1枚 -> 4枚本生成 -> NGのみ再生成**

## 時間帯定義
- `late-night`: 部屋が暗い / 月明かり / 静か / 眠っている
- `morning`: 朝日 / 明るい室内 / まだ眠そう / 朝ごはん
- `daytime`: 明るい光 / 落ち着いた室内 / プレゼント制作
- `night`: 暖炉とランプが強い / 夜のくつろぎ時間

## プロンプトの必須要素
- normal classic red clay santa
- cozy winter santa room diorama
- centered composition
- fireplace on the left, christmas tree near center, window on the right, santa chair on the right
- same camera angle, same room layout, same visual identity
- isolated room asset, plain dark solid background, easy to cut out
- no text, no frame, no extra characters, no snow outside the asset

## 実行コマンド
4時間帯まとめて生成:

```bash
node scripts/generate-room-scenes.mjs
```

特定時間帯だけ生成:

```bash
node scripts/generate-room-scenes.mjs --slot morning
```

プロンプト確認だけ:

```bash
node scripts/generate-room-scenes.mjs --dry-run
```

## 出力先
```text
assets/generated/rooms/normal/
```

想定ファイル名:
- `normal-santa-late-night.png`
- `normal-santa-morning.png`
- `normal-santa-daytime.png`
- `normal-santa-night.png`

## チェックポイント
- 4枚で構図ズレが大きすぎないか
- サンタが `normal` の赤い見た目になっているか
- 部屋の主要オブジェクト位置が安定しているか
- 背景が単色で、後から切り抜きやすいか
- Kling に渡せる程度に主題が中央に収まっているか

## 再生成の判断
- 構図が大きく崩れたら再生成
- サンタが別ランク風になったら再生成
- 背景が複雑になったら再生成
- 4枚の統一感が弱い場合は、ベース文言を固定したまま時間帯部分のみ差し替えて再実行
