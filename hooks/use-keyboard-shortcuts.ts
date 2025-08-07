import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlOrCmd = shortcut.ctrlKey || shortcut.metaKey;
        const matchesModifiers =
          (!ctrlOrCmd || event.ctrlKey || event.metaKey) &&
          (!shortcut.shiftKey || event.shiftKey);

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          matchesModifiers
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// 공통 단축키들
export const createCommonShortcuts = (router: any) => [
  {
    key: 'h',
    action: () => router.push('/'),
    description: 'H - 홈으로 이동',
  },
  {
    key: 'n',
    ctrlKey: true,
    action: () => router.push('/write'),
    description: 'Ctrl+N - 새 로그 작성',
  },
];
