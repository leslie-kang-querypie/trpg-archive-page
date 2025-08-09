import { LogEntry, Character } from '@/types';

export interface SessionInfo {
  rule: string;
  scenario: string;
  author: string;
  playerCount: number;
  overview: string;
  characters: Character[];
  highlight: string;
}

export interface Post {
  id: number;
  title: string;
  summary: string;
  thumbnail: string;
  tags: string[];
  date: string;
  views: number;
  password: string;
  isPrivate: boolean;
  sessionInfo: SessionInfo;
  subPosts: SubPost[];
}

export interface SubPost {
  id: string;
  title: string;
  description: string;
  content: LogEntry[];
}