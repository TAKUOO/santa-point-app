import { Buffer } from "buffer";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as Speech from "expo-speech";

const DEFAULT_LANGUAGE = "ja-JP";
const ELEVENLABS_MODEL = "eleven_multilingual_v2";

type AudioPlayerLike = {
  play: () => void;
  pause?: () => void;
  remove?: () => void;
  addListener?: (
    eventName: string,
    listener: (status: { isLoaded?: boolean; didJustFinish?: boolean }) => void,
  ) => { remove?: () => void };
};

type ExpoAudioLike = {
  createAudioPlayer: (source: string) => AudioPlayerLike;
};

let currentElevenLabsPlayer: AudioPlayerLike | null = null;
let currentElevenLabsAudioUri: string | null = null;
let cachedExpoAudioModule: ExpoAudioLike | null | undefined;

function getExpoAudioModule(): ExpoAudioLike | null {
  if (cachedExpoAudioModule !== undefined) {
    return cachedExpoAudioModule ?? null;
  }
  try {
    // expo-audio が実行環境にない場合でもクラッシュさせず、端末TTSへフォールバックする
    cachedExpoAudioModule = require("expo-audio");
  } catch {
    cachedExpoAudioModule = null;
  }
  return cachedExpoAudioModule ?? null;
}

function getElevenLabsConfig(): { apiKey: string; voiceId: string } {
  const extra = Constants.expoConfig?.extra as
    | { elevenLabsApiKey?: string; elevenLabsVoiceId?: string }
    | undefined;
  return {
    apiKey: extra?.elevenLabsApiKey ?? "",
    voiceId: extra?.elevenLabsVoiceId ?? "",
  };
}

// Enhanced品質の音声を優先（より自然）、なければ通常の日本語音声を使用
let cachedVoiceId: string | undefined;

async function getPreferredVoice(): Promise<string | undefined> {
  if (cachedVoiceId) {
    return cachedVoiceId;
  }
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const jaVoices = voices.filter(
      (v) => v.language.startsWith("ja") || v.language === "ja-JP",
    );
    const enhanced = jaVoices.find(
      (v) => (v as { quality?: string }).quality === "Enhanced",
    );
    cachedVoiceId = enhanced?.identifier ?? jaVoices[0]?.identifier;
    return cachedVoiceId;
  } catch {
    return undefined;
  }
}

function normalizeSpeechText(text: string): string {
  return text.replace(/\n+/g, " ").trim();
}

async function speakWithElevenLabs(text: string): Promise<boolean> {
  const { apiKey, voiceId } = getElevenLabsConfig();
  if (!apiKey || !voiceId) {
    return false;
  }
  const ExpoAudio = getExpoAudioModule();
  if (!ExpoAudio) {
    return false;
  }

  await stopSantaSpeech();

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_MODEL,
          language_code: "ja",
        }),
      },
    );

    if (!res.ok) {
      return false;
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    if (!FileSystem.cacheDirectory) {
      return false;
    }
    const tempAudioUri = `${FileSystem.cacheDirectory}santa-elevenlabs-${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(tempAudioUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    currentElevenLabsAudioUri = tempAudioUri;

    const player = ExpoAudio.createAudioPlayer(tempAudioUri);
    currentElevenLabsPlayer = player;

    player.addListener?.("playbackStatusUpdate", (status) => {
      if (status.isLoaded && status.didJustFinish) {
        currentElevenLabsPlayer = null;
        player.remove?.();
        if (currentElevenLabsAudioUri) {
          FileSystem.deleteAsync(currentElevenLabsAudioUri, { idempotent: true }).catch(() => {});
          currentElevenLabsAudioUri = null;
        }
      }
    });
    player.play();

    return true;
  } catch {
    return false;
  }
}

export async function speakSantaReply(text: string): Promise<void> {
  const normalizedText = normalizeSpeechText(text);
  if (!normalizedText) {
    return;
  }

  const usedElevenLabs = await speakWithElevenLabs(normalizedText);
  if (usedElevenLabs) {
    return;
  }

  const isSpeaking = await Speech.isSpeakingAsync();
  if (isSpeaking) {
    Speech.stop();
  }

  const voiceId = await getPreferredVoice();

  Speech.speak(normalizedText, {
    language: DEFAULT_LANGUAGE,
    voice: voiceId,
    pitch: 0.92,
    rate: 0.88,
  });
}

export async function stopSantaSpeech(): Promise<void> {
  if (currentElevenLabsPlayer) {
    try {
      currentElevenLabsPlayer.pause?.();
      currentElevenLabsPlayer.remove?.();
    } catch {
      // ignore
    }
    currentElevenLabsPlayer = null;
  }
  if (currentElevenLabsAudioUri) {
    try {
      await FileSystem.deleteAsync(currentElevenLabsAudioUri, { idempotent: true });
    } catch {
      // ignore
    }
    currentElevenLabsAudioUri = null;
  }
  Speech.stop();
}
