# 🏠 Home Screen デザイン仕様
> Penpotデザインファイル（サンタホ_イント.pen）から抽出

---

## キャンバス
- サイズ：393 × 852px
- 背景色：`#1A0F2E`（深い紫）

---

## 1. TopBar

- padding: [48, 20, 4, 20]（上48 左右20 下4）
- layout: 横並び・space_between

### プロフィールタブ（topLeft）
- gap: 6

| 要素 | スタイル |
|------|---------|
| activeTab | bg=`#FFFFFF22` radius=100 padding=[6,14,6,8] gap=6 |
| activeIcon | 20×20 Material Symbols `face` fill=`#FFFFFF` |
| activeLabel | "ゆうくん" Inter Bold 13px `#FFFFFF` |
| inactiveTab | bg=`#FFFFFF0A` radius=100 padding=[6,14,6,8] gap=6 |
| inactiveIcon | 20×20 `face` fill=`#FFFFFF55` |
| inactiveLabel | "はなちゃん" Inter SemiBold 13px `#FFFFFF55` |
| addChildBtn | 28×28 radius=14 border=`#FFFFFF33` 1.5px |
| addIcon | 16×16 `add` fill=`#FFFFFF55` |
| settingsBtn | 32×32 bg=`#FFFFFF15` radius=16 |
| settingsIcon | 20×20 `settings` fill=`#FFFFFF90` @6,6 |

---

## 2. RoomScene

- サイズ：393 × 768px
- 背景：画像（アイソメトリックお部屋・`generated-1772508399948.png`）
- clip: true / layout: none

### sceneGradient（上部グラデ）
- 393 × 218px @0,0
- グラデーション：`#1A0F2E` → `#1A0F2E00`（上から下）

#### statusBlock（数値バッジエリア）
- 393px @0,48 padding=[12,0] 横並び中央揃え

| カラム | 数値 | 単位 | ラベル |
|--------|------|------|--------|
| leftCol | "22" PlusJakartaSans ExtraBold 32px `#FFFFFF` | "日" Inter Bold 14px `#FFFFFF88` | "🎄まで" Inter SemiBold 11px `#FFFFFF55` |
| midCol | "180" PlusJakartaSans ExtraBold 32px `#FFFFFF` | "pt" Inter Bold 14px `#FFFFFF88` | "ポイント" Inter SemiBold 11px `#FFFFFF55` |
| rightCol | "3" PlusJakartaSans ExtraBold 32px `#FFFFFF` | "/10" Inter SemiBold 13px `#FFFFFF55` | "🎅メダル" Inter SemiBold 11px `#FFFFFF55` |

- カラム間仕切り：1×52px `#FFFFFF15`

### bottomGrad（下部グラデ）
- 393 × 420px @0,660
- グラデーション：`#1A0F2E` → `#1A0F2E00`（下から上）

### HitSanta（タップ領域）
- 65 × 75px @240,270
- 透明なタップ領域（サンタのお部屋内の位置）

### ChoiceDialog（サンタタップ後モーダル）
- 全画面オーバーレイ @0,0 393×764px bg=`#00000066`
- **enabled: false**（デフォルト非表示）

