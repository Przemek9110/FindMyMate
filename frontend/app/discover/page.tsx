"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getProfile, type Profile } from "@/lib/api/profile";
import { UserCard } from "@/components/discover/user-card";
import {
  getDiscoverUsers,
  sendReaction,
  type DiscoverUser,
  type ReactionType,
} from "@/lib/api/discover";

export default function DiscoverPage() {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seenUserIds, setSeenUserIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

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

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getDiscoverUsers();
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const availableUsers = users.filter(
    (user) => !seenUserIds.includes(user.id)
  );

  const currentUser = availableUsers[0];

  const sharedInterests =
    currentUser && profile
      ? currentUser.interests.filter((interest) =>
        profile.interests.includes(interest)
      )
      : [];

  const handleReaction = async (reaction: ReactionType) => {
    if (!currentUser) return;

    await sendReaction(currentUser.id, reaction);
    setSeenUserIds((prev) => [...prev, currentUser.id]);
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
              onLike={() => handleReaction("like")}
              onPass={() => handleReaction("pass")}
              sharedInterests={sharedInterests}
            />
          ) : (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Brak użytkowników do wyświetlenia.
              </p>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}