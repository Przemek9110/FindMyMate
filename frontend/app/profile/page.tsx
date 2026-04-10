"use client";

import { useState } from "react";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileDetails } from "@/components/profile/profile-details";
import { InterestTags } from "@/components/profile/interest-tags";
import { ProfileForm } from "@/components/profile/profile-form";

const mockProfile = {
  username: "AniaTravel",
  bio: "Uwielbiam podróże, fotografię i poznawanie nowych ludzi. Szukam osób do wspólnych wypadów i projektów.",
  interests: ["Podróże", "Fotografia", "Kultura", "Joga", "Kawiarnie"],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedProfile: typeof profile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

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