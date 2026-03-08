import { fal } from "@fal-ai/client";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_PROMPT =
  "isometric 3D claymation style, cute chibi Santa Claus in cozy room, clay texture, soft rounded shapes, warm studio lighting, pastel colors, white background, full body, centered";

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
    // .env.local is optional; environment variable may already be set.
  }
}

async function main() {
  await loadEnvLocal();

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error("FAL_KEY が見つかりません。.env.local または環境変数に設定してください。");
  }

  fal.config({ credentials: falKey });

  const prompt = process.argv[2] || DEFAULT_PROMPT;
  const outputDir = path.resolve("assets/generated");
  const outputPath = path.join(outputDir, "nanobanana_test_001.png");

  await mkdir(outputDir, { recursive: true });

  const result = await fal.subscribe("fal-ai/nano-banana-2", {
    input: {
      prompt,
      num_images: 1,
      aspect_ratio: "1:1",
    },
  });

  const imageUrl = result.data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error("画像URLが取得できませんでした。");
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`画像ダウンロードに失敗しました: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await writeFile(outputPath, Buffer.from(arrayBuffer));

  console.log("生成完了:", outputPath);
}

main().catch((error) => {
  console.error("生成失敗:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
