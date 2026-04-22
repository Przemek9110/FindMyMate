"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Heart, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getProfile, type Profile } from "@/lib/api/profile";
import { useDiscoverStore } from "@/store/discoverStore";
import { useMatchesStore } from "@/store/matchesStore";
import { UserCard } from "@/components/discover/user-card";
import {
  getDiscoverUsers,
  sendReaction,
  type DiscoverUser,
} from "@/lib/api/discover";

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
  const [profile, setProfile] = useState<Profile | null>(null);
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [usersData, profileData] = await Promise.all([
        getDiscoverUsers(),
        getProfile(),
      ]);

      setUsers(usersData);
      setProfile(profileData);
    } catch (error) {
      console.error("Błąd podczas pobierania danych Discover:", error);
      setError("Nie udało się pobrać użytkowników");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableUsers = users.filter((user) => !reactedUserIds.includes(user.id));
  const currentUser = availableUsers[0];

  const sharedInterests =
    currentUser && profile
      ? currentUser.interests.filter((interest) =>
          profile.interests.includes(interest)
        )
      : [];

  const handleLike = async (user: DiscoverUser) => {
    if (isReacting) return;

    try {
      setIsReacting(true);

      await sendReaction(user.id, "like");

      if (user.incomingReaction === "like" && !isMatched(user.id)) {
        addMatch(user);
        setFeedbackModal({ type: "match", username: user.username });
      } else {
        showTemporaryModal({
          type: "like",
          message: `Polubiono profil ${user.username}.`,
        });
      }

      addReaction(user.id);
    } catch (error) {
      console.error("Błąd podczas wysyłania reakcji:", error);
      showTemporaryModal({
        type: "like",
        message: "Nie udało się zapisać polubienia. Spróbuj ponownie.",
      });
    } finally {
      setIsReacting(false);
    }
  };

  const handlePass = async (user: DiscoverUser) => {
    if (isReacting) return;

    try {
      setIsReacting(true);

      await sendReaction(user.id, "pass");
      addReaction(user.id);

      showTemporaryModal({
        type: "pass",
        message: `Pominięto profil ${user.username}.`,
      });
    } catch (error) {
      console.error("Błąd podczas wysyłania reakcji:", error);
      showTemporaryModal({
        type: "pass",
        message: "Nie udało się zapisać pominięcia. Spróbuj ponownie.",
      });
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <h1 className="text-2xl font-bold">Discover</h1>

          {isLoading ? (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Ładowanie użytkowników...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-red-500">{error}</p>
              <button
                type="button"
                onClick={loadData}
                className="w-fit rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : currentUser ? (
            <UserCard
              user={currentUser}
              onLike={() => handleLike(currentUser)}
              onPass={() => handlePass(currentUser)}
              sharedInterests={sharedInterests}
              disabled={isReacting}
            />
          ) : (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Spróbuj później ponownie albo poszerz swoje zainteresowania, aby
                zobaczyć więcej dopasowań.
              </p>
            </div>
          )}
        </div>
      </main>

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-background p-6 text-center shadow-xl">
            {feedbackModal.type === "match" ? (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold">To match!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ty i {feedbackModal.username} polubiliście się wzajemnie.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/matches")}
                    className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                  >
                    Zobacz matche
                  </button>
                  <button
                    type="button"
                    onClick={closeFeedbackModal}
                    className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                  >
                    Kontynuuj
                  </button>
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
    </ProtectedRoute>
  );
}
