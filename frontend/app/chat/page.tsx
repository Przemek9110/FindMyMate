"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMatchesStore } from "@/store/matchesStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getChatMessages,
  sendChatMessage,
  type Message,
} from "@/lib/api/chat";
import { useAuthStore } from "@/store/authStore";
import { getProfileByUserId } from "@/lib/api/profile";
import { PageHeader } from "@/components/layout/page-header";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { matches } = useMatchesStore();
  const authUser = useAuthStore((state) => state.user);
  const selectedMatch = matches.find((match) => match.id === userId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const isSendDisabled = input.trim() === "" || isSending || !currentProfileId;

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

    loadCurrentProfile();
  }, [authUser?.id]);

  const loadMessages = useCallback(async () => {
    if (!userId || !selectedMatch) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await getChatMessages(selectedMatch.matchId ?? selectedMatch.id);
      setMessages(data);
    } catch (error) {
      console.error("Blad podczas pobierania wiadomosci:", error);
      setMessages([]);
      setLoadError("Nie udalo sie pobrac wiadomosci");
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedMatch]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSend = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || !userId || !selectedMatch || !currentProfileId) {
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);
      const newMessage = await sendChatMessage(
        selectedMatch.matchId ?? selectedMatch.id,
        currentProfileId,
        trimmedMessage
      );
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (error) {
      console.error("Blad podczas wysylania wiadomosci:", error);
      setSendError("Nie udalo sie wyslac wiadomosci");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          eyebrow="Rozmowy"
          title="Centrum rozmow"
          description="Pisz do osob, z ktorymi masz dopasowanie."
        />

        {!userId ? (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="size-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Brak rozmow</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Najpierw zdobadz match w Discover.
                    </p>
                  </div>
                  <Button onClick={() => router.push("/discover")}>
                    Przejdz do Discover
                  </Button>
                </CardContent>
              </Card>
            ) : (
              matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => router.push(`/chat?userId=${match.id}`)}
                  className="w-full rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Card className="border-0 bg-card/95 transition hover:shadow-md ring-1 ring-border/70">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {match.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{match.username}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {match.interests.join(", ") || "Rozpocznij rozmowe"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))
            )}
          </div>
        ) : !selectedMatch ? (
          <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nie znaleziono rozmowy dla wybranego uzytkownika.
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-0 bg-card/95 shadow-xl ring-1 ring-border/70">
            <CardHeader className="border-b bg-background/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedMatch.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{selectedMatch.username}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedMatch.interests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/chat")}>
                  <ArrowLeft className="size-4" />
                  Wroc
                </Button>
              </div>
            </CardHeader>

            {!currentProfileId ? (
              <div className="border-b bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-200">
                Najpierw utworz profil, zeby wysylac wiadomosci.
              </div>
            ) : null}

            <CardContent className="flex h-[55vh] min-h-[360px] flex-col p-0">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-2/3 rounded-2xl" />
                    <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
                    <Skeleton className="h-10 w-3/5 rounded-2xl" />
                  </div>
                ) : loadError ? (
                  <div className="space-y-3">
                    <p className="text-sm text-red-500">{loadError}</p>
                    <Button variant="outline" onClick={loadMessages}>
                      Sprobuj ponownie
                    </Button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <p className="text-sm text-muted-foreground">
                      Brak wiadomosci. Rozpocznij rozmowe.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === String(currentProfileId);

                    return (
                      <div
                        key={message.id}
                        className={`max-w-[82%] rounded-3xl px-4 py-2.5 text-sm shadow-sm ${
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
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t bg-background/80 p-3">
                {sendError && (
                  <p className="mb-2 text-sm text-red-500">{sendError}</p>
                )}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Napisz wiadomosc..."
                    disabled={isSending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                    className="h-11"
                  />
                  <Button onClick={handleSend} disabled={isSendDisabled} size="lg">
                    <Send className="size-4" />
                    {isSending ? "..." : "Wyslij"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}
