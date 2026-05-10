import { apiFetch } from "./api";

type BackendDiscoverCandidate = {
  id: number;
  user_id: number;
  display_name: string;
  age: number;
  bio: string | null;
  city: string | null;
  interests: string[];
};

type DiscoverResponse = {
  current_profile_id: number;
  candidates: BackendDiscoverCandidate[];
};

export type DiscoverUser = {
  id: string;
  profileId: number;
  userId: number;
  username: string;
  displayName: string;
  age: number;
  bio: string;
  city: string;
  interests: string[];
  incomingReaction: "like" | "pass" | "none";
  matchId?: number;
};

export type ReactionType = "like" | "pass";

export type ReactionResponse = {
  message: string;
  id: number;
  from_profile_id: number;
  to_profile_id: number;
  reaction_type: ReactionType;
  match_created: boolean;
  match_id: number | null;
};

function mapDiscoverUser(candidate: BackendDiscoverCandidate): DiscoverUser {
  return {
    id: String(candidate.id),
    profileId: candidate.id,
    userId: candidate.user_id,
    username: candidate.display_name,
    displayName: candidate.display_name,
    age: candidate.age,
    bio: candidate.bio ?? "",
    city: candidate.city ?? "",
    interests: candidate.interests,
    incomingReaction: "none",
  };
}

export async function getDiscoverUsers(
  currentProfileId: number | string = 1
): Promise<DiscoverUser[]> {
  const data = await apiFetch<DiscoverResponse>(`/discover/${currentProfileId}`);
  return data.candidates.map(mapDiscoverUser);
}

export async function sendReaction(
  currentProfileId: number | string,
  targetProfileId: number | string,
  reaction: ReactionType
): Promise<ReactionResponse> {
  return apiFetch<ReactionResponse>("/reactions", {
    method: "POST",
    body: JSON.stringify({
      from_profile_id: Number(currentProfileId),
      to_profile_id: Number(targetProfileId),
      reaction_type: reaction,
    }),
  });
}
