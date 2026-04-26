import { create } from 'zustand';
import { Message, Conversation } from '@/types';

interface UIState {
  // Existing
  isContactInfoOpen: boolean;
  isAddContactModalOpen: boolean;
  isForwardModalOpen: boolean;
  isMediaViewerOpen: boolean;
  currentMedia: string | null;

  // New: Chat search
  isChatSearchOpen: boolean;
  setChatSearchOpen: (isOpen: boolean) => void;

  // New: Forward message
  forwardMessage: Message | null;
  setForwardMessage: (message: Message | null) => void;

  // New: Delete message
  deleteMessage: Message | null;
  setDeleteMessage: (message: Message | null) => void;

  // New: Lock Chat
  lockChatConversation: Conversation | null;
  setLockChatConversation: (conv: Conversation | null) => void;

  // New: Selection mode
  isSelectionMode: boolean;
  selectedMessages: Set<string>;
  setSelectionMode: (isOn: boolean) => void;
  toggleSelectedMessage: (messageId: string) => void;
  clearSelectedMessages: () => void;

  // Existing setters
  toggleContactInfo: () => void;
  setContactInfoOpen: (isOpen: boolean) => void;
  setAddContactModalOpen: (isOpen: boolean) => void;
  setForwardModalOpen: (isOpen: boolean) => void;
  setMediaViewerOpen: (isOpen: boolean, url?: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Existing
  isContactInfoOpen: false,
  isAddContactModalOpen: false,
  isForwardModalOpen: false,
  isMediaViewerOpen: false,
  currentMedia: null,

  // New
  isChatSearchOpen: false,
  setChatSearchOpen: (isChatSearchOpen) => set({ isChatSearchOpen }),

  forwardMessage: null,
  setForwardMessage: (forwardMessage) => set({ forwardMessage, isForwardModalOpen: !!forwardMessage }),

  deleteMessage: null,
  setDeleteMessage: (deleteMessage) => set({ deleteMessage }),

  lockChatConversation: null,
  setLockChatConversation: (lockChatConversation) => set({ lockChatConversation }),

  isSelectionMode: false,
  selectedMessages: new Set(),
  setSelectionMode: (isSelectionMode) => set({ isSelectionMode, selectedMessages: new Set() }),
  toggleSelectedMessage: (messageId) =>
    set((state) => {
      const next = new Set(state.selectedMessages);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return { selectedMessages: next };
    }),
  clearSelectedMessages: () => set({ selectedMessages: new Set(), isSelectionMode: false }),

  // Existing setters
  toggleContactInfo: () => set((state) => ({ isContactInfoOpen: !state.isContactInfoOpen })),
  setContactInfoOpen: (isContactInfoOpen) => set({ isContactInfoOpen }),
  setAddContactModalOpen: (isAddContactModalOpen) => set({ isAddContactModalOpen }),
  setForwardModalOpen: (isForwardModalOpen) => set({ isForwardModalOpen }),
  setMediaViewerOpen: (isMediaViewerOpen, currentMedia: string | null = null) =>
    set({ isMediaViewerOpen, currentMedia }),
}));
