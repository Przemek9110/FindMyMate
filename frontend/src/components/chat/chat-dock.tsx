"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const getCurrentProfileIdKey = (userId: string | number) =>
  `currentProfileId:${userId}`;

export function ChatDock() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const authUserId = useAuthStore((state) => state.user?.id);

  const matches = useMatchesStore((state) => state.matches);

  const isOpen = useChatUiStore((state) => state.isOpen);
  const selectedUserId = useChatUiStore((state) => state.selectedUserId);
  const toggleChat = useChatUiStore((state) => state.toggleChat);
  const closeChat = useChatUiStore((state) => state.closeChat);
  const selectConversation = useChatUiStore(
    (state) => state.selectConversation
  );

  const isAuthenticated = Boolean(token);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedUserId),
    [matches, selectedUserId]
  );

  const selectedMatchRequestId = selectedMatch
    ? selectedMatch.matchId ?? selectedMatch.id
    : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) {
      setCurrentProfileId(null);
      return;
    }

    if (authUserId == null) {
      setCurrentProfileId(null);
      return;
    }

    const userId = authUserId;
    let cancelled = false;

    async function loadCurrentProfile() {
      const profileIdKey = getCurrentProfileIdKey(userId);
      const storedProfileId = localStorage.getItem(profileIdKey);

      if (storedProfileId) {
        setCurrentProfileId(Number(storedProfileId));
        return;
      }

      try {
        const profile = await getProfileByUserId(userId);

        if (cancelled) {
          return;
        }

        if (profile) {
          localStorage.setItem(profileIdKey, String(profile.id));
          setCurrentProfileId(profile.id);
          return;
        }

        setCurrentProfileId(null);
      } catch (error) {
        console.error("Błąd podczas pobierania profilu dla chatu:", error);

        if (!cancelled) {
          setCurrentProfileId(null);
        }
      }
    }

    loadCurrentProfile();

    return () => {
      cancelled = true;
    };
  }, [authUserId, hasHydrated, isAuthenticated]);

  useEffect(() => {
    if (!isOpen || selectedMatchRequestId == null) {
      setMessages([]);
      return;
    }

    const matchRequestId = selectedMatchRequestId;
    let cancelled = false;

    async function loadMessages() {
      try {
        setIsLoading(true);

        const data = await getChatMessages(matchRequestId);

        if (!cancelled) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania wiadomości:", error);

        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedMatchRequestId]);

  const handleSend = async () => {
    const trimmedMessage = input.trim();

    if (
      !trimmedMessage ||
      selectedUserId == null ||
      selectedMatchRequestId == null ||
      currentProfileId == null
    ) {
      return;
    }

    const matchRequestId = selectedMatchRequestId;
    const senderProfileId = currentProfileId;

    try {
      setIsSending(true);

      const newMessage = await sendChatMessage(
        matchRequestId,
        senderProfileId,
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

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          type="button"
          onClick={toggleChat}
          className="h-13 rounded-full px-5 font-bold shadow-2xl shadow-primary/20 ring-1 ring-primary/20"
        >
          <MessageCircle className="size-4" />
          Chat
          {matches.length > 0 ? (
            <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
              {matches.length}
            </span>
          ) : null}
        </Button>
      ) : (
        <Card className="w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border-0 bg-card/98 shadow-2xl ring-1 ring-border/70 backdrop-blur">
          <CardHeader className="relative border-b bg-muted/25 p-4 pr-14">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-[-0.025em]">
                  {selectedMatch ? selectedMatch.username : "Chat"}
                </p>
                <p className="truncate text-xs text-foreground/60">
                  {selectedMatch
                    ? "Rozmowa po dopasowaniu"
                    : "Wybierz rozmowę z listy"}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="absolute right-3 top-3 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Zamknij okno czatu"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>

          {!selectedUserId ? (
            <CardContent className="max-h-[430px] space-y-3 overflow-y-auto p-3">
              {matches.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-muted/20 p-6 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-5" />
                  </div>

                  <div>
                    <p className="font-extrabold tracking-[-0.02em]">
                      Nie masz jeszcze rozmów
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground/60">
                      Rozmowy pojawią się po wzajemnym dopasowaniu.
                    </p>
                  </div>
                </div>
              ) : (
                matches.map((match) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => selectConversation(match.id)}
                    className="group flex w-full items-center gap-3 rounded-3xl border bg-background/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                  >
                    <Avatar className="size-11 border-4 border-background shadow-sm">
                      {match.photoUrl ? (
                        <AvatarImage
                          src={match.photoUrl}
                          alt={`Zdjęcie profilu ${match.username}`}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-base font-black text-primary">
                        {match.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-extrabold tracking-[-0.015em]">
                          {match.username}
                        </p>

                        <Badge
                          variant="accent"
                          className="hidden rounded-full px-2 py-0 text-[10px] sm:inline-flex"
                        >
                          match
                        </Badge>
                      </div>

                      <p className="mt-0.5 truncate text-sm text-foreground/60">
                        {match.interests.join(", ") || "Rozpocznij rozmowę"}
                      </p>
                    </div>

                    <MessageCircle className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </button>
                ))
              )}
            </CardContent>
          ) : (
            <div className="flex h-[480px] flex-col">
              <div className="border-b bg-background/50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => selectConversation(null)}
                  className="inline-flex items-center gap-2 rounded-full text-sm font-bold text-foreground/65 transition hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Wróć do listy rozmów
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-background/35 p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-10 w-2/3 animate-pulse rounded-3xl bg-muted" />
                    <div className="ml-auto h-10 w-1/2 animate-pulse rounded-3xl bg-muted" />
                    <div className="h-10 w-3/5 animate-pulse rounded-3xl bg-muted" />
                  </div>
                ) : !currentProfileId ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                    Najpierw utwórz profil, żeby wysyłać wiadomości.
                  </div>
                ) : messages.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <div className="max-w-[260px]">
                      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageCircle className="size-5" />
                      </div>

                      <p className="font-extrabold tracking-[-0.02em]">
                        Rozpocznij rozmowę
                      </p>
                      <p className="mt-1 text-sm leading-6 text-foreground/60">
                        Napisz pierwszą wiadomość i nawiąż kontakt.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine =
                      String(message.senderId) === String(currentProfileId);

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-[1.35rem] px-4 py-2.5 text-sm leading-6 shadow-sm ${
                            isMine
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md bg-card text-foreground ring-1 ring-border/70"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t bg-card p-3">
                <div className="flex gap-2">
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
                    className="h-11 rounded-full px-4"
                  />

                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={
                      isSending || !currentProfileId || !input.trim()
                    }
                    size="icon"
                    className="size-11 shrink-0 rounded-full shadow-md shadow-primary/20"
                    aria-label="Wyślij wiadomość"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
