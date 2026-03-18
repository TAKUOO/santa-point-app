import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LEGAL_DOCUMENTS, LegalDocumentId } from "../../constants/legalDocuments";

type Props = {
  documentId: LegalDocumentId;
  onClose: () => void;
};

const colors = {
  bg: "#1A0F2E",
  surface: "#FFFFFF10",
  surfaceBorder: "#FFFFFF14",
  text: "#FFFFFFEE",
  textSecondary: "#FFFFFF99",
  accent: "#67A8FF",
};

export function LegalDocumentScreen({ documentId, onClose }: Props) {
  const document = LEGAL_DOCUMENTS[documentId];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>{document.title}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.updatedAt}>最終更新日 {document.updatedAt}</Text>
          <Text style={styles.intro}>{document.intro}</Text>
        </View>

        {document.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.body.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.bg,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF15",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  spacer: {
    width: 32,
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 20,
    gap: 10,
  },
  updatedAt: {
    color: colors.accent,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  intro: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_500Medium",
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 10,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 23,
    fontFamily: "Inter_500Medium",
  },
});
