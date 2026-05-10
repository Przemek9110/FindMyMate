"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, UsersRound, X } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MatchCard } from "@/components/matches/match-card";
import { useMatchesStore } from "@/store/matchesStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { getProfileByUserId } from "@/lib/api/profile";
import type { DiscoverUser } from "@/lib/api/discover";
import { PageHeader } from "@/components/layout/page-header";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";

export default function MatchesPage() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const { matches, fetchMatches, error, isLoading } = useMatchesStore();
  const [missingProfile, setMissingProfile] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [previewProfile, setPreviewProfile] = useState<DiscoverUser | null>(null);

  useEffect(() => {
    async function loadMatches() {
      let currentProfileId = localStorage.getItem(CURRENT_PROFILE_ID_KEY);

      if (!currentProfileId && authUser?.id) {
        const profile = await getProfileByUserId(authUser.id);

        if (profile) {
          currentProfileId = String(profile.id);
          localStorage.setItem(CURRENT_PROFILE_ID_KEY, currentProfileId);
        }
      }

      if (!currentProfileId) {
        setMissingProfile(true);
        return;
      }

      setMissingProfile(false);
      await fetchMatches(currentProfileId);
    }

    loadMatches();
  }, [authUser?.id, fetchMatches]);

  const openChat = (matchId: string) => {
    router.push(`/chat?userId=${matchId}`);
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          eyebrow="Dopasowania"
          title={`Twoje dopasowania (${matches.length})`}
          description="Kliknij karte, zeby rozwinac profil, albo uzyj akcji po prawej."
          action={
            <Button onClick={() => router.push("/discover")} variant="outline">
              <Search className="size-4" />
              Odkrywaj
            </Button>
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : matches.length === 0 ? (
          <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UsersRound className="size-6" />
              </div>

              {missingProfile ? (
                <p className="text-sm text-red-500">
                  Najpierw utworz profil, zeby zobaczyc dopasowania.
                </p>
              ) : null}

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <div>
                <h2 className="text-lg font-semibold">
                  Jeszcze bez dopasowan
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ocen kilka osob w Odkrywaj, a wzajemne dopasowania pojawia sie
                  tutaj.
                </p>
              </div>

              <Button
                onClick={() => router.push(missingProfile ? "/profile" : "/discover")}
                className="w-full sm:w-auto"
              >
                {missingProfile ? "Przejdz do profilu" : "Przejdz do Odkrywaj"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                username={match.username}
                age={match.age}
                bio={match.bio}
                city={match.city}
                interests={match.interests}
                isExpanded={expandedMatchId === match.id}
                onToggle={() =>
                  setExpandedMatchId((current) =>
                    current === match.id ? null : match.id
                  )
                }
                onOpenChat={() => openChat(match.id)}
                onPreviewProfile={() => setPreviewProfile(match)}
              />
            ))}
          </div>
        )}
      </div>

      {previewProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-lg border-0 bg-background shadow-2xl">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Pelny podglad profilu
                </p>
                <CardTitle className="mt-1 text-2xl">
                  {previewProfile.username}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[previewProfile.age, previewProfile.city].filter(Boolean).join(" • ")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPreviewProfile(null)}
                aria-label="Zamknij podglad profilu"
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-muted-foreground">
                {previewProfile.bio || "Ten profil nie ma jeszcze opisu."}
              </p>

              <div className="flex flex-wrap gap-2">
                {previewProfile.interests.length > 0 ? (
                  previewProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak zapisanych zainteresowan.
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={() => openChat(previewProfile.id)}
                className="w-full"
              >
                Przejdz do rozmowy
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </ProtectedRoute>
  );
}
