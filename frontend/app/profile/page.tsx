import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileDetails } from "@/components/profile/profile-details";
import { InterestTags } from "@/components/profile/interest-tags";

const mockProfile = {
  username: "AniaTravel",
  bio: "Uwielbiam podróże, fotografię i poznawanie nowych ludzi. Szukam osób do wspólnych wypadów i projektów.",
  interests: ["Podróże", "Fotografia", "Kultura", "Joga", "Kawiarnie"],
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <ProfileHeader
          username={mockProfile.username}
          bio={mockProfile.bio}
        />

        <ProfileDetails bio={mockProfile.bio} />

        <InterestTags interests={mockProfile.interests} />
      </div>
    </main>
  );
}