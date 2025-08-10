import { FileText, ChevronRight, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SubPost {
  id: string;
  title: string;
  description: string;
  content: any[];
}

interface SubPostNavigationProps {
  subPosts: SubPost[];
  activeSubPostId: string | null;
  onSubPostSelect: (id: string) => void;
  onSettingsClick: () => void;
}

export function SubPostNavigation({
  subPosts,
  activeSubPostId,
  onSubPostSelect,
  onSettingsClick,
}: SubPostNavigationProps) {
  return (
    <div className='border bg-card rounded-lg'>
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

      <ScrollArea className='max-h-80'>
        <div className='p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2'>
          {subPosts.map((subPost, index) => (
            <Button
              key={`${subPost.id}-${index}`}
              variant={activeSubPostId === subPost.id ? 'secondary' : 'ghost'}
              className='h-auto p-3 text-left justify-start'
              onClick={() => onSubPostSelect(subPost.id)}
            >
              <div className='flex items-start gap-3 w-full min-w-0'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium'>
                  {index + 1}
                </div>
                <div className='flex-1 min-w-0 overflow-hidden'>
                  <div className='font-medium text-sm mb-1 line-clamp-1'>
                    {subPost.title}
                  </div>
                  {subPost.description && (
                    <div className='text-xs text-muted-foreground truncate'>
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
