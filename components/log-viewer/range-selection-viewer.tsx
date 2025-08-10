import { BaseLogViewerProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface RangeSelectionViewerProps extends BaseLogViewerProps {
  startIndex: number;
  endIndex: number;
  onRangeChange: (start: number, end: number) => void;
}

export function RangeSelectionViewer({
  entries,
  startIndex,
  endIndex,
  onRangeChange,
}: RangeSelectionViewerProps) {
  const totalCount = entries.length;
  const selectedCount = Math.max(0, endIndex - startIndex + 1);

  const handleSliderChange = (values: number[]) => {
    const [newStart, newEnd] = values;
    onRangeChange(newStart, newEnd);
  };

  const handleStartChange = (value: string) => {
    const newStart = Math.max(
      0,
      Math.min(parseInt(value) - 1 || 0, totalCount - 1)
    );
    onRangeChange(newStart, Math.max(newStart, endIndex));
  };

  const handleEndChange = (value: string) => {
    const newEnd = Math.max(
      startIndex,
      Math.min(parseInt(value) - 1 || 0, totalCount - 1)
    );
    onRangeChange(startIndex, newEnd);
  };

  const renderEntry = (entry: any, originalIndex: number) => {
    const isInRange = originalIndex >= startIndex && originalIndex <= endIndex;

    return (
      <div
        key={`${entry.id}-${originalIndex}`}
        className={`relative border rounded-lg p-3 transition-colors ${
          isInRange
            ? 'bg-blue-50 border-blue-300 shadow-sm'
            : 'bg-white border-gray-200 opacity-60'
        }`}
      >
        {/* 로그 번호 */}
        <div className='absolute top-2 right-2 text-xs text-gray-500'>
          #{originalIndex + 1}
        </div>

        {/* 선택 표시 */}
        {isInRange && (
          <div className='absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full'></div>
        )}

        {/* 엔트리 내용 - 간단한 미리보기 */}
        <div className={`${isInRange ? 'ml-6' : 'ml-3'} mr-12`}>
          {/* 시스템 메시지 */}
          {entry.type === 'system' && (
            <div className='text-gray-600'>
              <span className='inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium mr-2'>
                SYSTEM
              </span>
              <span>
                {entry.content.substring(0, 100)}
                {entry.content.length > 100 ? '...' : ''}
              </span>
            </div>
          )}

          {/* 캐릭터 대화 */}
          {entry.type === 'character' && entry.character && (
            <div>
              <span className='inline-block bg-green-100 px-2 py-1 rounded text-xs font-medium mr-2'>
                CHARACTER
              </span>
              <span className='font-bold text-gray-800'>{entry.character}</span>
              <span className='ml-2 text-gray-600'>
                {entry.content.substring(0, 80)}
                {entry.content.length > 80 ? '...' : ''}
              </span>
            </div>
          )}

          {/* OOC */}
          {entry.type === 'ooc' && (
            <div>
              <span className='inline-block bg-yellow-100 px-2 py-1 rounded text-xs font-medium mr-2'>
                OOC
              </span>
              <span className='font-medium text-gray-800'>
                {entry.character}
              </span>
              <span className='ml-2 text-gray-600'>
                {entry.content.substring(0, 80)}
                {entry.content.length > 80 ? '...' : ''}
              </span>
            </div>
          )}

          {/* 귓속말 */}
          {entry.type === 'whisper' && entry.character && (
            <div>
              <span className='inline-block bg-amber-100 px-2 py-1 rounded text-xs font-medium mr-2'>
                WHISPER
              </span>
              <span className='font-bold text-gray-800'>{entry.character}</span>
              {entry.target && (
                <>
                  <span className='mx-1'>→</span>
                  <span className='font-medium text-gray-700'>
                    {entry.target}
                  </span>
                </>
              )}
              <span className='ml-2 text-gray-600'>
                {entry.content.substring(0, 60)}
                {entry.content.length > 60 ? '...' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-4 h-full flex flex-col'>
      {/* 범위 선택 컨트롤 */}
      <div className='bg-white border rounded-lg p-4 flex-shrink-0'>
        <div className='space-y-4'>
          <div className='text-lg font-semibold'>
            편집 범위 선택: {selectedCount}개 로그 선택됨 (전체 {totalCount}개)
          </div>

          {/* 직접 입력 */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Label className='text-sm font-medium'>시작:</Label>
              <Input
                type='number'
                min='1'
                max={totalCount}
                value={startIndex + 1}
                onChange={e => handleStartChange(e.target.value)}
                className='w-20 text-center'
              />
            </div>
            <span className='text-gray-500'>~</span>
            <div className='flex items-center gap-2'>
              <Label className='text-sm font-medium'>끝:</Label>
              <Input
                type='number'
                min='1'
                max={totalCount}
                value={endIndex + 1}
                onChange={e => handleEndChange(e.target.value)}
                className='w-20 text-center'
              />
            </div>
            <div className='flex gap-2 ml-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onRangeChange(0, Math.min(499, totalCount - 1))}
              >
                처음 500개
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  onRangeChange(Math.max(0, totalCount - 500), totalCount - 1)
                }
              >
                마지막 500개
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onRangeChange(0, totalCount - 1)}
              >
                전체 선택
              </Button>
            </div>
          </div>

          {/* 범위 슬라이더 */}
          {totalCount > 0 && (
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>범위 슬라이더</Label>
              <div className='px-3'>
                <Slider
                  value={[startIndex, endIndex]}
                  onValueChange={handleSliderChange}
                  max={totalCount - 1}
                  min={0}
                  step={1}
                  className='w-full'
                />
              </div>
              <div className='flex justify-between text-xs text-gray-500'>
                <span>1</span>
                <span className='font-medium text-blue-600'>
                  #{startIndex + 1} ~ #{endIndex + 1}
                </span>
                <span>{totalCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 로그 미리보기 */}
      <div className='flex-1 overflow-y-auto space-y-2'>
        <div className='text-sm font-medium text-gray-600 mb-3'>
          미리보기 (선택된 범위가 파란색으로 표시됩니다)
        </div>

        {/* 시작 부분 컨텍스트 */}
        {startIndex > 0 && (
          <div className='text-xs text-gray-400 text-center py-2'>
            ... {startIndex}개 로그 생략 ...
          </div>
        )}

        {/* 선택 범위 + 앞뒤 컨텍스트 표시 */}
        {entries
          .slice(
            Math.max(0, startIndex - 3),
            Math.min(totalCount, endIndex + 4)
          )
          .map((entry, arrayIndex) => {
            const originalIndex = Math.max(0, startIndex - 3) + arrayIndex;
            return renderEntry(entry, originalIndex);
          })}

        {/* 끝 부분 컨텍스트 */}
        {endIndex < totalCount - 1 && (
          <div className='text-xs text-gray-400 text-center py-2'>
            ... {totalCount - endIndex - 1}개 로그 생략 ...
          </div>
        )}

        {totalCount === 0 && (
          <div className='text-center py-12 text-muted-foreground'>
            표시할 내용이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
