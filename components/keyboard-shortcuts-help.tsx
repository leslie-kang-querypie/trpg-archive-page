import { Keyboard, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsHelp({
  shortcuts,
}: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = useState(false);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = [];
    if (shortcut.ctrlKey || shortcut.metaKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.shiftKey) {
      parts.push('Shift');
    }
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='fixed bottom-4 right-4 z-50'
        >
          <Keyboard className='w-4 h-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>키보드 단축키</DialogTitle>
          <DialogDescription>
            빠른 네비게이션을 위한 키보드 단축키입니다.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className='flex items-center justify-between py-2'>
              <span className='text-sm'>
                {shortcut.description.split(' - ')[1]}
              </span>
              <kbd className='px-2 py-1 text-xs bg-muted rounded border'>
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
