import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api/api";
import type { DiscoverUser } from "@/lib/api/discover";
import { getProfileInterests, getProfilePhotoUrl } from "@/lib/api/profile";

type BackendMatch = {
  match_id: number;
  profile_id: number;
  display_name: string;
  age: number;
  bio: string | null;
  city: string | null;
  interests?: string[];
};

type MatchesResponse = {
  profile_id: number;
  matches: BackendMatch[];
};

type MatchesState = {
  matches: DiscoverUser[];
  isLoading: boolean;
  error: string | null;
  fetchMatches: (profileId: number | string) => Promise<void>;
  addMatch: (user: DiscoverUser) => void;
  removeMatch: (userId: string) => void;
  isMatched: (userId: string) => boolean;
  clearMatches: () => void;
};

function mapMatch(match: BackendMatch): DiscoverUser {
  return {
    id: String(match.profile_id),
    profileId: match.profile_id,
    userId: match.profile_id,
    username: match.display_name,
    displayName: match.display_name,
    age: match.age,
    bio: match.bio ?? "",
    city: match.city ?? "",
    interests: match.interests ?? [],
    photoUrl: null,
    incomingReaction: "like",
    matchId: match.match_id,
  };
}

async function mapMatchWithInterests(match: BackendMatch): Promise<DiscoverUser> {
  const photoUrl = await getProfilePhotoUrl(match.profile_id);

  if (match.interests && match.interests.length > 0) {
    return {
      ...mapMatch(match),
      photoUrl,
    };
  }

  try {
    const { interests } = await getProfileInterests(match.profile_id);

    return {
      ...mapMatch({
        ...match,
        interests: interests.map((interest) => interest.name),
      }),
      photoUrl,
    };
  } catch (error) {
    console.error(
      `Nie udało się pobrać zainteresowań profilu ${match.profile_id}:`,
      error
    );

    return {
      ...mapMatch(match),
      photoUrl,
    };
  }
}

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      matches: [],
      isLoading: false,
      error: null,

      fetchMatches: async (profileId) => {
        if (!profileId) {
          set({
            error: "Brak ID profilu do pobrania dopasowań.",
            isLoading: false,
          });
          return;
        }

        if (get().isLoading) {
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const data = await apiFetch<MatchesResponse>(
            `/matches/${profileId}`,
            {
              auth: true,
            }
          );

          const matchesWithInterests = await Promise.all(
            data.matches.map(mapMatchWithInterests)
          );

          set({
            matches: matchesWithInterests,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Nie udało się pobrać dopasowań",
            isLoading: false,
          });
        }
      },

      addMatch: (user) =>
        set((state) => {
          const alreadyExists = state.matches.some(
            (match) => match.id === user.id
          );

          if (alreadyExists) {
            return state;
          }

          return {
            matches: [...state.matches, user],
          };
        }),

      removeMatch: (userId) =>
        set((state) => ({
          matches: state.matches.filter((match) => match.id !== userId),
        })),

      isMatched: (userId) => {
        return get().matches.some((match) => match.id === userId);
      },

      clearMatches: () =>
        set({
          matches: [],
          error: null,
          isLoading: false,
        }),
    }),
    {
      name: "matches-storage",
      partialize: (state) => ({
        matches: state.matches,
      }),
    }
  )
);
