"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileDetails } from "@/components/profile/profile-details";
import { InterestTags } from "@/components/profile/interest-tags";
import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile, updateProfile } from "@/lib/api/profile";

type Profile = {
  username: string;
  bio: string;
  interests: string[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getProfile();
        setProfile(data);
      } catch {
        setError("Nie udało się pobrać profilu.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async (updatedProfile: Profile) => {
    try {
      setIsSaving(true);
      setError(null);

      const data = await updateProfile(updatedProfile);
      setProfile(data);
      setIsEditing(false);
      setError(null);
    } catch {
      setError("Nie udało się zapisać zmian.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isSaving) return;
    setError(null);
    setIsEditing(true);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background px-4 py-8">
        {isLoading ? (
          <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Ładowanie profilu...</p>
          </div>
        ) : error && !profile ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-red-500">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="w-fit rounded-xl border px-4 py-2 text-sm hover:bg-muted"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : profile ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <ProfileHeader
              username={profile.username}
              bio={profile.bio}
              onEdit={handleEdit}
              isEditing={isEditing}
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {isEditing ? (
              <ProfileForm
                profile={profile}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            ) : (
              <>
                <ProfileDetails bio={profile.bio} />
                <InterestTags interests={profile.interests} />
              </>
            )}
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}