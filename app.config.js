const appJson = require("./app.json");

require("dotenv").config({ path: ".env.local" });

const existingPlugins = appJson.expo.plugins ?? [];
const hasExpoAudioPlugin = existingPlugins.some((plugin) =>
  Array.isArray(plugin) ? plugin[0] === "expo-audio" : plugin === "expo-audio",
);

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    plugins: hasExpoAudioPlugin ? existingPlugins : [...existingPlugins, "expo-audio"],
    extra: {
      elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
      elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID ?? "",
    },
  },
};
