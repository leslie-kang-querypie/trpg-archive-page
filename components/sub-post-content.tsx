import { FileText, Lock, Shield, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';

import { OocPasswordDialog } from './ooc-password-dialog';
import { ScriptLogViewer } from './script-log-viewer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LogEntry, Character, SubPost, ReadingSettings } from '@/types';
import { Post } from '@/lib/types';

interface SubPostContentProps {
  subPost: SubPost | null;
  characters: Character[];
  settings: ReadingSettings;
  post?: Post;
  oocUnlocked?: boolean;
  onOocPasswordSubmit?: (password: string) => void;
  oocError?: string;
}

export const SubPostContent = ({
  subPost,
  characters,
  settings,
  post,
  oocUnlocked = false,
  onOocPasswordSubmit,
  oocError = '',
}: SubPostContentProps) => {
  const [showOOC, setShowOOC] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // oocUnlocked 상태가 변경되면 사담을 자동으로 켜고 다이얼로그 닫기
  React.useEffect(() => {
    if (oocUnlocked) {
      setShowOOC(true);
      setShowPasswordDialog(false);
    }
  }, [oocUnlocked]);

  // 사담 토글 핸들러
  const handleOocToggle = (checked: boolean) => {
    if (!checked) {
      // OFF로 바꾸는 건 자유롭게
      setShowOOC(false);
    } else {
      // ON으로 바꾸려면 비밀번호가 인증된 상태여야 함
      if (oocUnlocked) {
        setShowOOC(true);
      } else {
        // 비밀번호가 인증되지 않은 경우 다이얼로그 표시
        setShowPasswordDialog(true);
      }
    }
  };

  // 다이얼로그에서 비밀번호 제출
  const handlePasswordSubmit = (password: string) => {
    if (onOocPasswordSubmit) {
      onOocPasswordSubmit(password);
    }
  };
  if (!subPost) {
    return (
      <div className='flex-1 flex items-center justify-center bg-card border rounded-lg min-h-[700px]'>
        <div className='text-center space-y-2'>
          <FileText className='w-12 h-12 mx-auto text-muted-foreground' />
          <h3 className='text-lg font-medium text-muted-foreground'>
            세션을 선택해주세요
          </h3>
          <p className='text-sm text-muted-foreground'>
            위 목록에서 읽고 싶은 세션을 선택하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 bg-card border rounded-lg flex flex-col'>
      {/* 헤더 */}
      <div className='p-6 border-b'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>{subPost.title}</h2>

            {/* 사담 토글 */}
            <div className='flex items-center gap-3'>
              {/* 인증 상태 표시 */}
              {oocUnlocked ? (
                <div className='flex items-center gap-1 text-xs text-green-600'>
                  <ShieldCheck className='w-3 h-3' />
                  <span>인증됨</span>
                </div>
              ) : (
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Shield className='w-3 h-3' />
                  <span>미인증</span>
                </div>
              )}

              <Label htmlFor='ooc-toggle' className='text-sm font-medium'>
                사담
              </Label>
              <Switch
                id='ooc-toggle'
                checked={showOOC}
                onCheckedChange={handleOocToggle}
              />
            </div>
          </div>
          {subPost.description && (
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {subPost.description}
            </p>
          )}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className='flex-1 p-6'>
        <ScriptLogViewer
          entries={subPost.content}
          characters={characters}
          settings={settings}
          showOOC={showOOC && oocUnlocked} // 사담이 켜져있고 잠금해제된 경우만 표시
        />
      </div>

      {/* 사담 비밀번호 다이얼로그 */}
      <OocPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSubmit={handlePasswordSubmit}
        error={oocError}
      />
    </div>
  );
};
