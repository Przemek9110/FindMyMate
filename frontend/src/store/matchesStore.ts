import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiscoverUser } from "@/lib/api/discover";

type MatchesState = {
  matches: DiscoverUser[];
  addMatch: (user: DiscoverUser) => void;
  removeMatch: (userId: string) => void;
  isMatched: (userId: string) => boolean;
  clearMatches: () => void;
};

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      matches: [],

      addMatch: (user) =>
        set((state) => {
          const alreadyExists = state.matches.some((match) => match.id === user.id);

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

      clearMatches: () => set({ matches: [] }),
    }),
    {
      name: "matches-storage",
    }
  )
);