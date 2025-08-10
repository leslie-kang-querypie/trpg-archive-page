import { useState } from 'react';
import { LogEntryRenderer } from './log-entry-renderer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BaseLogViewerProps, LogEntry } from '@/types';

interface EditableLogViewerProps extends BaseLogViewerProps {
  showOOC: boolean;
  onEntryEdit: (index: number, newEntry: LogEntry) => void;
  onEntryDelete: (index: number) => void;
  onInsertRequest: (index: number) => void;
}

export function EditableLogViewer({
  entries,
  settings,
  showOOC,
  onEntryEdit,
  onEntryDelete,
  onInsertRequest,
}: EditableLogViewerProps) {
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingContent, setEditingContent] = useState<string>('');

  const startEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditingContent(content);
  };

  const saveEdit = (index: number) => {
    const entry = entries[index];
    const updatedEntry = { ...entry, content: editingContent };
    onEntryEdit(index, updatedEntry);
    setEditingIndex(-1);
    setEditingContent('');
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditingContent('');
  };

  const getFilteredEntries = () => {
    if (showOOC) {
      return entries;
    } else {
      return entries.filter(entry =>
        [
          'system',
          'character',
          'whisper',
          'dice',
          'damage',
          'handout',
        ].includes(entry.type)
      );
    }
  };

  const filteredEntries = getFilteredEntries();

  return (
    <div className='flex flex-col gap-1 relative'>
      {filteredEntries.map(entry => (
        <div key={`${entry.id}-${entries.indexOf(entry)}`} className='relative'>
          {/* 삽입 버튼 - 로그 항목들 사이의 gap 중앙에 위치 */}
          <div
            className='absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full h-4 flex items-center justify-center group cursor-pointer'
            onClick={() => onInsertRequest(entries.indexOf(entry))}
          >
            <Button
              variant='outline'
              size='sm'
              className='w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <Plus className='w-4 h-4 text-foreground' />
            </Button>
          </div>

          <LogEntryRenderer
            entry={entry}
            settings={settings}
            isEditing={editingIndex === entries.indexOf(entry)}
            editingContent={editingContent}
            onEdit={content => startEdit(entries.indexOf(entry), content)}
            onSave={() => saveEdit(entries.indexOf(entry))}
            onCancel={cancelEdit}
            onDelete={() => onEntryDelete(entries.indexOf(entry))}
            onEditingContentChange={setEditingContent}
            showEditControls={true}
          />
        </div>
      ))}

      {/* 마지막에 추가 버튼 */}
      <div className='relative'>
        <div
          className='w-full h-4 flex items-center justify-center group cursor-pointer'
          onClick={() => onInsertRequest(entries.length)}
        >
          <Button
            variant='outline'
            size='sm'
            className='w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
          >
            <Plus className='w-4 h-4 text-foreground' />
          </Button>
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className='text-center py-12 text-muted-foreground'>
          표시할 내용이 없습니다.
        </div>
      )}
    </div>
  );
}
