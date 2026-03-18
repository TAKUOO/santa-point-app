import { fal } from "@fal-ai/client";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
      "change the base room to night: warm fireplace glow and lamp light, Santa is sitting in the chair holding a coffee cup in his hand, drinking coffee with a calm evening mood before bedtime, the coffee cup must be clearly visible",
  },
};

const DEFAULT_SLOTS = ["late-night", "morning", "daytime", "night"];
const SUPPORTED_RANKS = ["normal", "bronze", "silver", "gold"];
const ROOM_BASE_DIR = path.resolve("assets/generated/rooms/normal");
const OUTPUT_BASE_DIR = path.resolve("assets/generated/rooms");
const RANK_PROMPTS = {
  normal: "normal classic red Santa",
  bronze: "bronze metallic Santa",
  silver: "silver metallic Santa",
  gold: "gold metallic Santa",
};
const RANK_STYLE_NOTES = {
  normal:
    "keep Santa skin on the face and hands natural peach-toned, with a classic red hat, white beard, and warm red clothing",
  bronze:
    "keep Santa skin on the face and hands natural peach-toned, keep the beard and mustache white, use the bronze reference only for the hat styling, make the outfit brown only, coat and sleeves in brown, avoid a full bronze statue look",
  silver:
    "keep Santa skin on the face and hands natural peach-toned, keep the beard and mustache white, use the silver reference only for the hat styling, make the outfit blue-gray only, coat and sleeves in blue-gray, remove red from the outfit, avoid a full silver statue look",
  gold:
    "keep Santa skin on the face and hands natural peach-toned, keep the beard and mustache white, use the gold reference only for the hat styling, make the outfit yellow only, coat and sleeves in yellow, remove red from the outfit, avoid a full gold statue look",
};
const BASE_PROMPT = [
  "use image 1 as the main reference for the exact room composition",
  "keep the same room layout, same camera angle, same wall shape, same tree position, same fireplace position, same window position, same chair position, same desk position, same floor shape, same reindeer position",
  "use image 2 as the Santa design reference",
  "match the Santa face and material style from image 2 while keeping the same room composition",
  "do not recolor the room itself",
  "keep the tree, gifts, fireplace, desk, walls, window, chair, floor, and room decorations in the same colors as image 1",
  "keep the output in isometric 3D clay diorama style",
  "winter fixed room theme",
  "keep a plain dark purple background around the room like the base image",
  "do not redesign the room",
  "do not change the room scale or framing",
  "do not create a second room, outer room, inset room, duplicate wall, or room inside room",
  "replace only the Santa appearance and small lighting details needed for the current rank and time slot",
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
  const args = { dryRun: false, slot: null, rank: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--slot") {
      args.slot = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (token === "--rank") {
      args.rank = argv[i + 1] ?? null;
      i += 1;
    }
  }
  return args;
}

function buildPrompt(rankKey, slotKey) {
  const scene = SCENES[slotKey];
  if (!scene) {
    throw new Error(`未対応のslotです: ${slotKey}`);
  }
  const rankPrompt = RANK_PROMPTS[rankKey];
  const rankStyleNote = RANK_STYLE_NOTES[rankKey];
  if (!rankPrompt) {
    throw new Error(`未対応のrankです: ${rankKey}`);
  }
  const outfitReferenceNote =
    slotKey === "morning"
      ? ""
      : "use image 3 as the exact outfit color reference for Santa, and keep the same coat, sleeves, pants, and overall clothing palette as image 3.";
  const sleepSlotNote =
    slotKey === "late-night"
      ? "for the bedtime scene, keep Santa skin natural, keep the beard white, keep any blanket or bed fabric in normal cozy fabric colors, and keep the pajamas or sleepwear in the same palette as image 3 instead of turning the whole body gold or silver."
      : "";
  return `${BASE_PROMPT}. ${outfitReferenceNote} ${sleepSlotNote} make the Santa clearly read as ${rankPrompt}. ${rankStyleNote}. ${scene.detail}.`;
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

async function finalizeImage(inputPath, outputPath) {
  await copyFile(inputPath, outputPath);
}

function getBaseRoomPath(slotKey) {
  const scene = SCENES[slotKey];
  return path.join(ROOM_BASE_DIR, scene.filename);
}

function getSantaReferencePath(rankKey) {
  return path.resolve(`assets/rooms/santas/${rankKey}-santa.png`);
}

function getOutputPaths(rankKey, slotKey) {
  const scene = SCENES[slotKey];
  const outputDir = path.join(OUTPUT_BASE_DIR, rankKey);
  const rawOutputDir = path.join(outputDir, "raw");
  const outputFilename = `${rankKey}-santa-${slotKey}.png`;
  return {
    outputDir,
    rawOutputDir,
    outputPath: path.join(outputDir, outputFilename),
    rawOutputPath: path.join(rawOutputDir, outputFilename),
  };
}

async function generateSlot(rankKey, slotKey) {
  const scene = SCENES[slotKey];
  const prompt = buildPrompt(rankKey, slotKey);
  const imageUrls = [
    await readAsDataUri(getBaseRoomPath(slotKey)),
    await readAsDataUri(getSantaReferencePath(rankKey)),
  ];
  if (slotKey !== "morning") {
    imageUrls.push(await readAsDataUri(path.join(OUTPUT_BASE_DIR, rankKey, `${rankKey}-santa-morning.png`)));
  }
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

  const { rawOutputPath, outputPath } = getOutputPaths(rankKey, slotKey);
  await saveImage(imageUrl, rawOutputPath);
  await finalizeImage(rawOutputPath, outputPath);
  console.log(`✅ ${rankKey}/${scene.label}: ${outputPath}`);
}

async function main() {
  await loadEnvLocal();

  const { dryRun, slot, rank } = parseArgs(process.argv.slice(2));
  const targetSlots = slot ? [slot] : DEFAULT_SLOTS;
  const targetRanks = rank ? [rank] : SUPPORTED_RANKS.filter((item) => item !== "normal");

  for (const slotKey of targetSlots) {
    if (!SCENES[slotKey]) {
      throw new Error(`未対応のslotです: ${slotKey}`);
    }
  }
  for (const rankKey of targetRanks) {
    if (!SUPPORTED_RANKS.includes(rankKey)) {
      throw new Error(`未対応のrankです: ${rankKey}`);
    }
  }

  if (dryRun) {
    for (const rankKey of targetRanks) {
      for (const slotKey of targetSlots) {
        console.log(`--- ${rankKey}/${slotKey} ---`);
        console.log(buildPrompt(rankKey, slotKey));
        console.log("");
      }
    }
    return;
  }

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error("FAL_KEY が見つかりません。.env.local または環境変数に設定してください。");
  }

  fal.config({ credentials: falKey });
  for (const rankKey of targetRanks) {
    const { outputDir, rawOutputDir } = getOutputPaths(rankKey, targetSlots[0]);
    await mkdir(outputDir, { recursive: true });
    await mkdir(rawOutputDir, { recursive: true });

    for (const slotKey of targetSlots) {
      await generateSlot(rankKey, slotKey);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }
}

main().catch((error) => {
  console.error("生成失敗:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
