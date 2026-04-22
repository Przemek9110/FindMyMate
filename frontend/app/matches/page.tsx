"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MatchCard } from "@/components/matches/match-card";
import { useMatchesStore } from "@/store/matchesStore";

export default function MatchesPage() {
  const router = useRouter();
  const { matches } = useMatchesStore();

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Twoje matche</h1>
          <p className="text-muted-foreground">
            Osoby, z którymi masz wzajemne polubienie.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            Nie masz jeszcze żadnych matchy. Polub kilka osób w Discover, aby zobaczyć je tutaj.
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                username={match.username}
                interests={match.interests}
                onClick={() => router.push(`/chat?userId=${match.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
