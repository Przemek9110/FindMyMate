"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Handshake,
  RefreshCcw,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getProfile, type Profile } from "@/lib/api/profile";
import { useDiscoverStore } from "@/store/discoverStore";
import { useMatchesStore } from "@/store/matchesStore";
import { UserCard } from "@/components/discover/user-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import {
  getDiscoverUsers,
  sendReaction,
  type DiscoverUser,
  type ReactionType,
} from "@/lib/api/discover";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";
const DUPLICATE_REACTION_MESSAGE = "Reaction already exists for this pair";

type FeedbackModal = {
  type: "match";
  username: string;
};

export default function DiscoverPage() {
  const router = useRouter();

  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReacting, setIsReacting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal | null>(
    null
  );
  const [reactionAnimation, setReactionAnimation] =
    useState<ReactionType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);

  const reactedUserIds = useDiscoverStore((state) => state.reactedUserIds);
  const addReaction = useDiscoverStore((state) => state.addReaction);

  const addMatch = useMatchesStore((state) => state.addMatch);
  const isMatched = useMatchesStore((state) => state.isMatched);

  const closeFeedbackModal = () => {
    setFeedbackModal(null);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const profileData = await getProfile();
      const profileId = profileData.id;

      localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(profileId));

      const usersData = await getDiscoverUsers(profileId);

      setUsers(usersData);
      setProfile(profileData);
      setCurrentProfileId(profileId);
    } catch (error) {
      console.error("Błąd podczas pobierania danych Discover:", error);

      setUsers([]);
      setProfile(null);
      setCurrentProfileId(null);
      setError("Nie udało się pobrać użytkowników.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runLoadData() {
      if (cancelled) {
        return;
      }

      await loadData();
    }

    runLoadData();

    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const availableUsers = users.filter(
    (user) => !reactedUserIds.includes(user.id)
  );
  const currentUser = availableUsers[0];

  const sharedInterests =
    currentUser && profile
      ? currentUser.interests.filter((interest) =>
        profile.interests.includes(interest)
      )
      : [];

  const removeCandidate = (userId: string) => {
    addReaction(userId);
    setUsers((currentUsers) =>
      currentUsers.filter((candidate) => candidate.id !== userId)
    );
  };

  const isDuplicateReactionError = (error: unknown) => {
    return (
      error instanceof Error &&
      error.message.includes(DUPLICATE_REACTION_MESSAGE)
    );
  };

  const handleReaction = async (
    user: DiscoverUser,
    reactionType: ReactionType
  ) => {
    if (isReacting || !currentProfileId) {
      return;
    }

    try {
      setIsReacting(true);
      setReactionAnimation(reactionType);
      window.setTimeout(() => setReactionAnimation(null), 850);

      const reaction = await sendReaction(
        currentProfileId,
        user.profileId,
        reactionType
      );

      if (
        reactionType === "like" &&
        reaction.match_created &&
        !isMatched(user.id)
      ) {
        addMatch({ ...user, matchId: reaction.match_id ?? undefined });
        setFeedbackModal({ type: "match", username: user.username });
      }

      removeCandidate(user.id);
    } catch (error) {
      if (isDuplicateReactionError(error)) {
        removeCandidate(user.id);
        return;
      }

      console.error("Błąd podczas wysyłania reakcji:", error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleLike = async (user: DiscoverUser) => {
    await handleReaction(user, "like");
  };

  const handlePass = async (user: DiscoverUser) => {
    await handleReaction(user, "pass");
  };

  return (
    <ProtectedRoute>
      <section className="mx-auto max-w-6xl space-y-8 py-4 sm:py-8">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-8 shadow-sm ring-1 ring-border/70 sm:px-8">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 size-72 rounded-full bg-accent/60 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader
              eyebrow="Odkrywaj"
              title="Poznaj kogoś nowego"
              description="Przeglądaj profile, sprawdzaj wspólne zainteresowania i decyduj, z kim chcesz nawiązać kontakt."
            />

            <Button
              type="button"
              onClick={loadData}
              variant="outline"
              className="h-11 rounded-full px-5"
              disabled={isLoading}
            >
              <RefreshCcw className="size-4" />
              Odśwież
            </Button>
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
                    <Search className="size-6" />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsInfoPanelOpen(false)}
                    aria-label="Zwiń panel informacyjny"
                    className="rounded-full text-foreground/55 hover:bg-muted hover:text-foreground"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
                    Jak działa odkrywanie?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-foreground/68">
                    Widzisz jedną osobę naraz. Polubienie zapisuje reakcję, a
                    gdy druga osoba też Cię polubi, powstaje match i możecie
                    zacząć rozmowę.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border bg-background/70 p-4">
                    <p className="text-sm font-bold">Twoje zainteresowania</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile?.interests?.length ? (
                        profile.interests.slice(0, 6).map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-foreground/60">
                          Uzupełnij profil, żeby łatwiej znaleźć podobne osoby.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-primary/5 p-4">
                    <p className="text-sm font-bold">Profile w kolejce</p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-primary">
                      {availableUsers.length}
                    </p>
                    <p className="mt-1 text-sm text-foreground/65">
                      Tyle profili możesz jeszcze ocenić w tej sesji.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => router.push("/settings")}
                  variant="outline"
                  className="h-11 w-full rounded-full"
                >
                  Uzupełnij profil
                  <ArrowRight className="size-4" />
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
                  aria-label="Rozwiń panel informacyjny"
                  className="rounded-full text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <ChevronRight className="size-5" />
                </Button>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Search className="size-5" />
                  </div>

                  <p className="text-center text-xs font-black uppercase tracking-[0.16em] text-primary [writing-mode:vertical-rl]">
                    info
                  </p>
                </div>

                <Badge variant="secondary" className="rounded-full px-2">
                  {availableUsers.length}
                </Badge>
              </CardContent>
            </Card>
          )}

          <div className="min-w-0">
            {isLoading ? (
              <Card className="border-0 bg-card/95 shadow-xl ring-1 ring-border/70">
                <CardContent className="space-y-5 p-5">
                  <Skeleton className="h-64 rounded-[1.75rem]" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-20 rounded-2xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-12 rounded-full" />
                    <Skeleton className="h-12 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-0 bg-card/95 shadow-md ring-1 ring-red-200 dark:ring-red-900/50">
                <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                    <XCircle className="size-7" />
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold tracking-[-0.025em]">
                      Nie udało się pobrać profili
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                      {error}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={loadData}
                    variant="outline"
                    className="rounded-full"
                  >
                    <RefreshCcw className="size-4" />
                    Spróbuj ponownie
                  </Button>
                </CardContent>
              </Card>
            ) : currentUser ? (
              <UserCard
                user={currentUser}
                onLike={() => handleLike(currentUser)}
                onPass={() => handlePass(currentUser)}
                sharedInterests={sharedInterests}
                disabled={isReacting}
              />
            ) : (
              <Card className="border-0 bg-card/95 shadow-md ring-1 ring-border/70">
                <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UsersRound className="size-7" />
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold tracking-[-0.025em]">
                      To już wszystkie profile
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-foreground/68">
                      Spróbuj później ponownie albo poszerz swoje
                      zainteresowania, aby zobaczyć więcej dopasowań.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      type="button"
                      onClick={loadData}
                      variant="outline"
                      className="rounded-full"
                    >
                      <RefreshCcw className="size-4" />
                      Odśwież
                    </Button>

                    <Button
                      type="button"
                      onClick={() => router.push("/settings")}
                      className="rounded-full"
                    >
                      Edytuj profil
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {feedbackModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border bg-background text-center shadow-2xl ring-1 ring-border/70">
            <div className="bg-primary/10 px-6 py-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Handshake className="size-8" />
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">
                To match!
              </h2>

              <p className="mt-2 text-sm leading-6 text-foreground/70">
                Ty i {feedbackModal.username} polubiliście się wzajemnie.
              </p>
            </div>

            <div className="grid gap-3 p-5">
              <Button
                type="button"
                onClick={() => router.push("/matches")}
                className="h-11 rounded-full"
              >
                Zobacz dopasowania
                <ArrowRight className="size-4" />
              </Button>

              <Button
                type="button"
                onClick={closeFeedbackModal}
                variant="outline"
                className="h-11 rounded-full"
              >
                Kontynuuj odkrywanie
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {reactionAnimation ? (
        <div className="pointer-events-none fixed inset-0 z-60 flex items-center justify-center px-4">
          <div
            className={`relative flex size-44 items-center justify-center rounded-full shadow-2xl ${reactionAnimation === "like"
                ? "animate-[reaction-like_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] bg-emerald-500 text-white shadow-emerald-500/30"
                : "animate-[reaction-pass_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] bg-rose-500 text-white shadow-rose-500/30"
              }`}
          >
            <div
              className={`absolute inset-0 rounded-full ${reactionAnimation === "like"
                  ? "animate-[reaction-pulse_900ms_ease-out_forwards] bg-emerald-400/35"
                  : "animate-[reaction-pulse_900ms_ease-out_forwards] bg-rose-400/35"
                }`}
            />

            <div className="absolute -left-4 top-8 size-3 rounded-full bg-white/80 animate-[reaction-dot-left_900ms_ease-out_forwards]" />
            <div className="absolute -right-3 top-12 size-2 rounded-full bg-white/70 animate-[reaction-dot-right_900ms_ease-out_forwards]" />
            <div className="absolute bottom-6 left-8 size-2 rounded-full bg-white/70 animate-[reaction-dot-bottom_900ms_ease-out_forwards]" />

            <div className="relative flex flex-col items-center gap-2">
              {reactionAnimation === "like" ? (
                <ThumbsUp className="size-20 drop-shadow-sm" strokeWidth={1.8} />
              ) : (
                <ThumbsDown className="size-20 drop-shadow-sm" strokeWidth={1.8} />
              )}

              <span className="text-sm font-black uppercase tracking-[0.18em] text-white/90">
                {reactionAnimation === "like" ? "Polubiono" : "Pominięto"}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </ProtectedRoute>
  );
}