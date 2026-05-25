import { create } from 'zustand';
import { Agent, Message, AppLink, HistoryItem } from './types';

interface AppState {
  // Global
  agent: Agent;
  setAgent: (agent: Agent) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Main Chat
  messages: Message[];
  setMessages: (updater: Message[] | ((prev: Message[]) => Message[])) => void;
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  
  // Incognito Chat
  incognitoMessages: Message[];
  setIncognitoMessages: (updater: Message[] | ((prev: Message[]) => Message[])) => void;
  incognitoInput: string;
  setIncognitoInput: (input: string) => void;
  incognitoTyping: boolean;
  setIncognitoTyping: (typing: boolean) => void;

  // History & Apps Data
  historyList: HistoryItem[];
  setHistoryList: (list: HistoryItem[]) => void;
  appLinks: AppLink[];
  setAppLinks: (links: AppLink[]) => void;

  // UI Panels
  showAgent: boolean;
  setShowAgent: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  showApps: boolean;
  setShowApps: (show: boolean) => void;
  showIncognitoWindow: boolean;
  setShowIncognitoWindow: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  agent: 'gemini',
  setAgent: (agent) => set({ agent }),
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),

  messages: [],
  setMessages: (updater) => set((state) => ({ 
    messages: typeof updater === 'function' ? updater(state.messages) : updater 
  })),
  input: '',
  setInput: (input) => set({ input }),
  isTyping: false,
  setIsTyping: (isTyping) => set({ isTyping }),

  incognitoMessages: [],
  setIncognitoMessages: (updater) => set((state) => ({
    incognitoMessages: typeof updater === 'function' ? updater(state.incognitoMessages) : updater
  })),
  incognitoInput: '',
  setIncognitoInput: (incognitoInput) => set({ incognitoInput }),
  incognitoTyping: false,
  setIncognitoTyping: (incognitoTyping) => set({ incognitoTyping }),

  historyList: [],
  setHistoryList: (historyList) => set({ historyList }),
  appLinks: [],
  setAppLinks: (appLinks) => set({ appLinks }),

  showAgent: false,
  setShowAgent: (showAgent) => set({ showAgent }),
  showHistory: false,
  setShowHistory: (showHistory) => set({ showHistory }),
  showSettings: false,
  setShowSettings: (showSettings) => set({ showSettings }),
  showProfile: false,
  setShowProfile: (showProfile) => set({ showProfile }),
  showApps: false,
  setShowApps: (showApps) => set({ showApps }),
  showIncognitoWindow: false,
  setShowIncognitoWindow: (showIncognitoWindow) => set({ showIncognitoWindow }),
}));
