'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RotateCcw, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { ScriptLogEditorViewer, ScriptLogEditorViewerRef } from '@/components/script-log-editor-viewer';
import { LogEntry, ParsedMessage, SenderMapping } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function EditPage() {
  const router = useRouter();
  const [jsonContent, setJsonContent] = useState('');
  const [originalJsonContent, setOriginalJsonContent] = useState('');
  const [showOOC, setShowOOC] = useState(false);
  const [isJsonValid, setIsJsonValid] = useState(false);
  const [parsedEntries, setParsedEntries] = useState<LogEntry[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);
  const viewerRef = useRef<ScriptLogEditorViewerRef>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('trpg_editing_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const jsonString = JSON.stringify(data.parsedData, null, 2);
        setJsonContent(jsonString);
        setOriginalJsonContent(jsonString);
        setHasData(true);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // JSON을 파싱하여 LogEntry로 변환
  const parseJsonToLogEntries = (jsonString: string): LogEntry[] => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid JSON format');
      }

      // 이미 LogEntry 형태인지 확인
      const firstItem = parsed[0];
      if (firstItem && 'type' in firstItem && 'content' in firstItem && 'id' in firstItem) {
        // 이미 LogEntry 형태면 그대로 반환
        return parsed as LogEntry[];
      }

      // 기존 ParsedMessage 형태라면 변환
      return parsed.map((message: ParsedMessage, index: number) => {
        const logEntry = {
          id: index + 1,
          type: message.type === 'character' ? 'character' : 
                message.type === 'system' ? 'system' : 
                message.type === 'whisper' ? 'whisper' :
                'ooc',
          character: message.type === 'system' ? undefined : message.sender,
          content: message.content,
          ...(message.type === 'whisper' && {
            target: (message as any).whisperTo
          })
        } as LogEntry;

        return logEntry;
      });
    } catch (error) {
      throw error;
    }
  };

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

  // JSON 파싱 함수
  const parseJsonContent = (content: string) => {
    if (!content.trim()) {
      setIsJsonValid(false);
      setParsedEntries([]);
      setCharacters([]);
      return;
    }

    try {
      const entries = parseJsonToLogEntries(content);
      const chars = generateCharacters(entries);
      
      setParsedEntries(entries);
      setCharacters(chars);
      setIsJsonValid(true);
    } catch (error) {
      setIsJsonValid(false);
      setParsedEntries([]);
      setCharacters([]);
    }
  };

  // JSON 변경시 onBlur로 파싱 (성능 최적화)
  const handleJsonBlur = () => {
    parseJsonContent(jsonContent);
  };

  // 초기 로드시에만 파싱
  useEffect(() => {
    if (jsonContent && hasData) {
      parseJsonContent(jsonContent);
    }
  }, [hasData]);

  const handleReset = () => {
    setJsonContent(originalJsonContent);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonContent(content);
      setOriginalJsonContent(content);
      setHasData(true);
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    setJsonContent('');
    setOriginalJsonContent('');
    setHasData(false);
    localStorage.removeItem('trpg_editing_data');
  };

  const handleDownload = () => {
    if (!isJsonValid || !jsonContent.trim()) {
      alert('유효한 JSON 데이터가 없습니다.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonContent);
      const blob = new Blob([JSON.stringify(parsed, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `trpg_chatlog_edited_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      alert('JSON 다운로드 중 오류가 발생했습니다.');
    }
  };

  const defaultReadingSettings = {
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2,
    centerSystemMessages: false,
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
                JSON 파일을 업로드하거나 직접 입력하여 TRPG 로그를 편집하고 미리보기할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/parse')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                파서로 돌아가기
              </Button>
              {hasData && (
                <>
                  <Button onClick={handleReset} variant="outline" disabled={!originalJsonContent}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    원본으로 복원
                  </Button>
                  <Button onClick={clearData} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    새로 시작
                  </Button>
                </>
              )}
              <Button 
                onClick={handleDownload} 
                disabled={!isJsonValid}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                완성된 JSON 다운로드
              </Button>
            </div>
          </div>
        </div>

        {!hasData && !jsonContent ? (
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
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  직접 입력
                </CardTitle>
                <CardDescription>
                  JSON 데이터를 직접 붙여넣어 편집을 시작하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => {
                    setJsonContent('[\n  {\n    "id": 1,\n    "content": "예시 메시지",\n    "sender": "플레이어",\n    "type": "character"\n  }\n]');
                    setOriginalJsonContent('[\n  {\n    "id": 1,\n    "content": "예시 메시지",\n    "sender": "플레이어",\n    "type": "character"\n  }\n]');
                    setHasData(true);
                  }}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  예시로 시작
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* 왼쪽: JSON 편집기 */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">JSON 편집기</CardTitle>
                    <CardDescription>
                      JSON 형식의 로그 데이터를 직접 편집할 수 있습니다.
                      {!isJsonValid && jsonContent.trim() && (
                        <span className="text-red-500 ml-2">⚠️ 유효하지 않은 JSON 형식입니다</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => document.getElementById('file-upload-edit')?.click()}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    파일 업로드
                  </Button>
                  <input
                    id="file-upload-edit"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <Textarea
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  onBlur={handleJsonBlur}
                  className={`font-mono text-sm h-full resize-none border-0 rounded-none ${
                    !isJsonValid && jsonContent.trim() ? 'border-red-300 bg-red-50' : ''
                  }`}
                  placeholder="JSON 데이터를 입력하거나 붙여넣으세요..."
                />
              </CardContent>
            </Card>

          {/* 오른쪽: 렌더링된 로그 */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">렌더링된 로그</CardTitle>
                  <CardDescription>
                    편집된 JSON의 실시간 미리보기
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
              {isJsonValid && parsedEntries.length > 0 ? (
                <ScriptLogEditorViewer
                  ref={viewerRef}
                  entries={parsedEntries}
                  characters={characters}
                  settings={defaultReadingSettings}
                  showOOC={showOOC}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {!isJsonValid ? (
                    <div className="text-center">
                      <h3 className="font-medium mb-2">유효하지 않은 JSON</h3>
                      <p className="text-sm">JSON 형식을 확인해주세요.</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="font-medium mb-2">로그가 없습니다</h3>
                      <p className="text-sm">JSON 데이터를 입력해주세요.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </>
  );
}