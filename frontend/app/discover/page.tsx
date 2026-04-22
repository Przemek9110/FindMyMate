"use client";

import { useEffect, useState } from "react";
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

export default function DiscoverPage() {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { reactedUserIds, addReaction } = useDiscoverStore();
  const { addMatch, isMatched } = useMatchesStore();

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, profileData] = await Promise.all([
          getDiscoverUsers(),
          getProfile(),
        ]);

        setUsers(usersData);
        setProfile(profileData);
      } finally {
        setIsLoading(false);
      }
    }

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
    try {
      await sendReaction(user.id, "like");

      if (user.likedYou && !isMatched(user.id)) {
        addMatch(user);
      }

      addReaction(user.id);
    } catch (error) {
      console.error("Błąd podczas wysyłania reakcji:", error);
    }
  };

  const handlePass = async (user: DiscoverUser) => {
    try {
      await sendReaction(user.id, "pass");
      addReaction(user.id);
    } catch (error) {
      console.error("Błąd podczas wysyłania reakcji:", error);
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
          ) : currentUser ? (
            <UserCard
              user={currentUser}
              onLike={() => handleLike(currentUser)}
              onPass={() => handlePass(currentUser)}
              sharedInterests={sharedInterests}
            />
          ) : (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Spróbuj później ponownie albo poszerz swoje zainteresowania, aby zobaczyć więcej dopasowań.
              </p>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}