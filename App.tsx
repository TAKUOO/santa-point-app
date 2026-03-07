import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { HomeScreen } from "./components/home/HomeScreen";
import { LetterModal } from "./components/modals/LetterModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { TalkModal } from "./components/modals/TalkModal";
import { SANTAS } from "./constants/santas";
import { calculateMedalCount } from "./constants/medals";
import {
  assignSanta,
  buildSantaReply,
  createDemoLetters,
  extractWishlistItem,
  createInitialChatHistory,
  createInitialWishlist,
  createUniqueId,
  getRandomPoints,
  normalizeChildForCurrentYear,
} from "./services/santa";
import {
  clearStoredAppData,
  loadActiveChildId,
  loadChildren,
  saveActiveChildId,
  saveChildren,
} from "./services/storage";
import { ChatMessage, Child } from "./types";

type ActiveModal = "talk" | "letters" | "settings" | null;

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [pendingAddChildModal, setPendingAddChildModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [storedChildren, storedActiveChildId] = await Promise.all([
          loadChildren(),
          loadActiveChildId(),
        ]);
        const normalizedChildren = storedChildren.map((child) =>
          normalizeChildForCurrentYear(child),
        );
        setChildren(normalizedChildren);
        if (normalizedChildren.length > 0) {
          const activeId =
            normalizedChildren.find((child) => child.id === storedActiveChildId)?.id ??
            normalizedChildren[0].id;
          setActiveChildId(activeId);
        }
      } catch (error) {
        setStorageError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    async function persistChildren() {
      try {
        await saveChildren(children);
      } catch (error) {
        setStorageError("データの保存に失敗しました");
      }
    }

    void persistChildren();
  }, [children, loading]);

  useEffect(() => {
    if (!activeChildId) {
      return;
    }

    const nextActiveChildId = activeChildId;

    async function persistActiveChild() {
      try {
        await saveActiveChildId(nextActiveChildId);
      } catch (error) {
        setStorageError("プロフィールの保存に失敗しました");
      }
    }

    void persistActiveChild();
  }, [activeChildId]);

  useEffect(() => {
    if (pendingAddChildModal && activeModal === null) {
      setShowAddChildModal(true);
      setPendingAddChildModal(false);
    }
  }, [activeModal, pendingAddChildModal]);

  const activeChild = useMemo(
    () => children.find((child) => child.id === activeChildId) ?? null,
    [activeChildId, children],
  );

  const unreadCount = activeChild?.letters.filter((letter) => !letter.isRead).length ?? 0;

  function handleCreateChild(name: string, birthdate: string) {
    const santa = assignSanta(name, birthdate);
    const child: Child = {
      id: createUniqueId("child"),
      name,
      birthdate,
      assignedSanta: santa,
      pointsThisYear: 0,
      pointsAllTime: 0,
      medals: [],
      wishlist: createInitialWishlist(),
      chatHistory: createInitialChatHistory(santa),
      letters: createDemoLetters(name, santa),
      lastResetYear: new Date().getFullYear(),
    };

    setChildren((prev) => [...prev, child]);
    setActiveChildId(child.id);
    setShowAddChildModal(false);
    setActiveModal(null);
  }

  function handleAddChildFromSettings() {
    setPendingAddChildModal(true);
    setActiveModal(null);
  }

  function handleSendReport(text: string) {
    if (!activeChild) {
      return;
    }

    const points = getRandomPoints();
    const childMessage: ChatMessage = {
      id: createUniqueId("chat"),
      role: "child",
      text,
      timestamp: new Date().toISOString(),
    };
    const santaMessage: ChatMessage = {
      id: createUniqueId("chat"),
      role: "santa",
      text: buildSantaReply(activeChild, text, points),
      points,
      timestamp: new Date().toISOString(),
    };

    setChildren((prev) =>
      prev.map((child) => {
        if (child.id !== activeChild.id) {
          return child;
        }

        const normalizedChild = normalizeChildForCurrentYear(child);
        const nextAllTime = normalizedChild.pointsAllTime + points;
        const nextMedalCount = calculateMedalCount(nextAllTime);
        const wishlistCandidate = extractWishlistItem(text);
        const existingMedalSet = new Set(normalizedChild.medals);
        const availableMedals = SANTAS.filter((santa) => !existingMedalSet.has(santa.id)).map(
          (santa) => santa.id,
        );
        const nextMedals = [...normalizedChild.medals];
        const nextWishlist =
          wishlistCandidate && !normalizedChild.wishlist.includes(wishlistCandidate)
            ? [...normalizedChild.wishlist, wishlistCandidate]
            : normalizedChild.wishlist;

        while (nextMedals.length < nextMedalCount && availableMedals.length > 0) {
          const pickIndex = Math.floor(Math.random() * availableMedals.length);
          nextMedals.push(availableMedals.splice(pickIndex, 1)[0]);
        }

        return {
          ...normalizedChild,
          pointsThisYear: normalizedChild.pointsThisYear + points,
          pointsAllTime: nextAllTime,
          medals: nextMedals,
          wishlist: nextWishlist,
          chatHistory: [...normalizedChild.chatHistory, childMessage, santaMessage],
        };
      }),
    );
  }

  function handleMarkLetterRead(letterId: string) {
    if (!activeChild) {
      return;
    }

    setChildren((prev) =>
      prev.map((child) => {
        if (child.id !== activeChild.id) {
          return child;
        }

        return {
          ...child,
          letters: child.letters.map((letter) =>
            letter.id === letterId ? { ...letter, isRead: true } : letter,
          ),
        };
      }),
    );
  }

  function handleSelectChild(childId: string) {
    setChildren((prev) =>
      prev.map((child) =>
        child.id === childId ? normalizeChildForCurrentYear(child) : child,
      ),
    );
    setActiveChildId(childId);
  }

  function handleRemoveWishlistItem(item: string) {
    if (!activeChild) {
      return;
    }

    Alert.alert(
      "ほしいものを削除",
      `「${item}」をほしいものから削除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: () =>
            setChildren((prev) =>
              prev.map((child) => {
                if (child.id !== activeChild.id) {
                  return child;
                }

                return {
                  ...child,
                  wishlist: child.wishlist.filter((wishlistItem) => wishlistItem !== item),
                };
              }),
            ),
        },
      ],
    );
  }

  function showStubAlert(title: string) {
    Alert.alert(title, "このきのうはじゅんびちゅうです");
  }

  function handleDeleteAccount() {
    Alert.alert(
      "アカウントを削除",
      "保存されているお子様情報、会話、ポイント、お願いしたいものをすべて削除します。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await clearStoredAppData();
                setChildren([]);
                setActiveChildId(null);
                setActiveModal(null);
                setShowAddChildModal(false);
                setPendingAddChildModal(false);
                setStorageError(null);
              } catch (error) {
                setStorageError("アカウントの削除に失敗しました");
              }
            })();
          },
        },
      ],
    );
  }

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.centered}>
          <Text style={styles.loadingEmoji}>🎅</Text>
          <Text style={styles.loadingText}>よみこみちゅう...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOnboarding = children.length === 0 || !activeChildId;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      {storageError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{storageError}</Text>
        </View>
      ) : null}

      {isOnboarding ? (
        <OnboardingFlow onCreateChild={handleCreateChild} />
      ) : activeChild ? (
        <>
          <HomeScreen
            activeChild={activeChild}
            children={children}
            unreadCount={unreadCount}
            onRemoveWishlistItem={handleRemoveWishlistItem}
            onOpenLetters={() => setActiveModal("letters")}
            onOpenSettings={() => setActiveModal("settings")}
            onOpenTalk={() => setActiveModal("talk")}
            onSelectChild={handleSelectChild}
          />

          <TalkModal
            child={activeChild}
            visible={activeModal === "talk"}
            onClose={() => setActiveModal(null)}
            onSend={handleSendReport}
          />
          <LetterModal
            child={activeChild}
            visible={activeModal === "letters"}
            onClose={() => setActiveModal(null)}
            onMarkRead={handleMarkLetterRead}
          />
          <SettingsModal
            visible={activeModal === "settings"}
            onClose={() => setActiveModal(null)}
            onAddChild={handleAddChildFromSettings}
            onDeleteAccount={handleDeleteAccount}
            onShowStub={showStubAlert}
          />
          <Modal
            animationType="slide"
            transparent
            visible={showAddChildModal}
            onRequestClose={() => setShowAddChildModal(false)}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setShowAddChildModal(false)}>
              <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
                <OnboardingFlow
                  mode="addChild"
                  onCancel={() => setShowAddChildModal(false)}
                  onCreateChild={handleCreateChild}
                />
              </Pressable>
            </Pressable>
          </Modal>
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1A0F2E",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingEmoji: {
    fontSize: 56,
  },
  loadingText: {
    color: "#FFFFFFAA",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#D43D2F",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  modalCard: {
    height: "93%",
    backgroundColor: "#1A0F2E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#FFFFFF18",
    overflow: "hidden",
  },
});
