import { create } from "zustand";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  draftMessage: string;
  setDraftMessage: (value: string) => void;
  addConversation: (name: string) => void;
  setCurrentConversation: (id: string) => void;
  sendMessage: (content: string, sender?: string) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  draftMessage: "",
  setDraftMessage: (value) => set({ draftMessage: value }),
  addConversation: (name) =>
    set((state) => ({
      conversations: [
        ...state.conversations,
        { id: generateId(), name, messages: [] },
      ],
    })),
  setCurrentConversation: (id) => set({ currentConversationId: id }),
  sendMessage: (content, sender = "You") => {
    const id = get().currentConversationId;
    if (!id) return;
    const message: Message = {
      id: generateId(),
      content,
      sender,
      timestamp: Date.now(),
    };
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, messages: [...conv.messages, message] } : conv
      ),
      draftMessage: "",
    }));
  },
}));
