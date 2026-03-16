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
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { HomeScreen } from "./components/home/HomeScreen";
import { LetterModal } from "./components/modals/LetterModal";
import { RankUpCelebrationModal } from "./components/modals/RankUpCelebrationModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { TalkModal } from "./components/modals/TalkModal";
import { ChildEditorModal } from "./components/modals/ChildEditorModal";
import { MEDAL_SANTA_IDS } from "./constants/santas";
import { calculateMedalCount, getCurrentMedalRank } from "./constants/medals";
import {
  assignSanta,
  buildSantaReply,
  buildSantaSpeechReply,
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
import { stopSantaSpeech } from "./services/tts";
import { ChatMessage, Child } from "./types";

type ActiveModal = "talk" | "letters" | null;
type ActiveScreen = "home" | "settings";
type PendingRankUp = {
  childId: string;
  medalCount: number;
  rankName: string;
};

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
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [pendingEditChildId, setPendingEditChildId] = useState<string | null>(null);
  const [pendingRankUp, setPendingRankUp] = useState<PendingRankUp | null>(null);
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
    if (pendingEditChildId && activeModal === null) {
      setEditingChildId(pendingEditChildId);
      setPendingEditChildId(null);
    }
  }, [activeModal, pendingEditChildId]);

  useEffect(() => {
    if (pendingRankUp && pendingRankUp.childId !== activeChildId) {
      setPendingRankUp(null);
    }
  }, [activeChildId, pendingRankUp]);

  useEffect(() => () => { void stopSantaSpeech(); }, []);

  const activeChild = useMemo(
    () => children.find((child) => child.id === activeChildId) ?? null,
    [activeChildId, children],
  );
  const editingChild = useMemo(
    () => children.find((child) => child.id === editingChildId) ?? null,
    [children, editingChildId],
  );
  const handleDismissRankUpCelebration = useCallback(() => {
    setPendingRankUp(null);
  }, []);

  const handleDebugShowRankUp = useCallback(() => {
    if (!activeChild) return;
    const nextMedalCount = Math.min(activeChild.medals.length + 1, 10);
    setPendingRankUp({
      childId: activeChild.id,
      medalCount: nextMedalCount,
      rankName: getCurrentMedalRank(nextMedalCount).name,
    });
  }, [activeChild]);

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
  }

  function handleAddChildFromSettings() {
    setShowAddChildModal(true);
  }

  function handleStartEditChild(childId: string) {
    setPendingEditChildId(childId);
    setActiveModal(null);
  }

  function handleSaveChildEdits(childId: string, name: string, birthdate: string) {
    setChildren((prev) =>
      prev.map((child) =>
        child.id === childId
          ? {
              ...child,
              name,
              birthdate,
            }
          : child,
      ),
    );
    setEditingChildId(null);
  }

  function handleSendReport(text: string): string | undefined {
    if (!activeChild) {
      return undefined;
    }

    const normalizedActiveChild = normalizeChildForCurrentYear(activeChild);
    const points = getRandomPoints();
    const wishlistCandidate = extractWishlistItem(text);
    const nextAllTime = normalizedActiveChild.pointsAllTime + points;
    const nextMedalCount = calculateMedalCount(nextAllTime);
    const nextMedals = MEDAL_SANTA_IDS.slice(0, nextMedalCount);
    const childMessage: ChatMessage = {
      id: createUniqueId("chat"),
      role: "child",
      text,
      timestamp: new Date().toISOString(),
    };
    const wishlistAdded =
      !!wishlistCandidate && !normalizedActiveChild.wishlist.includes(wishlistCandidate);
    const santaSpeechText = buildSantaSpeechReply(text, points, wishlistAdded);
    const santaMessage: ChatMessage = {
      id: createUniqueId("chat"),
      role: "santa",
      text: buildSantaReply(activeChild, text, points, wishlistAdded),
      points: wishlistAdded ? undefined : points,
      timestamp: new Date().toISOString(),
    };

    if (nextMedalCount > normalizedActiveChild.medals.length) {
      setPendingRankUp({
        childId: normalizedActiveChild.id,
        medalCount: nextMedalCount,
        rankName: getCurrentMedalRank(nextMedalCount).name,
      });
    }

    setChildren((prev) =>
      prev.map((child) => {
        if (child.id !== activeChild.id) {
          return child;
        }

        const nextWishlist = wishlistAdded
          ? [...normalizedActiveChild.wishlist, wishlistCandidate!]
          : normalizedActiveChild.wishlist;

        return {
          ...normalizedActiveChild,
          pointsThisYear: normalizedActiveChild.pointsThisYear + points,
          pointsAllTime: nextAllTime,
          medals: nextMedals,
          wishlist: nextWishlist,
          chatHistory: [...normalizedActiveChild.chatHistory, childMessage, santaMessage],
        };
      }),
    );

    return santaSpeechText;
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
                setActiveScreen("home");
                setShowAddChildModal(false);
                setEditingChildId(null);
                setPendingEditChildId(null);
                setPendingRankUp(null);
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

  function handleDeleteChild(childId: string) {
    const targetChild = children.find((child) => child.id === childId);
    if (!targetChild) {
      return;
    }

    Alert.alert(
      "お子様を削除",
      `「${targetChild.name}」の情報を削除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: () => {
            setChildren((prev) => {
              const nextChildren = prev.filter((child) => child.id !== childId);
              const nextActiveChildId =
                activeChildId === childId ? nextChildren[0]?.id ?? null : activeChildId;
              setActiveChildId(nextActiveChildId);
              if (nextChildren.length === 0) {
                setActiveScreen("home");
              }
              return nextChildren;
            });
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
          <ActivityIndicator size="large" color="#FFFFFFAA" />
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
          {activeScreen === "home" ? (
            <HomeScreen
              activeChild={activeChild}
              children={children}
              unreadCount={unreadCount}
              onDebugShowRankUp={__DEV__ ? handleDebugShowRankUp : undefined}
              onRemoveWishlistItem={handleRemoveWishlistItem}
              onOpenLetters={() => setActiveModal("letters")}
              onOpenSettings={() => setActiveScreen("settings")}
              onOpenTalk={() => setActiveModal("talk")}
              onSelectChild={handleSelectChild}
            />
          ) : (
            <SettingsModal
              children={children}
              onClose={() => setActiveScreen("home")}
              onAddChild={handleAddChildFromSettings}
              onDeleteChild={handleDeleteChild}
              onEditChild={handleStartEditChild}
              onDeleteAccount={handleDeleteAccount}
              onShowStub={showStubAlert}
            />
          )}

          <TalkModal
            child={activeChild}
            visible={activeModal === "talk"}
            onClose={() => setActiveModal(null)}
            onSend={handleSendReport}
          />
          <RankUpCelebrationModal
            medalCount={pendingRankUp?.medalCount ?? 0}
            rankName={pendingRankUp?.rankName ?? ""}
            visible={
              activeScreen === "home" &&
              activeModal === null &&
              pendingRankUp?.childId === activeChild.id
            }
            onClose={handleDismissRankUpCelebration}
          />
          <LetterModal
            child={activeChild}
            visible={activeModal === "letters"}
            onClose={() => setActiveModal(null)}
            onMarkRead={handleMarkLetterRead}
          />
          <ChildEditorModal
            child={editingChild}
            visible={editingChildId !== null}
            onClose={() => setEditingChildId(null)}
            onSave={handleSaveChildEdits}
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
