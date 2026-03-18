import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_INPUT = "docs/santa_voice_lines_v1.csv";
const DEFAULT_OUTPUT_DIR = "assets/audio/santa";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const DEFAULT_LANGUAGE_CODE = "ja";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

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
    // .env.local is optional
  }
}

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    out: DEFAULT_OUTPUT_DIR,
    limit: null,
    force: false,
    dryRun: false,
    delayMs: 250,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--input") {
      args.input = argv[i + 1] ?? args.input;
      i += 1;
      continue;
    }
    if (token === "--out") {
      args.out = argv[i + 1] ?? args.out;
      i += 1;
      continue;
    }
    if (token === "--limit") {
      const value = Number(argv[i + 1]);
      if (!Number.isNaN(value) && value > 0) {
        args.limit = Math.floor(value);
      }
      i += 1;
      continue;
    }
    if (token === "--delay-ms") {
      const value = Number(argv[i + 1]);
      if (!Number.isNaN(value) && value >= 0) {
        args.delayMs = Math.floor(value);
      }
      i += 1;
      continue;
    }
    if (token === "--force") {
      args.force = true;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

function parseCsvLine(line, lineNo) {
  const firstComma = line.indexOf(",");
  const secondComma = firstComma >= 0 ? line.indexOf(",", firstComma + 1) : -1;
  if (firstComma < 0 || secondComma < 0) {
    throw new Error(`CSV ${lineNo}行目の形式が不正です: ${line}`);
  }
  const id = line.slice(0, firstComma).trim();
  const category = line.slice(firstComma + 1, secondComma).trim();
  const text = line.slice(secondComma + 1).trim();
  if (!id || !category || !text) {
    throw new Error(`CSV ${lineNo}行目に空の項目があります: ${line}`);
  }
  return { id, category, text };
}

async function loadVoiceLines(csvPath) {
  const content = await readFile(csvPath, "utf8");
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const [, ...rows] = lines;
  return rows.map((line, idx) => parseCsvLine(line, idx + 2));
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function synthesizeVoice({ apiKey, voiceId, text, retries = 3 }) {
  let attempt = 0;
  while (attempt <= retries) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: DEFAULT_MODEL_ID,
        language_code: DEFAULT_LANGUAGE_CODE,
      }),
    });

    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }

    const statusCode = response.status;
    const detail = await response.text();
    if (!RETRYABLE_STATUS_CODES.has(statusCode) || attempt === retries) {
      throw new Error(`HTTP ${statusCode}: ${detail}`);
    }

    const backoffMs = 500 * 2 ** attempt;
    console.warn(`  リトライ: HTTP ${statusCode} (${attempt + 1}/${retries}) ${backoffMs}ms待機`);
    await sleep(backoffMs);
    attempt += 1;
  }

  throw new Error("不明なエラーで音声生成に失敗しました");
}

async function main() {
  await loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY が見つかりません。.env.local を確認してください。");
  }
  if (!voiceId) {
    throw new Error("ELEVENLABS_VOICE_ID が見つかりません。.env.local を確認してください。");
  }

  const inputPath = path.resolve(args.input);
  const outputDir = path.resolve(args.out);
  await mkdir(outputDir, { recursive: true });

  const allLines = await loadVoiceLines(inputPath);
  const targetLines = args.limit ? allLines.slice(0, args.limit) : allLines;
  console.log(`入力: ${inputPath}`);
  console.log(`出力: ${outputDir}`);
  console.log(`対象件数: ${targetLines.length} / 全${allLines.length}`);
  console.log(`モード: ${args.dryRun ? "dry-run" : "generate"}${args.force ? " (force)" : ""}`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const [idx, line] of targetLines.entries()) {
    const filename = `${line.id}.mp3`;
    const outputPath = path.join(outputDir, filename);
    const exists = await fileExists(outputPath);

    if (exists && !args.force) {
      skipped += 1;
      console.log(`[${idx + 1}/${targetLines.length}] skip ${filename}`);
      continue;
    }

    if (args.dryRun) {
      console.log(`[${idx + 1}/${targetLines.length}] dry ${filename} (${line.category})`);
      continue;
    }

    try {
      const audioBuffer = await synthesizeVoice({
        apiKey,
        voiceId,
        text: line.text,
      });
      await writeFile(outputPath, audioBuffer);
      generated += 1;
      console.log(`[${idx + 1}/${targetLines.length}] ok   ${filename}`);
    } catch (error) {
      failed += 1;
      console.error(
        `[${idx + 1}/${targetLines.length}] fail ${filename} :: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }

    if (args.delayMs > 0) {
      await sleep(args.delayMs);
    }
  }

  console.log("");
  console.log("完了");
  console.log(`  生成: ${generated}`);
  console.log(`  スキップ: ${skipped}`);
  console.log(`  失敗: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("生成失敗:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
