import { FileText, Lock } from 'lucide-react';
import React, { useState } from 'react';

import { ScriptLogViewer } from './script-log-viewer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogEntry, Character, SubPost, ReadingSettings } from '@/types';
import { Post } from '@/lib/types';

interface SubPostContentProps {
  subPost: SubPost | null;
  characters: Character[];
  settings: ReadingSettings;
  post?: Post;
  oocUnlocked?: boolean;
  onOocPasswordSubmit?: (e: React.FormEvent) => void;
  oocPasswordInput?: string;
  setOocPasswordInput?: (value: string) => void;
  oocError?: string;
}

export const SubPostContent = ({
  subPost,
  characters,
  settings,
  post,
  oocUnlocked = false,
  onOocPasswordSubmit,
  oocPasswordInput = '',
  setOocPasswordInput,
  oocError = ''
}: SubPostContentProps) => {
  const [showOOC, setShowOOC] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // oocUnlocked 상태가 변경되면 사담을 자동으로 켜기
  React.useEffect(() => {
    if (oocUnlocked && showPasswordForm) {
      setShowOOC(true);
      setShowPasswordForm(false);
    }
  }, [oocUnlocked, showPasswordForm]);
  
  // 사담 토글 핸들러
  const handleOocToggle = (checked: boolean) => {
    if (!checked) {
      // OFF로 바꾸는 건 자유롭게
      setShowOOC(false);
      setShowPasswordForm(false);
    } else {
      // ON으로 바꾸려면 비밀번호 확인 필요
      if (oocUnlocked) {
        setShowOOC(true);
        setShowPasswordForm(false);
      } else {
        // 비밀번호 입력 폼 표시
        setShowPasswordForm(true);
      }
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
              <Label htmlFor='ooc-toggle' className='text-sm font-medium'>
                사담
              </Label>
              <Switch
                id='ooc-toggle'
                checked={showOOC}
                onCheckedChange={handleOocToggle}
              />
              <span className='text-xs text-muted-foreground'>
                {showOOC ? 'ON' : 'OFF'}
              </span>
              {!oocUnlocked && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>비밀번호 필요</span>
                </div>
              )}
            </div>
          </div>
          {subPost.description && (
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {subPost.description}
            </p>
          )}
        </div>
        
        {/* 사담 비밀번호 입력 영역 - 비밀번호 폼이 활성화되었을 때만 표시 */}
        {showPasswordForm && onOocPasswordSubmit && setOocPasswordInput && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-amber-600" />
              <h3 className="font-medium text-amber-800">사담 비밀번호가 필요합니다</h3>
            </div>
            <p className="text-sm text-amber-700 mb-4">
              사담(OOC) 내용을 보려면 별도의 비밀번호가 필요합니다.
            </p>
            <form onSubmit={onOocPasswordSubmit} className="flex gap-3">
              <Input
                type="password"
                value={oocPasswordInput}
                onChange={(e) => setOocPasswordInput(e.target.value)}
                placeholder="사담 비밀번호를 입력하세요"
                className="flex-1"
                autoFocus
              />
              <Button type="submit" variant="outline">
                확인
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setShowPasswordForm(false);
                  setShowOOC(false); // 취소 시 토글도 OFF로
                }}
              >
                취소
              </Button>
            </form>
            {oocError && (
              <p className="text-sm text-destructive mt-2">
                {oocError}
              </p>
            )}
          </div>
        )}
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
    </div>
  );
};
