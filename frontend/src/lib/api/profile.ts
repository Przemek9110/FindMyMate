import { apiFetch } from "./api";

export type BackendProfile = {
  id: number;
  user_id: number;
  display_name: string;
  age: number;
  bio: string | null;
  city: string | null;
};

export type Profile = Omit<BackendProfile, "bio" | "city"> & {
  username: string;
  displayName: string;
  bio: string;
  city: string;
  interests: string[];
};

export type ProfileCreatePayload = {
  user_id: number;
  display_name: string;
  age: number;
  bio?: string | null;
  city?: string | null;
};

export type ProfileCreateResponse = {
  message: string;
  id: number;
  user_id: number;
  display_name: string;
};

export type Interest = {
  id: number;
  name: string;
};

export type InterestCreateResponse = Interest & {
  message: string;
};

export type ProfileInterestResponse = {
  message: string;
  id: number;
  profile_id: number;
  interest_id: number;
};

export type ProfileInterestsResponse = {
  profile_id: number;
  interests: Interest[];
};

function mapProfile(profile: BackendProfile, interests: string[] = []): Profile {
  return {
    ...profile,
    username: profile.display_name,
    displayName: profile.display_name,
    bio: profile.bio ?? "",
    city: profile.city ?? "",
    interests,
  };
}

export async function getProfiles(): Promise<Profile[]> {
  const profiles = await apiFetch<BackendProfile[]>("/profiles");

  return Promise.all(
    profiles.map(async (profile) => {
      try {
        const { interests } = await getProfileInterests(profile.id);
        return mapProfile(
          profile,
          interests.map((interest) => interest.name)
        );
      } catch {
        return mapProfile(profile);
      }
    })
  );
}

export async function getProfileByUserId(
  userId: number | string
): Promise<Profile | null> {
  const profiles = await getProfiles();
  return profiles.find((profile) => profile.user_id === Number(userId)) ?? null;
}

export async function getProfile(): Promise<Profile> {
  const profile = await apiFetch<BackendProfile>("/profiles/me", {
    auth: true,
  });

  try {
    const { interests } = await getProfileInterests(profile.id);
    return mapProfile(
      profile,
      interests.map((interest) => interest.name)
    );
  } catch {
    return mapProfile(profile);
  }
}

export async function createProfile(
  payload: ProfileCreatePayload
): Promise<ProfileCreateResponse> {
  return apiFetch<ProfileCreateResponse>("/profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getInterests(): Promise<Interest[]> {
  return apiFetch<Interest[]>("/interests");
}

export async function createInterest(name: string): Promise<InterestCreateResponse> {
  return apiFetch<InterestCreateResponse>("/interests", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function assignInterest(
  profileId: number | string,
  interestId: number | string
): Promise<ProfileInterestResponse> {
  return apiFetch<ProfileInterestResponse>("/profile-interests", {
    method: "POST",
    body: JSON.stringify({
      profile_id: Number(profileId),
      interest_id: Number(interestId),
    }),
  });
}

export async function getProfileInterests(
  profileId: number | string
): Promise<ProfileInterestsResponse> {
  return apiFetch<ProfileInterestsResponse>(`/profiles/${profileId}/interests`);
}

export async function updateProfile<
  T extends {
    id: number;
    age: number;
    username: string;
    display_name?: string;
    bio: string;
    city: string;
    interests: string[];
  },
>(
  updated: T
): Promise<T> {
  const profile = await apiFetch<BackendProfile>(`/profiles/${updated.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      display_name: updated.username || updated.display_name,
      age: updated.age,
      bio: updated.bio || null,
      city: updated.city || null,
    }),
  });

  return {
    ...updated,
    ...mapProfile(profile, updated.interests),
  };
}
