"use client";

import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMatchesStore } from "@/store/matchesStore";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const { matches } = useMatchesStore();
  const selectedMatch = matches.find((match) => match.id === userId);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="text-muted-foreground">
            Prosty widok rozmowy MVP.
          </p>
        </div>

        {!userId || !selectedMatch ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            Nie wybrano rozmowy.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border p-4">
              <p className="font-semibold">{selectedMatch.username}</p>
              <p className="text-sm text-muted-foreground">
                {selectedMatch.interests.join(", ")}
              </p>
            </div>

            <div className="rounded-xl border p-6 text-sm text-muted-foreground">
              Tutaj pojawi się historia wiadomości.
            </div>

            <div className="rounded-xl border p-4 text-sm text-muted-foreground">
              Pole do wysyłania wiadomości dodamy w kolejnym kroku.
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}