import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Child } from "../../types";

type Props = {
  activeChildId: string;
  children: Child[];
  onOpenSettings: () => void;
  onSelectChild: (childId: string) => void;
};

export function ProfileTabs({
  activeChildId,
  children,
  onOpenSettings,
  onSelectChild,
}: Props) {
  return (
    <View style={styles.topBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {children.map((child) => {
          const isActive = child.id === activeChildId;

          return (
            <Pressable
              key={child.id}
              style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
              onPress={() => onSelectChild(child.id)}
            >
              <MaterialIcons
                name="face"
                size={20}
                color={isActive ? "#FFFFFF" : "#FFFFFF55"}
              />
              <Text
                style={[styles.tabLabel, !isActive ? styles.tabLabelInactive : null]}
              >
                {child.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable style={styles.settingsButton} onPress={onOpenSettings}>
        <MaterialIcons name="settings" size={20} color="#FFFFFF90" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 6,
  },
  tabsRow: {
    gap: 6,
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingRight: 14,
    paddingLeft: 8,
    borderRadius: 100,
  },
  tabActive: {
    backgroundColor: "#FFFFFF22",
  },
  tabInactive: {
    backgroundColor: "#FFFFFF0A",
  },
  tabLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  tabLabelInactive: {
    color: "#FFFFFF55",
    fontFamily: "Inter_600SemiBold",
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF15",
    justifyContent: "center",
    alignItems: "center",
  },
});
