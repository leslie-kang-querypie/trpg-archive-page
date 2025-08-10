'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload } from 'lucide-react';
import { Stepper } from '@/components/ui/steps';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/header';
import { 
  LogEntry, 
  Character, 
  ReadingSettings, 
  SubPostMetadata 
} from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RangeSelectionViewer } from '@/components/log-viewer/range-selection-viewer';
import { EditableLogViewer } from '@/components/log-viewer/editable-log-viewer';
import { LogEntryForm } from '@/components/log-viewer/log-entry-form';



export default function EditPage() {
  const router = useRouter();
  const [showOOC, setShowOOC] = useState(false);
  const [parsedEntries, setParsedEntries] = useState<LogEntry[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [hasData, setHasData] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number>(-1);
  const [showRawJson, setShowRawJson] = useState(false);

  // 단계 관련 상태
  const [currentStep, setCurrentStep] = useState<'upload' | 'select' | 'edit'>('upload');
  const [rangeStart, setRangeStart] = useState<number>(0);
  const [rangeEnd, setRangeEnd] = useState<number>(499);
  const [editingEntries, setEditingEntries] = useState<LogEntry[]>([]);

  // SubPost 메타데이터 상태
  const [subPostMeta, setSubPostMeta] = useState<SubPostMetadata>({
    id: '',
    title: '',
    description: '',
  });

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
  const generateCharacters = (entries: LogEntry[]): Character[] => {
    const characterMap = new Map<
      string,
      { count: number; imageFile?: string }
    >();

    entries.forEach(entry => {
      if (entry.type === 'character' && entry.character) {
        const current = characterMap.get(entry.character) || { count: 0 };
        characterMap.set(entry.character, {
          ...current,
          count: current.count + 1,
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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
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

  const handleDownload = () => {
    if (!parsedEntries.length) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    // SubPost 형태로 완성된 데이터 구조 생성
    const subPostData = {
      id: subPostMeta.id || `session_${Date.now()}`,
      title: subPostMeta.title || '편집된 TRPG 로그',
      description: subPostMeta.description || '편집기에서 생성된 로그 세션',
      content: parsedEntries,
    };

    const blob = new Blob([JSON.stringify(subPostData, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trpg_subpost_${subPostData.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const defaultReadingSettings: ReadingSettings = {
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2,
    centerSystemMessages: false,
  };

  const handleAddEntry = (newEntry: LogEntry) => {
    const newEntries = [...editingEntries];
    newEntries.splice(insertIndex, 0, newEntry);
    setEditingEntries(newEntries);

    // 사이드바 닫기
    setShowSidebar(false);
    setInsertIndex(-1);
  };

  const handleCancelAddEntry = () => {
    setShowSidebar(false);
    setInsertIndex(-1);
  };

  return (
    <>
      <Header title='TRPG 로그 편집기' showBackButton />

      <div className='container mx-auto px-4 py-6 max-w-6xl'>
        {/* 단계 표시 UI */}
        <div className='flex justify-center'>
          <Stepper
            steps={[
              {
                id: 'upload',
                title: 'JSON 업로드',
                description: 'TRPG 로그 파일 업로드',
                status: currentStep === 'upload' ? 'current' : (currentStep === 'select' || currentStep === 'edit') ? 'completed' : 'pending',
              },
              {
                id: 'select',
                title: '범위 선택',
                description: '편집할 로그 범위 설정',
                status: currentStep === 'select' ? 'current' : currentStep === 'edit' ? 'completed' : 'pending',
              },
              {
                id: 'edit',
                title: '로그 편집',
                description: '선택한 로그 편집',
                status: currentStep === 'edit' ? 'current' : 'pending',
              },
            ]}
            currentStep={
              currentStep === 'upload' ? 0 : currentStep === 'select' ? 1 : 2
            }
            onStepClick={stepIndex => {
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

        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-2xl font-bold mb-2'>로그 편집</h1>
              <p className='text-muted-foreground'>
                {currentStep === 'upload'
                  ? 'TRPG 로그 JSON 파일을 업로드하여 편집을 시작하세요.'
                  : currentStep === 'select'
                    ? '편집할 로그 범위를 선택하세요. 슬라이더나 직접 입력으로 범위를 설정할 수 있습니다.'
                    : '선택한 로그를 편집하세요. 각 항목을 클릭하여 편집하거나 + 버튼으로 새 항목을 추가할 수 있습니다.'}
              </p>
            </div>
            <div className='flex gap-2'>
              {currentStep === 'edit' && (
                /* 편집 단계: 편집 완료와 다운로드 버튼만 표시 */
                <>
                  <Button
                    onClick={saveEditedEntries}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    편집 완료
                  </Button>
                  <Button
                    onClick={handleDownload}
                    disabled={!parsedEntries.length}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <Download className='h-4 w-4 mr-2' />
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
              <CardTitle className='flex items-center gap-2'>
                <Upload className='h-5 w-5' />
                JSON 파일 업로드
              </CardTitle>
              <CardDescription>
                기존에 파싱된 TRPG 로그 JSON 파일을 업로드하세요. 파싱
                페이지에서 생성된 JSON 파일을 사용할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2 flex-wrap'>
                <Button
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                  className='flex items-center gap-2'
                >
                  <Upload className='h-4 w-4' />
                  파일 선택
                </Button>
                <input
                  id='file-upload'
                  type='file'
                  accept='.json'
                  onChange={handleFileUpload}
                  className='hidden'
                />
              </div>

              <div className='p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <h4 className='font-medium mb-2'>지원되는 파일 형식:</h4>
                <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground'>
                  <li>파싱 페이지에서 생성된 JSON 파일</li>
                  <li>이전에 편집한 JSON 파일</li>
                  <li>TRPG 로그 배열 형태의 JSON 데이터</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : currentStep === 'select' ? (
          // 2단계: 범위 선택
          <div className='h-[calc(100vh-200px)] flex flex-col'>
            <Card className='flex-1 flex flex-col'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg'>편집할 로그 선택</CardTitle>
                    <CardDescription>
                      편집할 로그들을 체크박스로 선택하세요. 전체 선택도
                      가능합니다.
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Button
                      onClick={proceedToEdit}
                      disabled={rangeStart > rangeEnd}
                    >
                      편집하기 ({Math.max(0, rangeEnd - rangeStart + 1)}개 선택)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 overflow-hidden p-4'>
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
          <div className='space-y-6'>
            {/* SubPost 메타데이터 입력 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>세션 정보</CardTitle>
                <CardDescription>
                  서브포스트로 저장될 세션의 기본 정보를 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <Label htmlFor='session-id' className='text-sm font-medium'>
                      세션 ID
                    </Label>
                    <Input
                      id='session-id'
                      value={subPostMeta.id}
                      onChange={e =>
                        setSubPostMeta(prev => ({
                          ...prev,
                          id: e.target.value,
                        }))
                      }
                      placeholder='session_01'
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='session-title'
                      className='text-sm font-medium'
                    >
                      세션 제목
                    </Label>
                    <Input
                      id='session-title'
                      value={subPostMeta.title}
                      onChange={e =>
                        setSubPostMeta(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder='1회차: 모험의 시작'
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='session-desc'
                      className='text-sm font-medium'
                    >
                      세션 설명
                    </Label>
                    <Input
                      id='session-desc'
                      value={subPostMeta.description}
                      onChange={e =>
                        setSubPostMeta(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder='세션 요약 설명'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div
              className={`flex gap-6 h-[calc(100vh-360px)] ${showSidebar ? 'grid-cols-3' : 'grid-cols-1'}`}
            >
              {/* 메인 편집 영역 */}
              <div
                className={`${showSidebar ? 'flex-1' : 'w-full'} flex flex-col`}
              >
                <Card className='flex-1 flex flex-col'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle className='text-lg'>로그 편집기</CardTitle>
                        <CardDescription>
                          선택한 {editingEntries.length}개의 로그를 편집합니다.
                          각 항목을 클릭하여 편집하거나 + 버튼으로 새 항목을
                          추가하세요.
                        </CardDescription>
                      </div>
                      <div className='flex items-center gap-6'>
                        <div className='flex items-center gap-2'>
                          <Label
                            htmlFor='ooc-toggle-edit'
                            className='text-sm font-medium'
                          >
                            사담
                          </Label>
                          <Switch
                            id='ooc-toggle-edit'
                            checked={showOOC}
                            onCheckedChange={setShowOOC}
                          />
                        </div>
                        <div className='flex items-center gap-2'>
                          <Label
                            htmlFor='raw-json-toggle'
                            className='text-sm font-medium'
                          >
                            JSON
                          </Label>
                          <Switch
                            id='raw-json-toggle'
                            checked={showRawJson}
                            onCheckedChange={setShowRawJson}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='flex-1 overflow-hidden p-4'>
                    {showRawJson ? (
                      <div className='h-full flex flex-col'>
                        <div className='flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto'>
                          <pre className='text-xs font-mono whitespace-pre-wrap'>
                            {JSON.stringify(
                              {
                                id: subPostMeta.id || `session_${Date.now()}`,
                                title: subPostMeta.title || '편집된 TRPG 로그',
                                description:
                                  subPostMeta.description ||
                                  '편집기에서 생성된 로그 세션',
                                content: editingEntries,
                              },
                              null,
                              2
                            )}
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
                <div className='w-80 flex flex-col'>
                  <LogEntryForm
                    onSubmit={handleAddEntry}
                    onCancel={handleCancelAddEntry}
                    existingEntries={editingEntries}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
