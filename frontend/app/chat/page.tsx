"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
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

  const matches = useMatchesStore((state) => state.matches);

  const authUserId = useAuthStore((state) => state.user?.id);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isAuthenticated = Boolean(token);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === userId),
    [matches, userId]
  );

  const selectedMatchRequestId = selectedMatch
    ? selectedMatch.matchId ?? selectedMatch.id
    : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);

  const isSendDisabled = input.trim() === "" || isSending || !currentProfileId;

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) {
      setCurrentProfileId(null);
      return;
    }

    let cancelled = false;

    async function loadCurrentProfile() {
      if (!authUserId) {
        setCurrentProfileId(null);
        return;
      }

      try {
        const profile = await getProfileByUserId(authUserId);

        if (cancelled) {
          return;
        }

        if (profile) {
          localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(profile.id));
          setCurrentProfileId(profile.id);
          return;
        }

        localStorage.removeItem(CURRENT_PROFILE_ID_KEY);
        setCurrentProfileId(null);
      } catch (error) {
        console.error("Błąd podczas pobierania profilu dla czatu:", error);

        if (!cancelled) {
          localStorage.removeItem(CURRENT_PROFILE_ID_KEY);
          setCurrentProfileId(null);
        }
      }
    }

    loadCurrentProfile();

    return () => {
      cancelled = true;
    };
  }, [authUserId, hasHydrated, isAuthenticated]);

  const loadMessages = useCallback(async () => {
    if (!userId || !selectedMatchRequestId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const data = await getChatMessages(selectedMatchRequestId);

      setMessages(data);
    } catch (error) {
      console.error("Błąd podczas pobierania wiadomości:", error);
      setMessages([]);
      setLoadError("Nie udało się pobrać wiadomości.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedMatchRequestId]);

  useEffect(() => {
    let cancelled = false;

    async function runLoadMessages() {
      if (cancelled) {
        return;
      }

      await loadMessages();
    }

    runLoadMessages();

    return () => {
      cancelled = true;
    };
  }, [loadMessages]);

  const handleSend = async () => {
    const trimmedMessage = input.trim();

    if (
      !trimmedMessage ||
      !userId ||
      !selectedMatchRequestId ||
      !currentProfileId
    ) {
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);

      const newMessage = await sendChatMessage(
        selectedMatchRequestId,
        currentProfileId,
        trimmedMessage
      );

      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (error) {
      console.error("Błąd podczas wysyłania wiadomości:", error);
      setSendError("Nie udało się wysłać wiadomości.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ProtectedRoute>
      <section className="mx-auto max-w-6xl space-y-8 py-4 sm:py-8">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-8 shadow-sm ring-1 ring-border/70 sm:px-8">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 size-72 rounded-full bg-accent/60 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader
              eyebrow="Rozmowy"
              title="Centrum rozmów"
              description="Pisz do osób, z którymi masz dopasowanie. Wybierz rozmowę albo rozpocznij nową z listy matchy."
            />

            <Button
              type="button"
              onClick={() => router.push("/matches")}
              variant="outline"
              className="h-11 rounded-full px-5"
            >
              Zobacz dopasowania
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {!userId ? (
          <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
            <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
              <CardHeader className="p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageCircle className="size-6" />
                </div>

                <div className="mt-4">
                  <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
                    Twoje rozmowy
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-foreground/68">
                    Lista rozmów pojawi się po utworzeniu wzajemnego
                    dopasowania.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <Button
                  type="button"
                  onClick={() => router.push("/discover")}
                  className="h-11 w-full rounded-full"
                >
                  Odkrywaj osoby
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {matches.length === 0 ? (
                <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                  <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="size-7" />
                    </div>

                    <div>
                      <h2 className="text-xl font-extrabold tracking-[-0.025em]">
                        Brak rozmów
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-foreground/68">
                        Najpierw zdobądź match w odkrywaniu. Kiedy druga osoba
                        też Cię polubi, rozmowa pojawi się tutaj.
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => router.push("/discover")}
                      className="rounded-full"
                    >
                      Przejdź do odkrywania
                      <ArrowRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => router.push(`/chat?userId=${match.id}`)}
                    className="group w-full rounded-[1.5rem] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70 transition group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-primary/25">
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="size-14 border-4 border-background shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-lg font-black text-primary">
                            {match.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-base font-extrabold tracking-[-0.015em]">
                              {match.username}
                            </p>
                            <Badge variant="accent" className="rounded-full">
                              match
                            </Badge>
                          </div>

                          <p className="mt-1 truncate text-sm text-foreground/65">
                            {match.interests.join(", ") ||
                              "Rozpocznij rozmowę"}
                          </p>
                        </div>

                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground/60 transition group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="size-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : !selectedMatch ? (
          <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted text-foreground/70">
                <UserRound className="size-7" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-[-0.025em]">
                  Nie znaleziono rozmowy
                </h2>
                <p className="mt-2 text-sm leading-6 text-foreground/68">
                  Wybrana rozmowa nie istnieje albo nie masz już tego
                  dopasowania.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => router.push("/chat")}
                variant="outline"
                className="rounded-full"
              >
                <ArrowLeft className="size-4" />
                Wróć do rozmów
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-0 bg-card/95 shadow-xl ring-1 ring-border/70">
            <CardHeader className="border-b bg-muted/25 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar className="size-14 border-4 border-background shadow-sm">
                    <AvatarFallback className="bg-primary text-lg font-black text-primary-foreground">
                      {selectedMatch.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-extrabold tracking-[-0.02em]">
                      {selectedMatch.username}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedMatch.interests.length > 0 ? (
                        selectedMatch.interests.slice(0, 4).map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-foreground/60">
                          Rozmowa po dopasowaniu
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/chat")}
                  className="shrink-0 rounded-full"
                >
                  <ArrowLeft className="size-4" />
                  Wróć
                </Button>
              </div>
            </CardHeader>

            {!currentProfileId ? (
              <div className="border-b bg-red-50 px-5 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-200">
                Najpierw utwórz profil, żeby wysyłać wiadomości.
              </div>
            ) : null}

            <CardContent className="flex h-[62vh] min-h-[430px] flex-col p-0">
              <div className="flex-1 space-y-3 overflow-y-auto bg-background/35 p-5">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-11 w-2/3 rounded-3xl" />
                    <Skeleton className="ml-auto h-11 w-1/2 rounded-3xl" />
                    <Skeleton className="h-11 w-3/5 rounded-3xl" />
                  </div>
                ) : loadError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <p className="text-sm text-red-500">{loadError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadMessages}
                      className="rounded-full"
                    >
                      Spróbuj ponownie
                    </Button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <div className="max-w-sm">
                      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageCircle className="size-6" />
                      </div>
                      <h2 className="font-extrabold tracking-[-0.02em]">
                        Rozpocznij rozmowę
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-foreground/65">
                        Napisz pierwszą wiadomość i zaproponuj temat albo
                        wspólną aktywność.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine =
                      message.senderId === String(currentProfileId);

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] rounded-[1.4rem] px-4 py-2.5 text-sm leading-6 shadow-sm ${
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

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t bg-card p-4">
                {sendError ? (
                  <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                    {sendError}
                  </p>
                ) : null}

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
                    className="h-12 rounded-full px-5"
                  />

                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    size="lg"
                    className="h-12 rounded-full px-5"
                  >
                    <Send className="size-4" />
                    {isSending ? "..." : "Wyślij"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
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