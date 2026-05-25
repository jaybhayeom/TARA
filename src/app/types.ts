export type Agent = "gemma" | "gemini" | "collector" | "groq";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: Agent;
  timestamp?: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  time: string;
  agent: Agent;
  pinned?: boolean;
  messages: Message[];
}

export interface AppLink {
  id: string;
  name: string;
  url: string;
  color: string;
  bg: string;
}
