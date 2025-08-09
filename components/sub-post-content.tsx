import { FileText } from 'lucide-react';
import { useState } from 'react';

import { ScriptLogViewer } from './script-log-viewer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LogEntry, Character, SubPost, ReadingSettings } from '@/types';

interface SubPostContentProps {
  subPost: SubPost | null;
  characters: Character[];
  settings: ReadingSettings;
}

export const SubPostContent = ({
  subPost,
  characters,
  settings,
}: SubPostContentProps) => {
  const [showOOC, setShowOOC] = useState(false);
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
                onCheckedChange={setShowOOC}
              />
              <span className='text-xs text-muted-foreground'>
                {showOOC ? 'ON' : 'OFF'}
              </span>
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
          showOOC={showOOC}
        />
      </div>
    </div>
  );
};