#### ChoiceBox
- 320px @36,300 bg=`#1E1533EE` radius=24
- border=`#FFFFFF18` 1px inside
- effect: background_blur(24) + shadow(#00000060 y=8 blur=32)

**choiceHeader**
- padding=[16,20] gap=10
- サンタ絵文字 🎅 28px
- "サンタさん" PlusJakartaSans Bold 15px `#FFFFFFEE`
- "なにをしたい？" Inter Medium 13px `#FFFFFF88`

**choice1（はなしかける）**
- padding=[14,20] gap=14
- アイコン背景：40×40 bg=`#D43D2F30` radius=12
- アイコン：`mic` 22×22 `#FF6B6B`
- タイトル："🎤 はなしかける" Inter SemiBold 15px `#FFFFFFEE`
- サブ："やったことをほうこくする" Inter Medium 12px `#FFFFFF66`
- 矢印：`chevron_right` 20×20 `#FFFFFF44`

**choice2（おねがいする）**
- padding=[14,20,18,20] gap=14
- アイコン背景：40×40 bg=`#FFD70030` radius=12
- アイコン：`star` 22×22 `#FFD700`
- タイトル："⭐ おねがいする" Inter SemiBold 15px `#FFFFFFEE`
- サブ："プレゼントをおねがいする" Inter Medium 12px `#FFFFFF66`
- 矢印：`chevron_right` 20×20 `#FFFFFF44`

### HitMail（メールアイコン・お部屋内）
- 32 × 28px @68,412

| 要素 | スタイル |
|------|---------|
| mailIcon | 26×26 @2,0 bg=`#8B5E3CDD` radius=6 shadow=#FFD70088 blur=12 |
| mailIconInner | `mail` 14×14 `#FFD700` |
| mailBadge | 12×12 @20,-2 bg=`#D43D2F` radius=6 |
| mailBadgeT | "1" Inter Bold 10px `#FFFFFF` |

### LetterBubble（お手紙バナー）
- @87,160 bg=`#FFFFFFEE` radius=14
- padding=[8,14] gap=6 中央揃え
- shadow: #00000040 y=4 blur=16 + #D4A01730 blur=4
- アイコン：`mail` 18×18 `#D43D2F`
- テキスト："サンタさんからおてがみだよ！" Inter SemiBold 11px `#2C1810`
- バッジ：8×8 bg=`#D43D2F` radius=4

### WishList（ウィッシュリスト）
- 365px @14,590 bg=`#00000050` radius=16
- border=`#FFFFFF18` 1px / background_blur(24)
- padding=[12,14] gap=8 縦並び

**wHeader**
- アイコン：`redeem` 16×16 `#D4A017`
- タイトル："お願いしたもの" PlusJakartaSans Bold 12px `#FFFFFFDD`

**wishItems（各アイテム）**
- 各行：padding=[8,0] gap=10 border-bottom=`#FFFFFF10` 1px
- 絵文字：16px
- テキスト：Inter Medium 12px `#FFFFFFCC`
- サンプル：🎮ゲームソフト / 👗プリンセスのドレス / ⚽サッカーボール

### TalkButton（固定ボタン）
- 260 × (auto)px @66,690
- bg=`#D43D2F` radius=28
- padding=[14,24] gap=10 中央揃え
- shadow: #D43D2F60 y=6 blur=20 + #00000030 y=2 blur=8
- アイコン：`mic` 24×24 `#FFFFFF`
- ラベル："サンタさんとはなす" PlusJakartaSans Bold 15px `#FFFFFF`

---

## フォントまとめ

| フォント | 用途 |
|---------|------|
| Plus Jakarta Sans | 数値・タイトル・ボタンラベル（ExtraBold/Bold） |
| Inter | ラベル・サブテキスト・バナー（各種ウェイト） |

## カラーパレット

| 色 | 用途 |
|----|------|
| `#1A0F2E` | 背景・グラデーション |
| `#D43D2F` | メインアクション（ボタン・バッジ・アイコン） |
| `#FFD700` | ゴールド（メダル・メールアイコン） |
| `#D4A017` | ウィッシュリストアイコン |
| `#FFFFFF` | テキスト（透明度で階層表現） |
| `#1E1533` | モーダル背景 |

## マテリアルアイコン（Material Symbols Rounded）

| アイコン名 | 使用箇所 |
|-----------|---------|
| `face` | プロフィールタブ |
| `add` | 子ども追加ボタン |
| `settings` | 設定ボタン |
| `mic` | トークボタン・choice1 |
| `star` | choice2 |
| `chevron_right` | 選択肢の矢印 |
| `mail` | お手紙バナー・メールアイコン |
| `redeem` | ウィッシュリストヘッダー |

---

# 🎤 Voice Report 画面デザイン仕様

## キャンバス
- サイズ：393 × 852px
- 背景色：`#1A0F2E`

## voiceHeader
- padding: [48, 20, 12, 20]
- 横並び・space_between

| 要素 | スタイル |
|------|---------|
| backBtn | 32×32 bg=`#FFFFFF15` radius=8 |
| backIcon | 20×20 `chevron_left` `#FFFFFF` |
| タイトル | "サンタにほうこく" PlusJakartaSans Bold 18px `#FFFFFF` |
| 右スペーサー | 32×32（中央揃え用） |

## voiceContent
- padding: 24 / gap: 24 / fill_container縦

### サンタアバター
- 120×120 radius=60（円形）
- 背景：画像（担当サンタのクレイ調画像）

### speechBubble（サンタ返答）
- fill=`#FFFFFF15` radius=16 padding=16 gap=8

| 要素 | スタイル |
|------|---------|
| 返答テキスト | Inter Regular 14px `#FFFFFF` fill_container |
| pointGain | bg=`#34D39920` radius=100 padding=[8,14] gap=6 |
| pointIcon | 16×16 `star` `#34D399` |
| pointText | "3ポイント" Inter SemiBold 12px `#34D399` |

- サンプルテキスト：
```
おっほっほ！🎅
きょうもよくがんばったね！
はみがきできたなんて、えらいぞ！

+3ポイントプレゼントだ！⭐
```

### userBubble（子どもの発言・右寄せ）
- bg=`#FF6B3520` radius=12 padding=16
- テキスト："はみがきしたよ！🪥" Inter Regular 14px `#FFFFFF`

### micSection
- padding=[16,0,0,0] gap=12 縦並び中央揃え

| 要素 | スタイル |
|------|---------|
| micBtn | 72×72 bg=`#D43D2F` radius=36 |
| micIcon | `mic` 24×24 `#FFFFFF` |
| ヒントテキスト | "タップしてサンタさんに話しかけよう！" Inter Regular 12px `#FFFFFFAA` |

---

# 📜 Letters 画面デザイン仕様

## キャンバス
- サイズ：393 × 852px
- 背景色：`#1A0F2E`

## lettersHeader
- padding: [48, 20, 12, 20] gap: 12

| 要素 | スタイル |
|------|---------|
| backIcon | `chevron_left` 20×20 `#FFFFFF` |
| "もどる" | Inter Regular 14px `#FFFFFF` |
| タイトル | "サンタからのおてがみ" PlusJakartaSans Bold 16px `#FFFFFF` |

## lettersBody
- padding: [16, 12] gap: 12

### mainCard（最新のお手紙）
- fill=`#F5F0EB`（温かみのあるオフホワイト）radius=24 padding=24 gap=16

| 要素 | スタイル |
|------|---------|
| badge | bg=`#FFE6E6` radius=8 padding=[4,12] テキスト="新" Inter Bold 10px `#D43D2F` |
| headerRow | "あたらしい！" Inter SemiBold 12px `#2C1810` / "12月1日" Inter Regular 11px `#A08878` |
| タイトル | "シーズンスタート！🎄" PlusJakartaSans Bold 20px `#2C1810` |
| 本文 | Inter Regular 14px `#2C1810` fill_container |
| 署名 | "サンタクロースより" Inter SemiBold 12px `#D43D2F` |

### historyLabel
- "これまでのおてがみ" Inter SemiBold 12px `#FFFFFFAA`

### historyCard（過去のお手紙）
- fill=`#FFFFFF15` radius=12 padding=16 gap=8

| 要素 | スタイル |
|------|---------|
| タイトル | "11月のおてがみ" Inter SemiBold 13px `#FFFFFF` |
| 冒頭文 | Inter Regular 12px `#FFFFFFAA` |
| 日付 | Inter Regular 11px `#FFFFFF55` |

---

# 🎨 全画面共通カラーパレット（確定版）

| 色 | 用途 |
|----|------|
| `#1A0F2E` | 全画面背景 |
| `#D43D2F` | メインアクション（ボタン・バッジ・署名） |
| `#FFD700` | ゴールド（メダル・メールアイコン） |
| `#D4A017` | ウィッシュリストアイコン |
| `#34D399` | ポイント獲得（グリーン） |
| `#FF6B35` | ユーザー発言バブル |
| `#F5F0EB` | お手紙カード背景（オフホワイト） |
| `#2C1810` | お手紙本文テキスト（ダークブラウン） |
| `#1E1533` | モーダル背景 |
| `#FFFFFF` | テキスト（透明度で階層表現） |

# 📐 全画面共通フォント（確定版）

| フォント | ウェイト | 用途 |
|---------|---------|------|
| Plus Jakarta Sans | ExtraBold(800) | 数値バッジ |
| Plus Jakarta Sans | Bold(700) | 画面タイトル・ボタン・お手紙タイトル |
| Inter | Bold(700) / SemiBold(600) | ラベル・バッジ・署名 |
| Inter | Medium(500) / Regular | 本文・サブテキスト |
