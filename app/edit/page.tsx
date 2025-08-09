'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RotateCcw, Upload, FileText, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { LogEntry } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
      <div key={`${entry.id}-${actualIndex}`}>
        {/* 삽입 버튼 */}
        <div 
          className="group flex justify-center py-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => onInsertRequest(actualIndex)}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="w-4 h-4 text-gray-400 hover:text-blue-500" />
          </div>
        </div>

        {/* 로그 엔트리 */}
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
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-1 h-full overflow-y-auto'>
      {filteredEntries.map((entry, index) => renderEntry(entry, index))}
      
      {/* 마지막에 추가 버튼 */}
      <div 
        className="group flex justify-center py-4 hover:bg-gray-50 cursor-pointer"
        onClick={() => onInsertRequest(entries.length)}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-4 h-4 text-gray-400 hover:text-blue-500" />
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

  const handleEntryEdit = (index: number, newEntry: LogEntry) => {
    const newEntries = [...parsedEntries];
    newEntries[index] = newEntry;
    setParsedEntries(newEntries);
  };

  const handleEntryDelete = (index: number) => {
    const newEntries = parsedEntries.filter((_, i) => i !== index);
    setParsedEntries(newEntries);
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
      } catch (error) {
        alert('파일 파싱에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    setParsedEntries([]);
    setHasData(false);
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
  ];

  const handleAddEntry = () => {
    if (!selectedLogType || !newEntryData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newEntry: LogEntry = {
      id: Math.max(...parsedEntries.map(e => e.id), 0) + 1,
      type: selectedLogType as any,
      content: newEntryData.content,
      ...newEntryData
    };

    const newEntries = [...parsedEntries];
    newEntries.splice(insertIndex, 0, newEntry);
    setParsedEntries(newEntries);
    
    // 사이드바 닫기
    setShowSidebar(false);
    setSelectedLogType('');
    setNewEntryData({});
    setInsertIndex(-1);
  };

  return (
    <>
      <Header title="TRPG 로그 편집기" showBackButton />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">로그 편집</h1>
              <p className="text-muted-foreground">
                각 로그를 직접 편집하거나 새로운 항목을 추가할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/parse')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                파서로 돌아가기
              </Button>
              {hasData && (
                <Button onClick={clearData} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  새로 시작
                </Button>
              )}
              <Button 
                onClick={handleDownload} 
                disabled={!parsedEntries.length}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                완성된 JSON 다운로드
              </Button>
            </div>
          </div>
        </div>

        {!hasData ? (
          // 시작 화면
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  JSON 파일 업로드
                </CardTitle>
                <CardDescription>
                  기존에 파싱된 TRPG 로그 JSON 파일을 업로드하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  파일 선택
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={`flex gap-6 h-[calc(100vh-200px)] ${showSidebar ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {/* 메인 편집 영역 */}
            <div className={`${showSidebar ? 'flex-1' : 'w-full'} flex flex-col`}>
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">로그 편집기</CardTitle>
                      <CardDescription>
                        각 항목을 클릭하여 편집하거나 + 버튼으로 새 항목을 추가하세요.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="ooc-toggle" className="text-sm font-medium">
                        사담
                      </Label>
                      <Switch
                        id="ooc-toggle"
                        checked={showOOC}
                        onCheckedChange={setShowOOC}
                      />
                      <span className="text-xs text-muted-foreground">
                        {showOOC ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                  <EditableLogViewer
                    entries={parsedEntries}
                    characters={characters}
                    settings={defaultReadingSettings}
                    showOOC={showOOC}
                    onEntryEdit={handleEntryEdit}
                    onEntryDelete={handleEntryDelete}
                    onInsertRequest={handleInsertRequest}
                  />
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

                        {/* 내용 */}
                        <div>
                          <Label className="text-sm font-medium">내용</Label>
                          <Textarea
                            value={newEntryData.content || ''}
                            onChange={(e) => setNewEntryData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="내용을 입력하세요"
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