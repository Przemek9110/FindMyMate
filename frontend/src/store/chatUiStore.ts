import { create } from "zustand";

type ChatUiState = {
  isOpen: boolean;
  selectedUserId: string | null;
  openChat: (userId?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  selectConversation: (userId: string | null) => void;
};

export const useChatUiStore = create<ChatUiState>((set) => ({
  isOpen: false,
  selectedUserId: null,

  openChat: (userId) =>
    set({
      isOpen: true,
      selectedUserId: userId ?? null,
    }),

  closeChat: () =>
    set({
      isOpen: false,
      selectedUserId: null,
    }),

  toggleChat: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      selectedUserId: state.isOpen ? null : state.selectedUserId,
    })),

  selectConversation: (userId) =>
    set({
      isOpen: true,
      selectedUserId: userId,
    }),
}));
