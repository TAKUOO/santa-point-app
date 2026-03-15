import { fal } from "@fal-ai/client";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

const SCENES = {
  "late-night": {
    label: "深夜",
    filename: "normal-santa-late-night.png",
    seed: 5101,
    detail:
      "change the base room to late night: dim moonlight through the window, darker overall room, fireplace still glowing softly, very quiet mood, replace the chair pose with a small bed or bedtime setup in the same right-side area, Santa is sleeping in bed or preparing to sleep in bed",
  },
  morning: {
    label: "朝",
    filename: "normal-santa-morning.png",
    seed: 5102,
    detail:
      "change the base room to morning: soft sunrise through the window, brighter cozy room, Santa looks a little sleepy and is having breakfast near the chair area",
  },
  daytime: {
    label: "昼",
    filename: "normal-santa-daytime.png",
    seed: 5103,
    detail:
      "change the base room to daytime: bright winter daylight from the window, calm cozy room, Santa is making presents while staying in the same right-side area, keep exactly one room only, no nested room, no extra wall shell, no extra outer room, no room inside room",
  },
  night: {
    label: "夜",
    filename: "normal-santa-night.png",
    seed: 5104,
    detail:
      "change the base room to night: warm fireplace glow and lamp light, Santa is drinking tea in the chair or changing into pajamas with a calm evening mood before bedtime",
  },
};

const DEFAULT_SLOTS = ["late-night", "morning", "daytime", "night"];
const OUTPUT_DIR = path.resolve("assets/generated/rooms/normal");
const RAW_OUTPUT_DIR = path.join(OUTPUT_DIR, "raw");
const ROOM_REFERENCE_PATH = path.resolve("assets/rooms/room-default.png");
const SANTA_FACE_REFERENCE_PATH = path.resolve("assets/rooms/santas/normal-santa.png");
const BASE_PROMPT = [
  "use image 1 as the main reference for the exact room composition",
  "keep the same room layout, same camera angle, same wall shape, same tree position, same fireplace position, same window position, same chair position, same desk position, same floor shape, same reindeer position",
  "use image 2 as the face reference for the normal Santa",
  "match the Santa face style from image 2: red hat, round red nose, blush cheeks, white curly mustache and beard, cute cheerful clay expression",
  "keep the output in isometric 3D clay diorama style",
  "winter fixed room theme",
  "keep a plain dark purple background around the room like the base image",
  "do not redesign the room",
  "do not change the room scale or framing",
  "do not create a second room, outer room, inset room, duplicate wall, or room inside room",
  "only adjust Santa pose, lighting, and small time-of-day details",
  "keep only one Santa",
  "no text, no collage, no split view, no extra characters",
].join(". ");

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
  const args = { dryRun: false, slot: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--slot") {
      args.slot = argv[i + 1] ?? null;
      i += 1;
    }
  }
  return args;
}

function buildPrompt(slotKey) {
  const scene = SCENES[slotKey];
  if (!scene) {
    throw new Error(`未対応のslotです: ${slotKey}`);
  }
  return `${BASE_PROMPT}. ${scene.detail}.`;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  throw new Error(`未対応の画像形式です: ${filePath}`);
}

async function readAsDataUri(filePath) {
  const buffer = await readFile(filePath);
  const mimeType = getMimeType(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function saveImage(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`画像ダウンロードに失敗しました: HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(outputPath, Buffer.from(arrayBuffer));
}

async function makeTransparentPng(inputPath, outputPath) {
  await execFileAsync("magick", [
    inputPath,
    "-alpha",
    "set",
    "-fuzz",
    "18%",
    "-fill",
    "none",
    "-draw",
    "color 1,1 floodfill",
    "-draw",
    "color 1022,1 floodfill",
    "-draw",
    "color 1,1022 floodfill",
    "-draw",
    "color 1022,1022 floodfill",
    outputPath,
  ]);
}

async function generateSlot(slotKey) {
  const scene = SCENES[slotKey];
  const prompt = buildPrompt(slotKey);
  const imageUrls = [
    await readAsDataUri(ROOM_REFERENCE_PATH),
    await readAsDataUri(SANTA_FACE_REFERENCE_PATH),
  ];
  const result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
    input: {
      prompt,
      image_urls: imageUrls,
      num_images: 1,
      aspect_ratio: "1:1",
      output_format: "png",
      resolution: "1K",
      limit_generations: true,
      seed: scene.seed,
    },
  });

  const imageUrl = result.data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`${scene.label}: 画像URLが取得できませんでした。`);
  }

  const rawOutputPath = path.join(RAW_OUTPUT_DIR, scene.filename);
  const outputPath = path.join(OUTPUT_DIR, scene.filename);
  await saveImage(imageUrl, rawOutputPath);
  await makeTransparentPng(rawOutputPath, outputPath);
  console.log(`✅ ${scene.label}: ${outputPath}`);
}

async function main() {
  await loadEnvLocal();

  const { dryRun, slot } = parseArgs(process.argv.slice(2));
  const targetSlots = slot ? [slot] : DEFAULT_SLOTS;

  for (const slotKey of targetSlots) {
    if (!SCENES[slotKey]) {
      throw new Error(`未対応のslotです: ${slotKey}`);
    }
  }

  if (dryRun) {
    for (const slotKey of targetSlots) {
      console.log(`--- ${slotKey} ---`);
      console.log(buildPrompt(slotKey));
      console.log("");
    }
    return;
  }

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error("FAL_KEY が見つかりません。.env.local または環境変数に設定してください。");
  }

  fal.config({ credentials: falKey });
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(RAW_OUTPUT_DIR, { recursive: true });

  for (const slotKey of targetSlots) {
    await generateSlot(slotKey);
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
}

main().catch((error) => {
  console.error("生成失敗:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
