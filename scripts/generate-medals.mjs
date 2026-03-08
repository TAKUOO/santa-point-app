import { fal } from "@fal-ai/client";
import { access, appendFile, mkdir, open, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "assets/medals";
const LOCK_FILE_PATH = "assets/medals/.generate-medals.lock";
const DEFAULT_LIMIT = 10;
const DEFAULT_DELAY_MS = 1200;
const GRADE_DEFINITIONS = [
  { id: 1, no: "001", name: "アルミ", message: "はじめてのメダル！ここからスタート" },
  { id: 2, no: "002", name: "ブロンズ", message: "まいにちのがんばりがみえてきたね" },
  { id: 3, no: "003", name: "シルバー", message: "しっかりつづけていてすてき！" },
  { id: 4, no: "004", name: "ゴールド", message: "キラキラごほうびメダル！" },
  { id: 5, no: "005", name: "プラチナ", message: "つよいつみかさねのあかし" },
  { id: 6, no: "006", name: "サファイア", message: "あおくかがやく上級グレード" },
  { id: 7, no: "007", name: "ルビー", message: "あついこころのごほうび" },
  { id: 8, no: "008", name: "エメラルド", message: "みどりにひかるレアグレード" },
  { id: 9, no: "009", name: "ダイヤ", message: "とってもめずらしい特別グレード" },
  { id: 10, no: "010", name: "にじいろ", message: "さいこうグレード、おめでとう！" },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: DEFAULT_LIMIT,
    delayMs: DEFAULT_DELAY_MS,
    startId: 1,
    endId: 10,
    continueOnError: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--delayMs=")) {
      options.delayMs = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--startId=")) {
      options.startId = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--endId=")) {
      options.endId = Number(arg.split("=")[1]);
    } else if (arg === "--continueOnError") {
      options.continueOnError = true;
    }
  }

  return options;
}

async function loadEnvLocal() {
  try {
    const content = await readFile(".env.local", "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local is optional when FAL_KEY is already in environment.
  }
}

function buildPrompt(item) {
  return [
    "isometric 3D claymation style medal icon",
    "strictly circular medal coin only, front view, centered",
    "single flat coin silhouette, no hanging parts",
    "no ribbon, no strap, no belt, no loop, no ring, no chain, no hook",
    "no background, transparent background look",
    "single emblem only, no text in image",
    "grade style medal design:",
    `${item.name}`,
    `style hint: ${item.message}`,
    "high contrast, crisp details, unified collectible style, 1:1",
  ].join(", ");
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function appendLog(message, outputDir) {
  const timestamp = new Date().toISOString();
  await appendFile(path.join(outputDir, "generation.log"), `[${timestamp}] ${message}\n`);
}

async function acquireLock() {
  let handle;
  try {
    handle = await open(LOCK_FILE_PATH, "wx");
    await handle.writeFile(
      JSON.stringify(
        {
          pid: process.pid,
          startedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      "utf8",
    );
    await handle.close();
  } catch (error) {
    throw new Error(
      "別のメダル生成が実行中の可能性があります。assets/medals/.generate-medals.lock を確認してください。",
    );
  }
}

async function releaseLock() {
  await rm(LOCK_FILE_PATH, { force: true });
}

async function generateOne(item, index, total, outputDir) {
  const fileName = `medal_${item.no}.png`;
  const outputPath = path.join(outputDir, fileName);
  try {
    await access(outputPath);
    console.log(`[${index + 1}/${total}] ⏭️ ${fileName} は既存のためスキップ`);
    await appendLog(`[${index + 1}/${total}] SKIP ${fileName}`, outputDir);
    return;
  } catch {
    // file does not exist, continue generating
  }

  const prompt = buildPrompt(item);
  const result = await fal.subscribe("fal-ai/nano-banana-2", {
    input: {
      prompt,
      num_images: 1,
      aspect_ratio: "1:1",
    },
  });

  const imageUrl = result.data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`No.${item.no} の画像URLが取得できませんでした`);
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`No.${item.no} の画像取得に失敗しました: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
  console.log(`[${index + 1}/${total}] ✅ ${fileName} <- ${item.name}`);
  await appendLog(`[${index + 1}/${total}] OK ${fileName} <- ${item.name}`, outputDir);
}

async function main() {
  const { limit, delayMs, startId, endId, continueOnError } = parseArgs();
  await loadEnvLocal();

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error("FAL_KEY が見つかりません。.env.local または環境変数に設定してください。");
  }

  fal.config({ credentials: falKey });

  const allMedals = GRADE_DEFINITIONS;
  const ranged = allMedals.filter((item) => item.id >= startId && item.id <= endId);
  const target = ranged.slice(0, Math.max(1, Math.min(limit, ranged.length)));
  const outputDir = path.resolve(OUTPUT_DIR);

  await mkdir(outputDir, { recursive: true });
  await acquireLock();
  await appendLog(
    `START limit=${target.length} range=${startId}-${endId} delayMs=${delayMs} pid=${process.pid}`,
    outputDir,
  );
  console.log(`🎯 生成対象: ${target.length} 枚`);
  console.log(`📁 出力先: ${outputDir}`);

  try {
    const failedIds = [];
    for (let i = 0; i < target.length; i += 1) {
      try {
        await generateOne(target[i], i, target.length, outputDir);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failedIds.push(target[i].id);
        await appendLog(`[${i + 1}/${target.length}] FAIL medal_${target[i].no}.png: ${message}`, outputDir);
        console.error(`[${i + 1}/${target.length}] ❌ medal_${target[i].no}.png: ${message}`);
        if (!continueOnError) {
          throw error;
        }
      }
      if (i < target.length - 1 && delayMs > 0) {
        await wait(delayMs);
      }
    }
    if (failedIds.length > 0) {
      await appendLog(`DONE_WITH_FAILURES failedIds=${failedIds.join(",")}`, outputDir);
      console.log(`⚠️ 失敗ID: ${failedIds.join(",")}`);
    } else {
      await appendLog("DONE", outputDir);
    }
    console.log("🎉 メダル画像の生成が完了しました");
  } finally {
    await releaseLock();
  }
}

main().catch((error) => {
  console.error("生成失敗:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
