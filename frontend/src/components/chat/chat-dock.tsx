"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMatchesStore } from "@/store/matchesStore";
import { useChatUiStore } from "@/store/chatUiStore";
import {
  getChatMessages,
  sendChatMessage,
  type Message,
} from "@/lib/api/chat";
import { useAuthStore } from "@/store/authStore";

export function ChatDock() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { matches } = useMatchesStore();

  const {
    isOpen,
    selectedUserId,
    toggleChat,
    closeChat,
    selectConversation,
  } = useChatUiStore();

  const selectedMatch = matches.find((match) => match.id === selectedUserId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedUserId || !selectedMatch) {
        setMessages([]);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getChatMessages(selectedUserId);
        setMessages(data);
      } catch (error) {
        console.error("Błąd podczas pobierania wiadomości:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, selectedUserId, selectedMatch]);

  const handleSend = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || !selectedUserId) {
      return;
    }

    try {
      setIsSending(true);
      const newMessage = await sendChatMessage(selectedUserId, trimmedMessage);
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (error) {
      console.error("Błąd podczas wysyłania wiadomości:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button onClick={toggleChat} className="rounded-full px-5 shadow-lg">
          Chat
        </Button>
      ) : (
        <div className="w-[340px] rounded-2xl border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="font-semibold">Chat</p>
              <p className="text-xs text-muted-foreground">
                {selectedMatch
                  ? `Rozmowa z ${selectedMatch.username}`
                  : "Wybierz rozmowę"}
              </p>
            </div>

            <Button variant="ghost" size="sm" onClick={closeChat}>
              Zamknij
            </Button>
          </div>

          {!selectedUserId ? (
            <div className="max-h-[420px] space-y-2 overflow-y-auto p-3">
              {matches.length === 0 ? (
                <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                  Nie masz jeszcze żadnych rozmów.
                </div>
              ) : (
                matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => selectConversation(match.id)}
                    className="w-full rounded-xl border p-3 text-left transition hover:bg-muted/40"
                  >
                    <p className="font-medium">{match.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {match.interests.join(", ")}
                    </p>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="flex h-[460px] flex-col">
              <div className="border-b px-4 py-3">
                <button
                  onClick={() => selectConversation(null)}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  ← Wróć do listy rozmów
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Ładowanie wiadomości...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Brak wiadomości. Rozpocznij rozmowę.
                  </p>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === "me";

                    return (
                      <div
                        key={message.id}
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                          isMine
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {message.text}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex gap-2 border-t p-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} disabled={isSending}>
                  {isSending ? "..." : "Wyślij"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}