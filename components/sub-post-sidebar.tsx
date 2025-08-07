import { FileText, ChevronRight, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SubPost {
  id: string;
  title: string;
  description: string;
  content: any[];
}

interface SubPostSidebarProps {
  subPosts: SubPost[];
  activeSubPostId: string | null;
  onSubPostSelect: (id: string) => void;
  onSettingsClick: () => void;
}

export function SubPostSidebar({
  subPosts,
  activeSubPostId,
  onSubPostSelect,
  onSettingsClick,
}: SubPostSidebarProps) {
  return (
    <div className='w-80 border bg-card rounded-lg sticky top-6'>
      <div className='p-4 border-b'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold flex items-center gap-2'>
            <FileText className='w-4 h-4' />
            세션 목록
          </h3>
          <Button
            variant='ghost'
            size='sm'
            onClick={onSettingsClick}
            className='h-8 w-8 p-0'
          >
            <Settings className='w-4 h-4' />
            <span className='sr-only'>읽기 설정</span>
          </Button>
        </div>
      </div>

      <ScrollArea className='h-[700px]'>
        <div className='p-2 space-y-1'>
          {subPosts.map((subPost, index) => (
            <Button
              key={subPost.id}
              variant={activeSubPostId === subPost.id ? 'secondary' : 'ghost'}
              className='w-full justify-start h-auto p-3 text-left'
              onClick={() => onSubPostSelect(subPost.id)}
            >
              <div className='flex items-start gap-3 w-full min-w-0'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium'>
                  {index + 1}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='font-medium text-sm truncate mb-1'>
                    {subPost.title}
                  </div>
                  {subPost.description && (
                    <div className='text-xs text-muted-foreground line-clamp-2 break-words'>
                      {subPost.description}
                    </div>
                  )}
                </div>
                {activeSubPostId === subPost.id && (
                  <ChevronRight className='w-4 h-4 flex-shrink-0' />
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
