import { useCallback, useRef } from "react";

const STORAGE_KEY = "uigen_prompt_history";
const MAX_HISTORY = 100;

function readHistory(): readonly string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeHistory(history: readonly string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export interface UsePromptHistoryResult {
  readonly pushToHistory: (prompt: string) => void;
  readonly navigateHistory: (
    direction: "up" | "down",
    currentInput: string,
  ) => string | null;
  readonly resetCursor: () => void;
}

export function usePromptHistory(): UsePromptHistoryResult {
  // -1 means the live draft position (no history entry is selected)
  const cursorRef = useRef<number>(-1);
  // Preserves the user's typed draft while navigating history
  const draftRef = useRef<string>("");

  const pushToHistory = useCallback((prompt: string): void => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const history = readHistory();
    if (history[0] === trimmed) return; // suppress consecutive duplicates
    const next = [trimmed, ...history].slice(0, MAX_HISTORY);
    writeHistory(next);
    cursorRef.current = -1;
  }, []);

  const navigateHistory = useCallback(
    (direction: "up" | "down", currentInput: string): string | null => {
      const history = readHistory();
      if (history.length === 0) return null;

      if (direction === "up") {
        if (cursorRef.current === -1) {
          draftRef.current = currentInput;
        }
        const next = cursorRef.current + 1;
        if (next >= history.length) return null;
        cursorRef.current = next;
        return history[next];
      }

      // direction === "down"
      if (cursorRef.current === -1) return null;
      const next = cursorRef.current - 1;
      if (next < 0) {
        cursorRef.current = -1;
        return draftRef.current;
      }
      cursorRef.current = next;
      return history[next];
    },
    [],
  );

  const resetCursor = useCallback((): void => {
    cursorRef.current = -1;
  }, []);

  return { pushToHistory, navigateHistory, resetCursor };
}
