"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMatchesStore } from "@/store/matchesStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getChatMessages,
  sendChatMessage,
  type Message,
} from "@/lib/api/chat";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { matches } = useMatchesStore();
  const selectedMatch = matches.find((match) => match.id === userId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const isSendDisabled = input.trim() === "" || isSending;

  const loadMessages = useCallback(async () => {
    if (!userId || !selectedMatch) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await getChatMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error("Blad podczas pobierania wiadomosci:", error);
      setMessages([]);
      setLoadError("Nie udało się pobrać wiadomości");
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedMatch]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSend = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || !userId) {
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);
      const newMessage = await sendChatMessage(userId, trimmedMessage);
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (error) {
      console.error("Blad podczas wysylania wiadomosci:", error);
      setSendError("Nie udało się wysłać wiadomości");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="text-muted-foreground">Prosty widok rozmowy MVP.</p>
        </div>

        {!userId ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Twoje rozmowy</h2>

            {matches.length === 0 ? (
              <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                Nie masz jeszcze żadnych rozmów. Najpierw zdobądź match w
                Discover.
              </div>
            ) : (
              matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => router.push(`/chat?userId=${match.id}`)}
                  className="w-full rounded-xl border p-4 text-left transition hover:bg-muted/40"
                >
                  <p className="font-semibold">{match.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {match.interests.join(", ")}
                  </p>
                </button>
              ))
            )}
          </div>
        ) : !selectedMatch ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            Nie znaleziono rozmowy dla wybranego użytkownika.
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => router.push("/chat")}>
              ← Wróć do rozmów
            </Button>

            <div className="rounded-xl border p-4">
              <p className="font-semibold">{selectedMatch.username}</p>
              <p className="text-sm text-muted-foreground">
                {selectedMatch.interests.join(", ")}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border p-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Ładowanie wiadomości...
                </p>
              ) : loadError ? (
                <div className="space-y-3">
                  <p className="text-sm text-red-500">{loadError}</p>
                  <Button variant="outline" onClick={loadMessages}>
                    Spróbuj ponownie
                  </Button>
                </div>
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
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
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
              <div ref={messagesEndRef} />
            </div>

            {sendError && <p className="text-sm text-red-500">{sendError}</p>}

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
              />
              <Button onClick={handleSend} disabled={isSendDisabled}>
                {isSending ? "Wysyłanie..." : "Wyślij"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
