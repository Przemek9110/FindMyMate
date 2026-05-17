"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMatchesStore } from "@/store/matchesStore";
import { useChatUiStore } from "@/store/chatUiStore";
import {
  getChatMessages,
  sendChatMessage,
  type Message,
} from "@/lib/api/chat";
import { useAuthStore } from "@/store/authStore";
import { getProfileByUserId } from "@/lib/api/profile";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";

export function ChatDock() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
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
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);

  useEffect(() => {
    async function loadCurrentProfile() {
      const storedProfileId = localStorage.getItem(CURRENT_PROFILE_ID_KEY);

      if (storedProfileId) {
        setCurrentProfileId(Number(storedProfileId));
        return;
      }

      if (!authUser?.id) {
        setCurrentProfileId(null);
        return;
      }

      const profile = await getProfileByUserId(authUser.id);

      if (profile) {
        localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(profile.id));
        setCurrentProfileId(profile.id);
        return;
      }

      setCurrentProfileId(null);
    }

    if (isAuthenticated) {
      loadCurrentProfile();
    }
  }, [authUser?.id, isAuthenticated]);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedUserId || !selectedMatch) {
        setMessages([]);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getChatMessages(selectedMatch.matchId ?? selectedMatch.id);
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

    if (!trimmedMessage || !selectedUserId || !selectedMatch || !currentProfileId) {
      return;
    }

    try {
      setIsSending(true);
      const newMessage = await sendChatMessage(
        selectedMatch.matchId ?? selectedMatch.id,
        currentProfileId,
        trimmedMessage
      );
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
        <Button onClick={toggleChat} className="h-12 rounded-full px-5 shadow-xl">
          <MessageCircle className="size-4" />
          Chat
        </Button>
      ) : (
        <Card className="w-[min(360px,calc(100vw-2rem))] overflow-hidden border-0 bg-card/98 shadow-2xl ring-1 ring-border/70">
          <CardHeader className="relative border-b bg-background/70 p-4 pr-14">
            <div>
              <p className="font-semibold">Chat</p>
              <p className="text-xs text-muted-foreground">
                {selectedMatch
                  ? `Rozmowa z ${selectedMatch.username}`
                  : "Wybierz rozmowę"}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeChat}
              className="absolute right-3 top-3"
              aria-label="Zamknij okno czatu"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>

          {!selectedUserId ? (
            <CardContent className="max-h-[420px] space-y-2 overflow-y-auto p-3">
              {matches.length === 0 ? (
                <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Nie masz jeszcze żadnych rozmów.
                </div>
              ) : (
                matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => selectConversation(match.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border bg-background/60 p-3 text-left transition hover:bg-muted/50"
                  >
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {match.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{match.username}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {match.interests.join(", ") || "Rozpocznij rozmowę"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          ) : (
            <div className="flex h-[460px] flex-col">
              <div className="border-b px-4 py-3">
                <button
                  onClick={() => selectConversation(null)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Wróć do listy rozmów
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Ładowanie wiadomości...
                  </p>
                ) : !currentProfileId ? (
                  <p className="text-sm text-red-500">
                    Najpierw utwórz profil, żeby wysyłać wiadomości.
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Brak wiadomości. Rozpocznij rozmowę.
                  </p>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === String(currentProfileId);

                    return (
                      <div
                        key={message.id}
                        className={`max-w-[85%] rounded-3xl px-4 py-2 text-sm shadow-sm ${
                          isMine
                            ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-muted text-foreground"
                        }`}
                      >
                        {message.text}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex gap-2 border-t bg-background/80 p-3">
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
                <Button
                  onClick={handleSend}
                  disabled={isSending || !currentProfileId}
                  size="icon"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
