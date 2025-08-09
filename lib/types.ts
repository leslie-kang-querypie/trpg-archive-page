import { Character, SubPost } from '@/types';

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
  password: string;
  isPrivate: boolean;
  oocPassword: string;
  sessionInfo: SessionInfo;
  subPosts: SubPost[];
}

