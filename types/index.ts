export interface LogEntry {
  id: number;
  type: 'system' | 'character' | 'whisper' | 'dice' | 'ooc' | 'damage' | 'handout';
  character?: string;
  target?: string;
  content: string;
  avatar?: string;
  diceResult?: {
    dice: string;
    result: number;
    rolls: number[];
    modifier?: number;
    success?: boolean;
    difficulty?: number;
  };
  damageInfo?: {
    amount: number;
    type: string;
    target: string;
  };
  handoutInfo?: {
    title: string;
    target: string;
    category?: string;
    isSecret?: boolean;
  };
}

export interface Character {
  name: string;
  player: string;
  class: string;
  description: string;
  thumbnail: string;
}

export interface ReadingSettings {
  showAvatars: boolean;
  fontSize: number;
  lineSpacing: number;
  paragraphSpacing: number;
  centerSystemMessages: boolean;
}

export interface SubPost {
  id: string;
  title: string;
  description: string;
  content: LogEntry[];
}

export interface ParsedMessage {
  time: string;
  sender: string;
  content: string;
  type?: string;
}

export interface SenderMapping {
  sender: string;
  type: string;
  count: number;
  imageFile?: string;
  avatarUrl?: string;
  customAvatarUrl?: string;
  expanded?: boolean;
  displayName?: string;
  whisperFrom?: string;
  whisperTo?: string;
  markedForDeletion?: boolean;
}

export type MessageType = 'character' | 'system' | 'ooc' | 'whisper' | 'delete';

export const MESSAGE_TYPES: { value: MessageType; label: string }[] = [
  { value: 'character', label: '캐릭터' },
  { value: 'system', label: '시스템' },
  { value: 'ooc', label: 'OOC' },
  { value: 'whisper', label: '귓속말' },
  { value: 'delete', label: '삭제' },
];