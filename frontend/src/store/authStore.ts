import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (data: { user: User; token: string }) => void;
  finishHydration: () => void;
  logout: () => void;
};

function clearClientStorage() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("auth-storage");
  localStorage.removeItem("discover-storage");
  localStorage.removeItem("matches-storage");
  localStorage.removeItem("currentProfileId");
}

function clearRelatedStores() {
  void import("./matchesStore").then(({ useMatchesStore }) => {
    useMatchesStore.getState().clearMatches();
  });

  void import("./discoverStore").then(({ useDiscoverStore }) => {
    useDiscoverStore.getState().clearReactions();
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: ({ user, token }) =>
        set({
          user,
          token,
          isAuthenticated: Boolean(token),
        }),

      finishHydration: () =>
        set((state) => ({
          hasHydrated: true,
          isAuthenticated: Boolean(state.token),
        })),

      logout: () => {
        clearRelatedStores();
        clearClientStorage();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          hasHydrated: true,
        });
      },
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Auth store hydration error:", error);
        }

        state?.finishHydration();
      },
    }
  )
);