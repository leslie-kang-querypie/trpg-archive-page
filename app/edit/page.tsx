'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RotateCcw, Upload, FileText, Plus, X, ChevronRight } from 'lucide-react';
import { Stepper } from '@/components/ui/steps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { LogEntry } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';


// 범위 선택 컴포넌트
interface RangeSelectionViewerProps {
  entries: LogEntry[];
  characters: any[];
  settings: any;
  startIndex: number;
  endIndex: number;
  onRangeChange: (start: number, end: number) => void;
}

function RangeSelectionViewer({ 
  entries, 
  characters, 
  settings, 
  startIndex,
  endIndex,
  onRangeChange
}: RangeSelectionViewerProps) {
  // 범위 선택 단계에서는 모든 엔트리를 표시 (사담 필터 무시)
  const totalCount = entries.length;
  const selectedCount = Math.max(0, endIndex - startIndex + 1);

  const handleSliderChange = (values: number[]) => {
    const [newStart, newEnd] = values;
    onRangeChange(newStart, newEnd);
  };

  const handleStartChange = (value: string) => {
    const newStart = Math.max(0, Math.min(parseInt(value) - 1 || 0, totalCount - 1));
    onRangeChange(newStart, Math.max(newStart, endIndex));
  };

  const handleEndChange = (value: string) => {
    const newEnd = Math.max(startIndex, Math.min(parseInt(value) - 1 || 0, totalCount - 1));
    onRangeChange(startIndex, newEnd);
  };

  const getTextStyle = () => ({
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineSpacing,
  });

  const renderEntry = (entry: LogEntry, originalIndex: number, displayIndex: number) => {
    const textStyle = getTextStyle();
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
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          #{originalIndex + 1}
        </div>

        {/* 선택 표시 */}
        {isInRange && (
          <div className="absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full"></div>
        )}

        {/* 엔트리 내용 */}
        <div className={`${isInRange ? 'ml-6' : 'ml-3'} mr-12`}>
          {/* 시스템 메시지 */}
          {entry.type === 'system' && (
            <div style={textStyle}>
              <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium mr-2">SYSTEM</span>
              <span className="text-gray-600">{entry.content.substring(0, 100)}{entry.content.length > 100 ? '...' : ''}</span>
            </div>
          )}

          {/* 캐릭터 대화 */}
          {entry.type === 'character' && entry.character && (
            <div style={textStyle}>
              <span className="inline-block bg-green-100 px-2 py-1 rounded text-xs font-medium mr-2">CHARACTER</span>
              <span className='font-bold text-gray-800'>{entry.character}</span>
              <span className='ml-2 text-gray-600'>{entry.content.substring(0, 80)}{entry.content.length > 80 ? '...' : ''}</span>
            </div>
          )}

          {/* OOC */}
          {entry.type === 'ooc' && (
            <div style={textStyle}>
              <span className="inline-block bg-yellow-100 px-2 py-1 rounded text-xs font-medium mr-2">OOC</span>
              <span className='font-medium text-gray-800'>{entry.character}</span>
              <span className='ml-2 text-gray-600'>{entry.content.substring(0, 80)}{entry.content.length > 80 ? '...' : ''}</span>
            </div>
          )}

          {/* 귓속말 */}
          {entry.type === 'whisper' && entry.character && (
            <div style={textStyle}>
              <span className="inline-block bg-amber-100 px-2 py-1 rounded text-xs font-medium mr-2">WHISPER</span>
              <span className='font-bold text-gray-800'>{entry.character}</span>
              {entry.target && (
                <>
                  <span className='mx-1'>→</span>
                  <span className='font-medium text-gray-700'>{entry.target}</span>
                </>
              )}
              <span className='ml-2 text-gray-600'>{entry.content.substring(0, 60)}{entry.content.length > 60 ? '...' : ''}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-4 h-full flex flex-col'>
      {/* 범위 선택 컨트롤 */}
      <div className="bg-white border rounded-lg p-4 flex-shrink-0">
        <div className="space-y-4">
          <div className="text-lg font-semibold">
            편집 범위 선택: {selectedCount}개 로그 선택됨 (전체 {totalCount}개)
          </div>
          
          {/* 직접 입력 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">시작:</Label>
              <Input
                type="number"
                min="1"
                max={totalCount}
                value={startIndex + 1}
                onChange={(e) => handleStartChange(e.target.value)}
                className="w-20 text-center"
              />
            </div>
            <span className="text-gray-500">~</span>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">끝:</Label>
              <Input
                type="number"
                min="1"
                max={totalCount}
                value={endIndex + 1}
                onChange={(e) => handleEndChange(e.target.value)}
                className="w-20 text-center"
              />
            </div>
            <div className="flex gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRangeChange(0, Math.min(499, totalCount - 1))}
              >
                처음 500개
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRangeChange(Math.max(0, totalCount - 500), totalCount - 1)}
              >
                마지막 500개
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRangeChange(0, totalCount - 1)}
              >
                전체 선택
              </Button>
            </div>
          </div>

          {/* 범위 슬라이더 */}
          {totalCount > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">범위 슬라이더</Label>
              <div className="px-3">
                <Slider
                  value={[startIndex, endIndex]}
                  onValueChange={handleSliderChange}
                  max={totalCount - 1}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span className="font-medium text-blue-600">
                  #{startIndex + 1} ~ #{endIndex + 1}
                </span>
                <span>{totalCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 로그 미리보기 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <div className="text-sm font-medium text-gray-600 mb-3">
          미리보기 (선택된 범위가 파란색으로 표시됩니다)
        </div>
        
        {/* 시작 부분 컨텍스트 */}
        {startIndex > 0 && (
          <div className="text-xs text-gray-400 text-center py-2">
            ... {startIndex}개 로그 생략 ...
          </div>
        )}

        {/* 선택 범위 + 앞뒤 컨텍스트 표시 */}
        {entries
          .slice(Math.max(0, startIndex - 3), Math.min(totalCount, endIndex + 4))
          .map((entry, arrayIndex) => {
            const originalIndex = Math.max(0, startIndex - 3) + arrayIndex;
            return renderEntry(entry, originalIndex, 0);
          })}

        {/* 끝 부분 컨텍스트 */}
        {endIndex < totalCount - 1 && (
          <div className="text-xs text-gray-400 text-center py-2">
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

// 편집 가능한 로그 뷰어 컴포넌트
interface EditableLogViewerProps {
  entries: LogEntry[];
  characters: any[];
  settings: any;
  showOOC: boolean;
  onEntryEdit: (index: number, newEntry: LogEntry) => void;
  onEntryDelete: (index: number) => void;
  onInsertRequest: (index: number) => void;
}

function EditableLogViewer({ 
  entries, 
  characters, 
  settings, 
  showOOC, 
  onEntryEdit, 
  onEntryDelete,
  onInsertRequest 
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
        ['system', 'character', 'whisper', 'dice', 'damage', 'handout'].includes(entry.type)
      );
    }
  };

  const filteredEntries = getFilteredEntries();

  const getTextStyle = () => ({
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineSpacing,
  });

  const getParagraphSpacing = () => ({
    marginBottom: `${settings.paragraphSpacing * 0.5}rem`,
  });

  const getAvatarUrl = (entry: LogEntry) => {
    if (entry.avatar && !entry.avatar.includes('$0')) {
      return entry.avatar;
    }
    const characterInfo = characters.find(c => c.name === entry.character);
    if (characterInfo?.thumbnail) {
      return characterInfo.thumbnail;
    }
    return '/placeholder.svg?height=28&width=28&query=character';
  };

  const renderEntry = (entry: LogEntry, index: number) => {
    const actualIndex = entries.indexOf(entry);
    const isEditing = editingIndex === actualIndex;
    const textStyle = getTextStyle();
    const paragraphStyle = getParagraphSpacing();

    return (
      <div className="relative group border-l-2 border-transparent hover:border-blue-200 pl-3">
        {/* 편집/삭제 버튼 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {!isEditing && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => startEdit(actualIndex, entry.content)}
                className="h-6 px-2 text-xs"
              >
                편집
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEntryDelete(actualIndex)}
                className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>

        {/* 엔트리 내용 */}
        <div style={paragraphStyle}>
          {/* 시스템 메시지 */}
          {entry.type === 'system' && (
              <div className={`text-muted-foreground ${settings.centerSystemMessages ? 'text-center' : ''}`} style={textStyle}>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(actualIndex)}>저장</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>취소</Button>
                    </div>
                  </div>
                ) : (
                  entry.content
                )}
              </div>
          )}

          {/* 캐릭터 대화 */}
          {entry.type === 'character' && entry.character && (
              <div className='flex gap-3'>
                {settings.showAvatars && (
                  <div className="w-7 h-7 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                    {entry.character?.charAt(0) || '?'}
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <div style={textStyle}>
                    <span className='font-bold'>{entry.character}</span>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(actualIndex)}>저장</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <span className='ml-4'>{entry.content}</span>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* OOC */}
          {entry.type === 'ooc' && (
              <div className='flex gap-3'>
                {settings.showAvatars && (
                  <div className='w-7 h-7 flex-shrink-0'></div>
                )}
                <div className='flex-1 min-w-0 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200'>
                  <div className='flex items-center gap-2' style={textStyle}>
                    <span className='font-medium'>{entry.character}</span>
                    {isEditing ? (
                      <div className="mt-2 space-y-2 w-full">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(actualIndex)}>저장</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <span className='text-muted-foreground'>{entry.content}</span>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* 귓속말 */}
          {entry.type === 'whisper' && entry.character && (
              <div className='bg-amber-50 rounded-lg px-3 py-2 italic'>
                <div className='flex items-start gap-3'>
                  {settings.showAvatars && (
                    <div className="w-6 h-6 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {entry.character.charAt(0)}
                    </div>
                  )}
                  <div className='flex-1 min-w-0' style={textStyle}>
                    <span className='font-bold'>{entry.character}</span>
                    {entry.target && (
                      <>
                        <span className='mx-1'>→</span>
                        <span className='font-medium'>{entry.target}</span>
                      </>
                    )}
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(actualIndex)}>저장</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <span className='ml-2'>{entry.content}</span>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* 주사위 굴리기 */}
          {entry.type === 'dice' && entry.diceResult && (
              <div className='flex gap-3'>
                {settings.showAvatars && (
                  <div className='w-7 h-7 flex-shrink-0'></div>
                )}
                <div className='flex-1 min-w-0 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200'>
                  <div className='flex items-center gap-2 flex-wrap' style={textStyle}>
                    <div className='w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center'>
                      <span className='text-white text-xs font-bold'>D</span>
                    </div>
                    <span className='font-bold'>{entry.character}</span>
                    <span>굴림:</span>
                    <span className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                      {entry.diceResult.dice}
                    </span>
                    <span>=</span>
                    <span className='font-mono text-sm text-gray-600'>
                      [{entry.diceResult.rolls?.join(', ')}]
                      {entry.diceResult.modifier ? ` + ${entry.diceResult.modifier}` : ''}
                    </span>
                    <span>=</span>
                    <span className='bg-blue-600 text-white px-2 py-1 rounded font-bold'>
                      {entry.diceResult.result}
                    </span>
                  </div>
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(actualIndex)}>저장</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>취소</Button>
                      </div>
                    </div>
                  ) : entry.content && (
                    <div className='mt-1 text-sm text-gray-600' style={textStyle}>
                      {entry.content}
                    </div>
                  )}
                </div>
              </div>
          )}

          {/* 데미지/힐링 */}
          {entry.type === 'damage' && entry.damageInfo && (
              <div className='flex gap-3'>
                {settings.showAvatars && (
                  <div className='w-7 h-7 flex-shrink-0'></div>
                )}
                <div className={`flex-1 min-w-0 rounded-lg px-3 py-2 border ${
                  entry.damageInfo.type === 'damage'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className='flex items-center gap-2' style={textStyle}>
                    <div className={`w-4 h-4 rounded-full ${
                      entry.damageInfo.type === 'damage' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      <span className='text-white text-xs flex items-center justify-center w-full h-full'>♥</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.damageInfo.type === 'damage' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.damageInfo.type === 'damage' ? '데미지' : '힐링'}
                    </span>
                    <span className='font-bold'>{entry.damageInfo.target}</span>
                    <span>{entry.damageInfo.type === 'damage' ? '받은 피해:' : '회복:'}</span>
                    <span className={`px-2 py-1 rounded font-bold text-white ${
                      entry.damageInfo.type === 'damage' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      {entry.damageInfo.amount}
                    </span>
                  </div>
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(actualIndex)}>저장</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>취소</Button>
                      </div>
                    </div>
                  ) : entry.content && (
                    <div className='mt-1 text-sm text-gray-600' style={textStyle}>
                      {entry.content}
                    </div>
                  )}
                </div>
              </div>
          )}

          {/* 핸드아웃 */}
          {entry.type === 'handout' && entry.handoutInfo && (
              <div className='flex gap-3'>
                {settings.showAvatars && (
                  <div className='w-7 h-7 flex-shrink-0'></div>
                )}
                <div className={`flex-1 min-w-0 rounded-lg px-3 py-2 border ${
                  entry.handoutInfo.isSecret
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2' style={textStyle}>
                      <div className={`w-4 h-4 rounded ${
                        entry.handoutInfo.isSecret ? 'bg-gray-600' : 'bg-gray-400'
                      } flex items-center justify-center`}>
                        <span className='text-white text-xs'>📄</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.handoutInfo.isSecret 
                          ? 'bg-gray-700 text-gray-200 border-gray-600'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.handoutInfo.isSecret ? '비밀 핸드아웃' : '핸드아웃'}
                      </span>
                      {entry.handoutInfo.category && (
                        <span className={`px-2 py-1 rounded text-xs border ${
                          entry.handoutInfo.isSecret 
                            ? 'border-gray-600 text-gray-300'
                            : 'border-gray-300 text-gray-600'
                        }`}>
                          {entry.handoutInfo.category}
                        </span>
                      )}
                      <span className={entry.handoutInfo.isSecret ? 'text-gray-400' : 'text-gray-500'}>→</span>
                      <span className={`font-bold ${
                        entry.handoutInfo.isSecret ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                        {entry.handoutInfo.target}
                      </span>
                    </div>
                    <div className='pl-6'>
                      <div className={`font-medium mb-1 ${
                        entry.handoutInfo.isSecret ? 'text-gray-100' : 'text-gray-900'
                      }`} style={textStyle}>
                        {entry.handoutInfo.title}
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveEdit(actualIndex)}>저장</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>취소</Button>
                          </div>
                        </div>
                      ) : (
                        <div className={`text-sm ${
                          entry.handoutInfo.isSecret ? 'text-gray-200' : 'text-gray-700'
                        }`} style={textStyle}>
                          {entry.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col gap-1 relative'>
      {filteredEntries.map((entry, index) => (
        <div key={`${entry.id}-${entries.indexOf(entry)}`} className="relative">
          {/* 삽입 버튼 - 로그 항목들 사이의 gap 중앙에 위치 */}
          <div 
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full h-4 flex items-center justify-center group cursor-pointer"
            onClick={() => onInsertRequest(entries.indexOf(entry))}
          >
            <Button 
              variant="outline" 
              size="sm"
              className="w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </Button>
          </div>
          
          {renderEntry(entry, index)}
        </div>
      ))}
      
      {/* 마지막에 추가 버튼 */}
      <div className="relative">
        <div 
          className="w-full h-4 flex items-center justify-center group cursor-pointer"
          onClick={() => onInsertRequest(entries.length)}
        >
          <Button 
            variant="outline" 
            size="sm"
            className="w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4 text-foreground" />
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

export default function EditPage() {
  const router = useRouter();
  const [showOOC, setShowOOC] = useState(false);
  const [parsedEntries, setParsedEntries] = useState<LogEntry[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState<string>('');
  const [insertIndex, setInsertIndex] = useState<number>(-1);
  const [newEntryData, setNewEntryData] = useState<Partial<LogEntry>>({});
  const [showRawJson, setShowRawJson] = useState(false);
  
  // 단계 관련 상태
  const [currentStep, setCurrentStep] = useState<'upload' | 'select' | 'edit'>('upload');
  const [rangeStart, setRangeStart] = useState<number>(0);
  const [rangeEnd, setRangeEnd] = useState<number>(499);
  const [editingEntries, setEditingEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('trpg_editing_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const entries = data.parsedData as LogEntry[];
        setParsedEntries(entries);
        const chars = generateCharacters(entries);
        setCharacters(chars);
        setHasData(true);
        setCurrentStep('select'); // 데이터가 있으면 선택 단계로
        
        // 초기 범위를 전체 로그 수에 맞게 설정
        setRangeEnd(Math.max(0, Math.min(499, entries.length - 1)));
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // 캐릭터 정보 생성 (JSON 데이터에서 자동 추출)
  const generateCharacters = (entries: LogEntry[]) => {
    const characterMap = new Map<string, { count: number; imageFile?: string }>();
    
    entries.forEach(entry => {
      if (entry.type === 'character' && entry.character) {
        const current = characterMap.get(entry.character) || { count: 0 };
        characterMap.set(entry.character, { 
          ...current, 
          count: current.count + 1 
        });
      }
    });

    return Array.from(characterMap.entries()).map(([name, data]) => ({
      name,
      player: '플레이어',
      class: '모험가',
      description: `${data.count}개의 메시지`,
      thumbnail: `/assets/${name.replace(/\s+/g, '_').toLowerCase()}.png`,
    }));
  };

  // 범위 변경 핸들러
  const handleRangeChange = (start: number, end: number) => {
    setRangeStart(start);
    setRangeEnd(end);
  };

  // 단계 전환 함수들
  const proceedToEdit = () => {
    if (rangeStart > rangeEnd) {
      alert('올바른 범위를 선택해주세요.');
      return;
    }
    
    const selectedEntries = parsedEntries.slice(rangeStart, rangeEnd + 1);
    setEditingEntries(selectedEntries);
    setCurrentStep('edit');
    
    // 편집 모드 진입 시 기본 설정
    setShowOOC(true); // 사담 ON
    // 사이드바는 기본으로 열지 않고 필요할 때만 열기
  };

  const backToSelect = () => {
    setCurrentStep('select');
    setEditingEntries([]);
    setShowSidebar(false);
    setShowOOC(false); // 편집 모드 벗어날 때 사담 OFF
  };

  const backToUpload = () => {
    setCurrentStep('upload');
    setParsedEntries([]);
    setHasData(false);
    setEditingEntries([]);
    setShowSidebar(false);
    setShowOOC(false); // 처음으로 돌아갈 때 사담 OFF
  };

  const saveEditedEntries = () => {
    const newParsedEntries = [...parsedEntries];
    
    // 편집된 엔트리들을 원본 배열의 해당 위치에 업데이트
    editingEntries.forEach((editedEntry, index) => {
      const originalIndex = rangeStart + index;
      if (originalIndex < newParsedEntries.length) {
        newParsedEntries[originalIndex] = editedEntry;
      }
    });
    
    // 삭제된 항목들 처리 (editingEntries가 원본보다 적을 경우)
    const originalCount = rangeEnd - rangeStart + 1;
    if (editingEntries.length < originalCount) {
      const deleteCount = originalCount - editingEntries.length;
      newParsedEntries.splice(rangeStart + editingEntries.length, deleteCount);
    }
    
    setParsedEntries(newParsedEntries);
    setCurrentStep('select');
    setEditingEntries([]);
    
    // 범위를 새로운 데이터 크기에 맞게 조정
    const newLength = newParsedEntries.length;
    if (rangeEnd >= newLength) {
      setRangeEnd(Math.max(0, newLength - 1));
    }
    if (rangeStart >= newLength) {
      setRangeStart(Math.max(0, newLength - 1));
    }
  };

  const handleEntryEdit = (index: number, newEntry: LogEntry) => {
    const newEntries = [...editingEntries];
    newEntries[index] = newEntry;
    setEditingEntries(newEntries);
  };

  const handleEntryDelete = (index: number) => {
    const newEntries = editingEntries.filter((_, i) => i !== index);
    setEditingEntries(newEntries);
  };

  const handleInsertRequest = (index: number) => {
    setInsertIndex(index);
    setShowSidebar(true);
    setSelectedLogType('');
    setNewEntryData({});
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const data = JSON.parse(content);
        const entries = Array.isArray(data) ? data : data.parsedData || [];
        setParsedEntries(entries);
        const chars = generateCharacters(entries);
        setCharacters(chars);
        setHasData(true);
        setCurrentStep('select'); // 업로드 후 선택 단계로 이동
        
        // 초기 범위 설정
        setRangeStart(0);
        setRangeEnd(Math.max(0, Math.min(499, entries.length - 1)));
      } catch (error) {
        alert('파일 파싱에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    setParsedEntries([]);
    setHasData(false);
    setCurrentStep('upload');
    setShowSidebar(false);
    setShowOOC(false);
    localStorage.removeItem('trpg_editing_data');
  };

  const handleDownload = () => {
    if (!parsedEntries.length) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    const blob = new Blob([JSON.stringify(parsedEntries, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trpg_chatlog_edited_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const defaultReadingSettings = {
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2,
    centerSystemMessages: false,
  };

  const logTypeOptions = [
    { value: 'system', label: '시스템' },
    { value: 'character', label: '캐릭터' },
    { value: 'whisper', label: '귓속말' },
    { value: 'ooc', label: 'OOC' },
    { value: 'dice', label: '주사위' },
    { value: 'damage', label: '데미지/힐링' },
    { value: 'handout', label: '핸드아웃' },
  ];

  const handleAddEntry = () => {
    if (!selectedLogType || !newEntryData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 타입별 추가 유효성 검사
    if (['character', 'ooc', 'whisper'].includes(selectedLogType) && !newEntryData.character) {
      alert('캐릭터명을 입력해주세요.');
      return;
    }
    if (selectedLogType === 'whisper' && !newEntryData.target) {
      alert('받는 사람을 입력해주세요.');
      return;
    }
    if (selectedLogType === 'dice' && (!newEntryData.diceResult?.dice || !newEntryData.diceResult?.result)) {
      alert('주사위 정보를 모두 입력해주세요.');
      return;
    }
    if (selectedLogType === 'damage' && (!newEntryData.damageInfo?.target || !newEntryData.damageInfo?.amount)) {
      alert('데미지 정보를 모두 입력해주세요.');
      return;
    }
    if (selectedLogType === 'handout' && (!newEntryData.handoutInfo?.title || !newEntryData.handoutInfo?.target)) {
      alert('핸드아웃 제목과 받는 사람을 입력해주세요.');
      return;
    }

    const newEntry: LogEntry = {
      id: Math.max(...editingEntries.map(e => e.id), 0) + 1,
      type: selectedLogType as any,
      content: newEntryData.content,
      ...newEntryData
    };

    const newEntries = [...editingEntries];
    newEntries.splice(insertIndex, 0, newEntry);
    setEditingEntries(newEntries);
    
    // 사이드바 닫기
    setShowSidebar(false);
    setSelectedLogType('');
    setNewEntryData({});
    setInsertIndex(-1);
  };

  return (
    <>
      <Header title="TRPG 로그 편집기" showBackButton />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 단계 표시 UI */}
        <div className='flex justify-center'>
          <Stepper
            steps={[
              {
                id: 'upload',
                title: 'JSON 업로드',
                description: 'TRPG 로그 파일 업로드'
              },
              {
                id: 'select',
                title: '범위 선택',
                description: '편집할 로그 범위 설정'
              },
              {
                id: 'edit',
                title: '로그 편집',
                description: '선택한 로그 편집'
              }
            ]}
            currentStep={
              currentStep === 'upload' ? 0 :
              currentStep === 'select' ? 1 : 2
            }
            onStepClick={(stepIndex) => {
              if (stepIndex === 0) {
                backToUpload();
              } else if (stepIndex === 1 && hasData) {
                backToSelect();
              }
              // edit 단계는 proceedToEdit를 통해서만 이동
            }}
            className='max-w-3xl'
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                로그 편집
              </h1>
              <p className="text-muted-foreground">
                {currentStep === 'upload' 
                  ? 'TRPG 로그 JSON 파일을 업로드하여 편집을 시작하세요.'
                  : currentStep === 'select' 
                  ? '편집할 로그 범위를 선택하세요. 슬라이더나 직접 입력으로 범위를 설정할 수 있습니다.'
                  : '선택한 로그를 편집하세요. 각 항목을 클릭하여 편집하거나 + 버튼으로 새 항목을 추가할 수 있습니다.'
                }
              </p>
            </div>
            <div className="flex gap-2">
              {currentStep === 'edit' && (
                /* 편집 단계: 편집 완료와 다운로드 버튼만 표시 */
                <>
                  <Button 
                    onClick={saveEditedEntries} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    편집 완료
                  </Button>
                  <Button 
                    onClick={handleDownload} 
                    disabled={!parsedEntries.length}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON 다운로드
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {currentStep === 'upload' ? (
          // 1단계: JSON 업로드
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                JSON 파일 업로드
              </CardTitle>
              <CardDescription>
                기존에 파싱된 TRPG 로그 JSON 파일을 업로드하세요. 파싱 페이지에서 생성된 JSON 파일을 사용할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  파일 선택
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-2">지원되는 파일 형식:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>파싱 페이지에서 생성된 JSON 파일</li>
                  <li>이전에 편집한 JSON 파일</li>
                  <li>TRPG 로그 배열 형태의 JSON 데이터</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : currentStep === 'select' ? (
          // 2단계: 범위 선택
          <div className="h-[calc(100vh-200px)] flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">편집할 로그 선택</CardTitle>
                    <CardDescription>
                      편집할 로그들을 체크박스로 선택하세요. 전체 선택도 가능합니다.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={proceedToEdit}
                      disabled={rangeStart > rangeEnd}
                    >
                      편집하기 ({Math.max(0, rangeEnd - rangeStart + 1)}개 선택)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-4">
                <RangeSelectionViewer
                  entries={parsedEntries}
                  characters={characters}
                  settings={defaultReadingSettings}
                  startIndex={rangeStart}
                  endIndex={rangeEnd}
                  onRangeChange={handleRangeChange}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          // 3단계: 편집
          <div className={`flex gap-6 h-[calc(100vh-200px)] ${showSidebar ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {/* 메인 편집 영역 */}
            <div className={`${showSidebar ? 'flex-1' : 'w-full'} flex flex-col`}>
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">로그 편집기</CardTitle>
                      <CardDescription>
                        선택한 {editingEntries.length}개의 로그를 편집합니다. 각 항목을 클릭하여 편집하거나 + 버튼으로 새 항목을 추가하세요.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="ooc-toggle-edit" className="text-sm font-medium">
                          사담
                        </Label>
                        <Switch
                          id="ooc-toggle-edit"
                          checked={showOOC}
                          onCheckedChange={setShowOOC}
                        />
                        <span className="text-xs text-muted-foreground">
                          {showOOC ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="raw-json-toggle" className="text-sm font-medium">
                          Raw JSON
                        </Label>
                        <Switch
                          id="raw-json-toggle"
                          checked={showRawJson}
                          onCheckedChange={setShowRawJson}
                        />
                        <span className="text-xs text-muted-foreground">
                          {showRawJson ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                  {showRawJson ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(editingEntries, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <EditableLogViewer
                      entries={editingEntries}
                      characters={characters}
                      settings={defaultReadingSettings}
                      showOOC={showOOC}
                      onEntryEdit={handleEntryEdit}
                      onEntryDelete={handleEntryDelete}
                      onInsertRequest={handleInsertRequest}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            {showSidebar && (
              <div className="w-80 flex flex-col">
                <Card className="flex-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">새 로그 추가</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSidebar(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 로그 타입 선택 */}
                    <div>
                      <Label className="text-sm font-medium">로그 타입</Label>
                      <Select value={selectedLogType} onValueChange={setSelectedLogType}>
                        <SelectTrigger>
                          <SelectValue placeholder="타입을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {logTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 타입별 입력 폼 */}
                    {selectedLogType && (
                      <div className="space-y-3">
                        {/* 캐릭터 타입 */}
                        {(selectedLogType === 'character' || selectedLogType === 'ooc' || selectedLogType === 'whisper') && (
                          <div>
                            <Label className="text-sm font-medium">캐릭터명</Label>
                            <Input
                              value={newEntryData.character || ''}
                              onChange={(e) => setNewEntryData(prev => ({ ...prev, character: e.target.value }))}
                              placeholder="캐릭터명을 입력하세요"
                            />
                          </div>
                        )}

                        {/* 귓속말 타겟 */}
                        {selectedLogType === 'whisper' && (
                          <div>
                            <Label className="text-sm font-medium">받는 사람</Label>
                            <Input
                              value={newEntryData.target || ''}
                              onChange={(e) => setNewEntryData(prev => ({ ...prev, target: e.target.value }))}
                              placeholder="받는 사람을 입력하세요"
                            />
                          </div>
                        )}

                        {/* 주사위 결과 */}
                        {selectedLogType === 'dice' && (
                          <>
                            <div>
                              <Label className="text-sm font-medium">주사위 표기 (예: 2d6+3)</Label>
                              <Input
                                value={newEntryData.diceResult?.dice || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  diceResult: { ...prev.diceResult, dice: e.target.value }
                                }))}
                                placeholder="2d6+3"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">결과값</Label>
                              <Input
                                type="number"
                                value={newEntryData.diceResult?.result || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  diceResult: { ...prev.diceResult, result: parseInt(e.target.value) || 0 }
                                }))}
                                placeholder="최종 결과값"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">개별 주사위 값 (쉼표로 구분)</Label>
                              <Input
                                value={newEntryData.diceResult?.rolls?.join(', ') || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  diceResult: { 
                                    ...prev.diceResult, 
                                    rolls: e.target.value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n))
                                  }
                                }))}
                                placeholder="3, 5, 2"
                              />
                            </div>
                          </>
                        )}

                        {/* 데미지/힐링 정보 */}
                        {selectedLogType === 'damage' && (
                          <>
                            <div>
                              <Label className="text-sm font-medium">대상</Label>
                              <Input
                                value={newEntryData.damageInfo?.target || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  damageInfo: { ...prev.damageInfo, target: e.target.value }
                                }))}
                                placeholder="대상 캐릭터명"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">유형</Label>
                              <Select 
                                value={newEntryData.damageInfo?.type || 'damage'} 
                                onValueChange={(value) => setNewEntryData(prev => ({
                                  ...prev, 
                                  damageInfo: { ...prev.damageInfo, type: value as 'damage' | 'healing' }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="damage">데미지</SelectItem>
                                  <SelectItem value="healing">힐링</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">수치</Label>
                              <Input
                                type="number"
                                value={newEntryData.damageInfo?.amount || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  damageInfo: { ...prev.damageInfo, amount: parseInt(e.target.value) || 0 }
                                }))}
                                placeholder="수치 입력"
                              />
                            </div>
                          </>
                        )}

                        {/* 핸드아웃 정보 */}
                        {selectedLogType === 'handout' && (
                          <>
                            <div>
                              <Label className="text-sm font-medium">제목</Label>
                              <Input
                                value={newEntryData.handoutInfo?.title || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  handoutInfo: { ...prev.handoutInfo, title: e.target.value }
                                }))}
                                placeholder="핸드아웃 제목"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">받는 사람</Label>
                              <Input
                                value={newEntryData.handoutInfo?.target || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  handoutInfo: { ...prev.handoutInfo, target: e.target.value }
                                }))}
                                placeholder="받는 사람"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">카테고리</Label>
                              <Input
                                value={newEntryData.handoutInfo?.category || ''}
                                onChange={(e) => setNewEntryData(prev => ({
                                  ...prev, 
                                  handoutInfo: { ...prev.handoutInfo, category: e.target.value }
                                }))}
                                placeholder="카테고리 (선택사항)"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="is-secret"
                                checked={newEntryData.handoutInfo?.isSecret || false}
                                onCheckedChange={(checked) => setNewEntryData(prev => ({
                                  ...prev, 
                                  handoutInfo: { ...prev.handoutInfo, isSecret: checked as boolean }
                                }))}
                              />
                              <Label htmlFor="is-secret" className="text-sm font-medium">비밀 핸드아웃</Label>
                            </div>
                          </>
                        )}

                        {/* 내용 */}
                        <div>
                          <Label className="text-sm font-medium">내용</Label>
                          <Textarea
                            value={newEntryData.content || ''}
                            onChange={(e) => setNewEntryData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder={selectedLogType === 'handout' ? '핸드아웃 내용을 입력하세요' : '내용을 입력하세요'}
                            className="min-h-[100px]"
                          />
                        </div>

                        {/* 추가 버튼 */}
                        <Button onClick={handleAddEntry} className="w-full">
                          로그 추가
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}