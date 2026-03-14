"use client";

import { useCallback, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/contexts/chat-context";
import { usePromptHistory } from "@/lib/hooks/use-prompt-history";

export function ChatInterface() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat();
  const { pushToHistory, navigateHistory, resetCursor } = usePromptHistory();

  const handleHistoryNavigate = useCallback(
    (direction: "up" | "down"): void => {
      const next = navigateHistory(direction, input);
      if (next !== null) {
        setInput(next);
      }
    },
    [navigateHistory, input, setInput],
  );

  const handleSubmitWithHistory = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      pushToHistory(input);
      resetCursor();
      handleSubmit(e);
    },
    [input, pushToHistory, resetCursor, handleSubmit],
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden">
        <div className="pr-4">
          <MessageList messages={messages} isLoading={status === "streaming"} />
        </div>
      </ScrollArea>
      <div className="mt-4 flex-shrink-0">
        <MessageInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmitWithHistory}
          isLoading={status === "submitted" || status === "streaming"}
          onHistoryNavigate={handleHistoryNavigate}
          onResetHistoryCursor={resetCursor}
        />
      </div>
    </div>
  );
}
