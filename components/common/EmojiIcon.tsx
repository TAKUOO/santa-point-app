import { Image, ImageStyle, StyleProp } from "react-native";

const EMOJI_ICON_SOURCES = {
  christmasTree: require("../../assets/ui/emoji-icons/christmas-tree.png"),
  coin: require("../../assets/ui/emoji-icons/coin.png"),
  santa: require("../../assets/ui/emoji-icons/santa.png"),
  incomingEnvelope: require("../../assets/ui/emoji-icons/incoming-envelope.png"),
  gift: require("../../assets/ui/emoji-icons/gift.png"),
  package: require("../../assets/ui/emoji-icons/package.png"),
  snowflake: require("../../assets/ui/emoji-icons/snowflake.png"),
  sparkles: require("../../assets/ui/emoji-icons/sparkles.png"),
  outboxTray: require("../../assets/ui/emoji-icons/outbox-tray.png"),
  inboxTray: require("../../assets/ui/emoji-icons/inbox-tray.png"),
  link: require("../../assets/ui/emoji-icons/link.png"),
  document: require("../../assets/ui/emoji-icons/document.png"),
  trash: require("../../assets/ui/emoji-icons/trash.png"),
  plus: require("../../assets/ui/emoji-icons/plus.png"),
} as const;

export type EmojiIconName = keyof typeof EMOJI_ICON_SOURCES;

type Props = {
  name: EmojiIconName;
  size: number;
  style?: StyleProp<ImageStyle>;
};

export function EmojiIcon({ name, size, style }: Props) {
  return (
    <Image
      source={EMOJI_ICON_SOURCES[name]}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      fadeDuration={0}
    />
  );
}
