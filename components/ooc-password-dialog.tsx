import { Lock } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OocPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
  error?: string;
}

export const OocPasswordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  error = '',
}: OocPasswordDialogProps) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPassword('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            사담 비밀번호
          </DialogTitle>
          <DialogDescription>
            사담(OOC) 내용을 보려면 별도의 비밀번호가 필요합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ooc-password">비밀번호</Label>
            <Input
              id="ooc-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="사담 비밀번호를 입력하세요"
              autoFocus
              required
            />
            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit">
              <Lock className="w-4 h-4 mr-2" />
              인증
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};