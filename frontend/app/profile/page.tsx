"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile();
      setProfile(data);
    }

    loadProfile();
  }, []);

  const handleSave = async (updatedProfile: Profile) => {
    const data = await updateProfile(updatedProfile);
    setProfile(data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!profile) {
    return <p className="p-6">Ładowanie...</p>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <ProfileHeader
          username={profile.username}
          bio={profile.bio}
          onEdit={handleEdit}
          isEditing={isEditing}
        />

        {isEditing ? (
          <ProfileForm
            profile={profile}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <ProfileDetails bio={profile.bio} />
            <InterestTags interests={profile.interests} />
          </>
        )}
      </div>
    </main>
  );
}