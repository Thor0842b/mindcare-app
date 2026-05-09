export type Role = "student" | "admin";

export type ResourceCategory = "Video" | "Audio" | "Article";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  lastActive: string;
  modulesCompleted: number;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  url: string;
  embedUrl?: string;
  audioUrl?: string;
  body?: string;
  createdAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  resourceId: string;
  interactedAt: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface SurveyChartData {
  id: string;
  type: "bar" | "pie" | "line";
  title: string;
  labels: string[];
  values: number[];
  createdAt: string;
}

export interface WallPost {
  id: string;
  message: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  prompt: string;
  content: string;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  userId: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

export interface AcademicEvent {
  id: string;
  userId: string;
  title: string;
  start: string;
  end?: string;
  type: "exam" | "assignment" | "class" | "other";
  createdAt: string;
}

export interface TalkPost {
  id: string;
  message: string;
  createdAt: string;
}
