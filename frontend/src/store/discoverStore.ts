import { create } from "zustand";
import { persist } from "zustand/middleware";

type DiscoverState = {
  reactedUserIds: string[];
  addReaction: (userId: string) => void;
  hasReacted: (userId: string) => boolean;
  clearReactions: () => void;
};

export const useDiscoverStore = create<DiscoverState>()(
  persist(
    (set, get) => ({
      reactedUserIds: [],

      addReaction: (userId) =>
        set((state) => {
          if (state.reactedUserIds.includes(userId)) {
            return state;
          }

          return {
            reactedUserIds: [...state.reactedUserIds, userId],
          };
        }),

      hasReacted: (userId) => get().reactedUserIds.includes(userId),

      clearReactions: () => set({ reactedUserIds: [] }),
    }),
    {
      name: "discover-storage",
    }
  )
);