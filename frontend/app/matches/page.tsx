"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  MessageCircle,
  RefreshCcw,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MatchCard } from "@/components/matches/match-card";
import { useMatchesStore } from "@/store/matchesStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile } from "@/lib/api/profile";
import type { DiscoverUser } from "@/lib/api/discover";
import { PageHeader } from "@/components/layout/page-header";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";

export default function MatchesPage() {
  const router = useRouter();

  const matches = useMatchesStore((state) => state.matches);
  const fetchMatches = useMatchesStore((state) => state.fetchMatches);
  const error = useMatchesStore((state) => state.error);
  const isLoading = useMatchesStore((state) => state.isLoading);

  const [missingProfile, setMissingProfile] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [previewProfile, setPreviewProfile] = useState<DiscoverUser | null>(
    null
  );
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      try {
        let currentProfileId = localStorage.getItem(CURRENT_PROFILE_ID_KEY);

        if (!currentProfileId) {
          const profile = await getProfile();

          if (cancelled) {
            return;
          }

          currentProfileId = String(profile.id);
          localStorage.setItem(CURRENT_PROFILE_ID_KEY, currentProfileId);
        }

        if (!currentProfileId) {
          if (!cancelled) {
            setMissingProfile(true);
          }

          return;
        }

        if (!cancelled) {
          setMissingProfile(false);
          await fetchMatches(currentProfileId);
        }
      } catch {
        if (!cancelled) {
          setMissingProfile(true);
        }
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [fetchMatches]);

  const openChat = (matchId: string) => {
    router.push(`/chat?userId=${matchId}`);
  };

  const handleRefresh = async () => {
    const currentProfileId = localStorage.getItem(CURRENT_PROFILE_ID_KEY);

    if (!currentProfileId) {
      return;
    }

    await fetchMatches(currentProfileId);
  };

  return (
    <ProtectedRoute>
      <section className="mx-auto max-w-6xl space-y-8 py-4 sm:py-8">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-8 shadow-sm ring-1 ring-border/70 sm:px-8">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 size-72 rounded-full bg-accent/60 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader
              eyebrow="Dopasowania"
              title={`Twoje dopasowania`}
              description="Tutaj trafiają osoby, z którymi macie wzajemne polubienie. Otwórz profil albo przejdź od razu do rozmowy."
            />

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleRefresh}
                variant="outline"
                className="h-11 rounded-full px-5"
                disabled={isLoading}
              >
                <RefreshCcw className="size-4" />
                Odśwież
              </Button>

              <Button
                type="button"
                onClick={() => router.push("/discover")}
                className="h-11 rounded-full px-5 font-bold shadow-md shadow-primary/20"
              >
                <Search className="size-4" />
                Odkrywaj
              </Button>
            </div>
          </div>
        </div>

        <div
          className={
            isInfoPanelOpen
              ? "grid gap-5 lg:grid-cols-[0.72fr_1fr]"
              : "grid gap-5 lg:grid-cols-[88px_1fr]"
          }
        >
          {isInfoPanelOpen ? (
            <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <HeartHandshake className="size-6" />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsInfoPanelOpen(false)}
                    aria-label="Zwiń panel boczny"
                    className="rounded-full text-foreground/55 hover:bg-muted hover:text-foreground"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
                    Matche po wzajemnym polubieniu
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-foreground/68">
                    Dopasowanie pojawia się dopiero wtedy, gdy obie osoby klikną
                    „Poznajmy się”. Dzięki temu rozmowa zaczyna się od
                    obustronnej chęci kontaktu.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border bg-primary/5 p-4">
                    <p className="text-sm font-bold">Liczba dopasowań</p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-primary">
                      {matches.length}
                    </p>
                    <p className="mt-1 text-sm text-foreground/65">
                      Tyle aktywnych matchy masz obecnie na liście.
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-background/70 p-4">
                    <p className="text-sm font-bold">Następny krok</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/65">
                      Otwórz podgląd profilu, sprawdź zainteresowania i
                      rozpocznij rozmowę.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => router.push("/chat")}
                  variant="outline"
                  className="h-11 w-full rounded-full"
                >
                  <MessageCircle className="size-4" />
                  Przejdź do rozmów
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
              <CardContent className="flex h-full min-h-24 flex-col items-center justify-between gap-4 p-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsInfoPanelOpen(true)}
                  aria-label="Rozwiń panel boczny"
                  className="rounded-full text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <ChevronRight className="size-5" />
                </Button>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="size-5" />
                  </div>

                  <p className="text-center text-xs font-black uppercase tracking-[0.16em] text-primary [writing-mode:vertical-rl]">
                    matche
                  </p>
                </div>

                <Badge variant="secondary" className="rounded-full px-2">
                  {matches.length}
                </Badge>
              </CardContent>
            </Card>
          )}

          <div className="min-w-0">
            {isLoading ? (
              <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-28 rounded-[1.5rem]" />
                  <Skeleton className="h-28 rounded-[1.5rem]" />
                  <Skeleton className="h-28 rounded-[1.5rem]" />
                </CardContent>
              </Card>
            ) : matches.length === 0 ? (
              <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UsersRound className="size-7" />
                  </div>

                  {missingProfile ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                      Najpierw utwórz profil, żeby zobaczyć dopasowania.
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <div>
                    <h2 className="text-xl font-extrabold tracking-[-0.025em]">
                      Jeszcze bez dopasowań
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-foreground/68">
                      Oceń kilka osób w odkrywaniu. Jeśli ktoś polubi Cię
                      wzajemnie, pojawi się tutaj jako match.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() =>
                      router.push(missingProfile ? "/settings" : "/discover")
                    }
                    className="rounded-full"
                  >
                    {missingProfile
                      ? "Przejdź do ustawień"
                      : "Przejdź do odkrywania"}
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                <CardHeader className="border-b bg-muted/25 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-xl font-black tracking-[-0.03em]">
                        Lista dopasowań
                      </CardTitle>
                      <p className="mt-1 text-sm text-foreground/60">
                        Przewijaj listę bez rozciągania całej strony.
                      </p>
                    </div>

                    <Badge variant="accent" className="w-fit rounded-full px-3 py-1">
                      {matches.length}{" "}
                      {matches.length === 1 ? "dopasowanie" : "dopasowań"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="max-h-[620px] space-y-3 overflow-y-auto p-4 pr-3 lg:max-h-[calc(100vh-18rem)]">
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {previewProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <Card className="relative w-full max-w-lg overflow-hidden border-0 bg-background shadow-2xl ring-1 ring-border/70">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setPreviewProfile(null)}
              aria-label="Zamknij podgląd profilu"
              className="absolute right-3 top-3 z-10 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </Button>

            <CardHeader className="border-b bg-muted/30 px-6 pb-5 pt-6 pr-14">
              <p className="text-sm font-medium text-primary">
                Pełny podgląd profilu
              </p>

              <CardTitle className="mt-1 text-2xl leading-tight">
                {previewProfile.username}
              </CardTitle>

              {[previewProfile.age, previewProfile.city].filter(Boolean)
                .length > 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[previewProfile.age, previewProfile.city]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              ) : null}
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">O profilu</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {previewProfile.bio || "Ten profil nie ma jeszcze opisu."}
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Zainteresowania</h3>

                {previewProfile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2 rounded-2xl border bg-muted/20 p-3">
                    {previewProfile.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="rounded-full px-3 py-1"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                    Brak zapisanych zainteresowań.
                  </div>
                )}
              </section>

              <Button
                type="button"
                onClick={() => openChat(previewProfile.id)}
                className="h-11 w-full rounded-full font-bold"
              >
                Przejdź do rozmowy
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </ProtectedRoute>
  );
}