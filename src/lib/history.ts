import { HistoryEntry } from "@/types/analysis";

const STORAGE_KEY = "analysis-history";

export const getHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToHistory = (entry: HistoryEntry): HistoryEntry[] => {
  const history = getHistory();
  const updated = [entry, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteFromHistory = (id: string): HistoryEntry[] => {
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
