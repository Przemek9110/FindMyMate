import { apiFetch } from "./api";
import { useAuthStore } from "@/store/authStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

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
  photoUrl?: string | null;
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

function mapInterestsToNames(interests: Interest[]): string[] {
  return interests.map((interest) => interest.name);
}

async function getProfileWithInterests(
  profile: BackendProfile
): Promise<Profile> {
  try {
    const { interests } = await getProfileInterests(profile.id);
    return mapProfile(profile, mapInterestsToNames(interests));
  } catch {
    return mapProfile(profile);
  }
}

export async function getProfiles(): Promise<Profile[]> {
  const profiles = await apiFetch<BackendProfile[]>("/profiles", {
    auth: true,
  });

  return Promise.all(
    profiles.map((profile) => getProfileWithInterests(profile))
  );
}

export async function getProfileByUserId(
  userId: number | string
): Promise<Profile | null> {
  const profiles = await apiFetch<BackendProfile[]>("/profiles", {
    auth: true,
  });

  const profile =
    profiles.find((profile) => profile.user_id === Number(userId)) ?? null;

  if (!profile) {
    return null;
  }

  return getProfileWithInterests(profile);
}

export async function getProfile(): Promise<Profile> {
  const profile = await apiFetch<BackendProfile>("/profiles/me", {
    auth: true,
  });

  return getProfileWithInterests(profile);
}

export async function createProfile(
  payload: ProfileCreatePayload
): Promise<ProfileCreateResponse> {
  return apiFetch<ProfileCreateResponse>("/profiles", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function getInterests(): Promise<Interest[]> {
  return apiFetch<Interest[]>("/interests", {
    auth: true,
  });
}

export async function createInterest(
  name: string
): Promise<InterestCreateResponse> {
  return apiFetch<InterestCreateResponse>("/interests", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ name }),
  });
}

export async function assignInterest(
  profileId: number | string,
  interestId: number | string
): Promise<ProfileInterestResponse> {
  return apiFetch<ProfileInterestResponse>("/profile-interests", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      profile_id: Number(profileId),
      interest_id: Number(interestId),
    }),
  });
}

export async function getProfileInterests(
  profileId: number | string
): Promise<ProfileInterestsResponse> {
  return apiFetch<ProfileInterestsResponse>(
    `/profiles/${profileId}/interests`,
    {
      auth: true,
    }
  );
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
>(updated: T): Promise<T> {
  const profile = await apiFetch<BackendProfile>(`/profiles/${updated.id}`, {
    method: "PATCH",
    auth: true,
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

export type ProfilePhotoResponse = {
  message?: string;
  id?: number;
  profile_id?: number;
  filename?: string;
  content_type?: string;
  photo_url?: string;
};

export async function getProfilePhotoUrl(
  profileId: number | string
): Promise<string | null> {
  try {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_URL}/profiles/${profileId}/photo`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.startsWith("image/")) {
      return URL.createObjectURL(await response.blob());
    }

    if (contentType.includes("application/json")) {
      const data = (await response.json()) as ProfilePhotoResponse;

      if (!data.photo_url) {
        return null;
      }

      return data.photo_url.startsWith("http")
        ? data.photo_url
        : `${API_URL}${data.photo_url}`;
    }

    return null;
  } catch {
    return null;
  }
}

export async function uploadProfilePhoto(
  profileId: number | string,
  file: File
): Promise<ProfilePhotoResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ProfilePhotoResponse>(`/profiles/${profileId}/photo`, {
    method: "POST",
    auth: true,
    body: formData,
    headers: {},
  });
}
