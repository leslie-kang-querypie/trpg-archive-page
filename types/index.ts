export interface LogEntry {
  id: number;
  type: 'system' | 'character' | 'whisper' | 'dice' | 'ooc' | 'damage' | 'handout';
  character?: string;
  target?: string;
  content: string;
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