"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Handshake,
  ThumbsDown,
  ThumbsUp,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getProfileByUserId, type Profile } from "@/lib/api/profile";
import { useDiscoverStore } from "@/store/discoverStore";
import { useMatchesStore } from "@/store/matchesStore";
import { useAuthStore } from "@/store/authStore";
import { UserCard } from "@/components/discover/user-card";
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

type FeedbackModal =
  | {
      type: "match";
      username: string;
    }
  | {
      type: "like" | "pass";
      message: string;
    };

export default function DiscoverPage() {
  const router = useRouter();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReacting, setIsReacting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal | null>(null);
  const [reactionAnimation, setReactionAnimation] =
    useState<ReactionType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const authUser = useAuthStore((state) => state.user);
  const { reactedUserIds, addReaction } = useDiscoverStore();
  const { addMatch, isMatched } = useMatchesStore();

  const closeFeedbackModal = () => {
    setFeedbackModal(null);
  };

  const showTemporaryModal = (modal: FeedbackModal) => {
    setFeedbackModal(modal);
    window.setTimeout(() => {
      setFeedbackModal((current) => (current === modal ? null : current));
    }, 1600);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let storedProfileId = localStorage.getItem(CURRENT_PROFILE_ID_KEY);
      let profileData: Profile | null = null;

      if (!storedProfileId && authUser?.id) {
        profileData = await getProfileByUserId(authUser.id);

        if (profileData) {
          storedProfileId = String(profileData.id);
          localStorage.setItem(CURRENT_PROFILE_ID_KEY, storedProfileId);
        }
      } else if (authUser?.id) {
        profileData = await getProfileByUserId(authUser.id);
      }

      if (!storedProfileId) {
        setUsers([]);
        setProfile(null);
        setCurrentProfileId(null);
        setError("Najpierw utworz profil, zeby korzystac z Discover.");
        return;
      }

      const usersData = await getDiscoverUsers(storedProfileId);

      setUsers(usersData);
      setProfile(profileData);
      setCurrentProfileId(Number(storedProfileId));
    } catch (error) {
      console.error("Blad podczas pobierania danych Discover:", error);
      setError("Nie udalo sie pobrac uzytkownikow");
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableUsers = users.filter((user) => !reactedUserIds.includes(user.id));
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
    if (isReacting || !currentProfileId) return;

    try {
      setIsReacting(true);
      setReactionAnimation(reactionType);
      window.setTimeout(() => setReactionAnimation(null), 850);

      const reaction = await sendReaction(
        currentProfileId,
        user.profileId,
        reactionType
      );

      if (reactionType === "like" && reaction.match_created && !isMatched(user.id)) {
        addMatch({ ...user, matchId: reaction.match_id ?? undefined });
        setFeedbackModal({ type: "match", username: user.username });
      } else {
        showTemporaryModal({
          type: reactionType,
          message:
            reactionType === "like"
              ? `Polubiono profil ${user.username}.`
              : `Pominieto profil ${user.username}.`,
        });
      }

      removeCandidate(user.id);
    } catch (error) {
      if (isDuplicateReactionError(error)) {
        removeCandidate(user.id);
        showTemporaryModal({
          type: reactionType,
          message: "Ten profil zostal juz oceniony.",
        });
        return;
      }

      console.error("Blad podczas wysylania reakcji:", error);
      showTemporaryModal({
        type: reactionType,
        message:
          reactionType === "like"
            ? "Nie udalo sie zapisac polubienia. Sprobuj ponownie."
            : "Nie udalo sie zapisac pominiecia. Sprobuj ponownie.",
      });
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
      <main className="mx-auto min-h-screen max-w-md px-0 py-4 sm:py-8">
        <div className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Odkrywaj"
            title="Poznaj kogos nowego"
            description="Podejmuj decyzje przyciskami Poznajmy się i Pomiń. Reszte ogarnia flow."
          />

          {isLoading ? (
            <Card className="border-0 bg-card/95 shadow-xl ring-1 ring-border/70">
              <CardContent className="space-y-5 p-5">
                <Skeleton className="h-52 rounded-2xl" />
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <Skeleton className="h-16 rounded-xl" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200 bg-red-50/80 text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <CardContent className="flex flex-col gap-4 p-6">
                <p className="text-sm">{error}</p>
              <Button
                type="button"
                onClick={loadData}
                variant="outline"
                className="w-fit"
              >
                Sprobuj ponownie
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
            <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UsersRound className="size-6" />
                </div>
                <h2 className="font-semibold">To juz wszystkie profile</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sprobuj pozniej ponownie albo poszerz swoje zainteresowania, aby
                zobaczyc wiecej dopasowan.
              </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-3xl border bg-background p-6 text-center shadow-2xl">
            {feedbackModal.type === "match" ? (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Handshake className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold">To match!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ty i {feedbackModal.username} polubiliscie sie wzajemnie.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    onClick={() => router.push("/matches")}
                    className="flex-1"
                  >
                    Zobacz matche
                  </Button>
                  <Button
                    type="button"
                    onClick={closeFeedbackModal}
                    variant="outline"
                    className="flex-1"
                  >
                    Kontynuuj
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {feedbackModal.type === "like" ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>
                <p className="text-sm font-medium">{feedbackModal.message}</p>
              </>
            )}
          </div>
        </div>
      )}

      {reactionAnimation && (
        <div className="pointer-events-none fixed inset-0 z-60 flex items-center justify-center px-4">
          <div
            className={`animate-[reaction-pop_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] rounded-3xl border bg-background/95 p-8 shadow-2xl ${
              reactionAnimation === "like"
                ? "border-emerald-300 text-emerald-600 dark:border-emerald-800 dark:text-emerald-300"
                : "border-red-300 text-red-600 dark:border-red-900 dark:text-red-300"
            }`}
          >
            {reactionAnimation === "like" ? (
              <ThumbsUp className="size-20" />
            ) : (
              <ThumbsDown className="size-20" />
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
