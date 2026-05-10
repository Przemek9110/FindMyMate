"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileDetails } from "@/components/profile/profile-details";
import { InterestTags } from "@/components/profile/interest-tags";
import { getProfileByUserId, type Profile } from "@/lib/api/profile";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { getProfilePhoto } from "@/lib/profile-photo";

const CURRENT_PROFILE_ID_KEY = "currentProfileId";

export default function ProfilePage() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!authUser?.id) {
        setProfile(null);
        setProfilePhoto(null);
        return;
      }

      setProfilePhoto(getProfilePhoto(authUser.id));

      const data = await getProfileByUserId(authUser.id);

      if (data) {
        localStorage.setItem(CURRENT_PROFILE_ID_KEY, String(data.id));
        setProfile(data);
        return;
      }

      localStorage.removeItem(CURRENT_PROFILE_ID_KEY);
      setProfile(null);
    } catch {
      setError("Nie udalo sie pobrac profilu.");
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-screen max-w-3xl px-0 py-4 sm:py-8">
        <div className="mb-6">
          <PageHeader
            eyebrow="Twoj profil"
            title="Podglad profilu"
            description="Edycje profilu znajdziesz teraz w ustawieniach."
          />
        </div>

        {isLoading ? (
          <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="size-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50/80 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <CardContent className="flex flex-col gap-4 p-6">
              <p className="text-sm text-red-500">{error}</p>
              <Button
                type="button"
                onClick={loadProfile}
                variant="outline"
                className="w-fit"
              >
                Sprobuj ponownie
              </Button>
            </CardContent>
          </Card>
        ) : profile ? (
          <div className="flex flex-col gap-6">
            <ProfileHeader
              username={profile.username}
              bio={profile.bio}
              photoUrl={profilePhoto}
              onEdit={() => router.push("/settings")}
              isEditing={false}
            />
            <ProfileDetails bio={profile.bio} />
            <InterestTags interests={profile.interests} />
          </div>
        ) : (
          <Card className="border-0 bg-card/95 shadow-sm ring-1 ring-border/70">
            <CardContent className="flex flex-col gap-4 p-6">
              <p className="text-sm text-muted-foreground">
                Nie masz jeszcze profilu. Utworz go w ustawieniach.
              </p>
              <Button onClick={() => router.push("/settings")} className="w-fit">
                Przejdz do ustawien
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </ProtectedRoute>
  );
}
