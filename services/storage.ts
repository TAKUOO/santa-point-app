import AsyncStorage from "@react-native-async-storage/async-storage";
import { Child } from "../types";

const CHILDREN_KEY = "santa-point:children";
const ACTIVE_CHILD_ID_KEY = "santa-point:active-child-id";

export async function loadChildren(): Promise<Child[]> {
  const raw = await AsyncStorage.getItem(CHILDREN_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Child[]) : [];
  } catch (error) {
    return [];
  }
}

export async function saveChildren(children: Child[]): Promise<void> {
  await AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

export async function loadActiveChildId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_CHILD_ID_KEY);
}

export async function saveActiveChildId(childId: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_CHILD_ID_KEY, childId);
}

export async function clearStoredAppData(): Promise<void> {
  await AsyncStorage.multiRemove([CHILDREN_KEY, ACTIVE_CHILD_ID_KEY]);
}
