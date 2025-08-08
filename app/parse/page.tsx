'use client';

import {
  Download,
  Upload,
  Code,
  FileText,
  Settings,
  User,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

import { ScriptLogViewer, LogEntry } from '@/components/script-log-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface ParsedMessage {
  time: string;
  sender: string;
  content: string;
  type?: string;
}

interface SenderMapping {
  sender: string;
  type: string;
  count: number;
  imageFile?: string;
  avatarUrl?: string;
  expanded?: boolean;
  displayName?: string; // 수정 가능한 표시명
  whisperFrom?: string; // 귓속말 발신자
  whisperTo?: string; // 귓속말 수신자
  markedForDeletion?: boolean; // 삭제 표시
}

const messageTypes = [
  { value: 'character', label: '캐릭터' },
  { value: 'system', label: '시스템' },
  { value: 'ooc', label: 'OOC' },
  { value: 'whisper', label: '귓속말' },
  { value: 'delete', label: '삭제' },
];

export default function ParsePage() {
  const [rawData, setRawData] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [senderMappings, setSenderMappings] = useState<SenderMapping[]>([]);
  const [currentTab, setCurrentTab] = useState('script');

  const originalScript = `// Roll20 메시지 파싱 개선 버전
const messages = Array.from(document.querySelectorAll('.message'));

const parsed = messages.map((msg, index) => {
    // 기본 정보 추출
    const messageId = msg.getAttribute('data-messageid') || '';
    const messageClasses = msg.className;
    const isWhisper = messageClasses.includes('whisper');
    const isGeneral = messageClasses.includes('general');
    
    // 발신자 정보 추출
    const byElement = msg.querySelector('.by');
    let sender = 'SYSTEM';
    let actualSender = '';
    
    if (byElement) {
        sender = byElement.innerText.trim().replace(':', '');
        
        // 귓속말의 경우 실제 발신자 찾기
        if (isWhisper) {
            // (To GM): 플레이어가 GM에게 보내는 귓속말
            if (sender.startsWith('(To ') && sender.includes('GM')) {
                // 아바타가 있으면 해당 플레이어, 없으면 현재 플레이어
                const avatarImg = msg.querySelector('.avatar img');
                if (avatarImg && avatarImg.src && !avatarImg.src.includes('$0')) {
                    actualSender = 'Player'; // 실제 플레이어명을 찾을 수 있다면 여기서 처리
                } else {
                    actualSender = 'Player';
                }
            }
            // (From 발신자): GM이나 다른 플레이어가 보내는 귓속말
            else if (sender.startsWith('(From ') && sender.endsWith(')')) {
                actualSender = sender.replace('(From ', '').replace(')', '').replace(':', '').trim();
            }
            // 일반적인 귓속말
            else {
                actualSender = sender.replace(/[()]/g, '').trim();
            }
        } else {
            actualSender = sender;
        }
    }
    
    // desc 클래스는 항상 시스템 메시지로 처리
    if (messageClasses.includes('desc')) {
        actualSender = 'SYSTEM';
    }
    
    // 시간 정보 추출
    const tstampElement = msg.querySelector('.tstamp');
    const time = tstampElement ? tstampElement.innerText.trim() : '';
    
    // 내용 추출 - 더 정교한 방식
    let content = '';
    
    // 1. 직접 텍스트 노드에서 추출
    const clonedMsg = msg.cloneNode(true);
    
    // spacer, avatar, tstamp, by 요소 제거
    const elementsToRemove = clonedMsg.querySelectorAll('.spacer, .avatar, .tstamp, .by');
    elementsToRemove.forEach(el => el.remove());
    
    // 남은 텍스트 추출
    content = clonedMsg.innerText.trim();
    
    // 2. 만약 내용이 비어있다면 다른 방법으로 시도
    if (!content) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            msg,
            NodeFilter.SHOW_TEXT,
            (node) => {
                const parent = node.parentElement;
                return !parent.classList.contains('spacer') && 
                       !parent.classList.contains('tstamp') && 
                       !parent.classList.contains('by') &&
                       node.textContent.trim() !== '';
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node.textContent.trim());
        }
        
        content = textNodes.join(' ').trim();
    }
    
    // 아바타 이미지 URL 추출
    const avatarImg = msg.querySelector('.avatar img');
    let avatarUrl = '';
    
    if (avatarImg) {
        avatarUrl = avatarImg.src;
        // 상대 경로를 절대 경로로 변환
        if (avatarUrl.startsWith('/')) {
            avatarUrl = window.location.origin + avatarUrl;
        }
    }
    
    // 발신자명이 content에 포함되어 있다면 제거
    if (content.startsWith(actualSender + ':')) {
        content = content.substring((actualSender + ':').length).trim();
    }
    
    return {
        id: index + 1,
        messageId: messageId,
        time: time,
        sender: actualSender,
        originalSender: sender, // 원본 발신자 정보도 보존
        content: content,
        messageType: messageClasses,
        isWhisper: isWhisper,
        isGeneral: isGeneral,
        avatarUrl: avatarUrl,
        rawHTML: msg.outerHTML
    };
});

// 빈 내용이나 중복 제거
const filteredParsed = parsed.filter(msg => 
    msg.content && 
    msg.content.length > 0 && 
    msg.sender !== ''
);

console.log('파싱된 메시지:', filteredParsed);
console.log('총 메시지 수:', filteredParsed.length);
console.log('발신자 목록:', [...new Set(filteredParsed.map(m => m.sender))]);

const blob = new Blob([JSON.stringify(filteredParsed, null, 2)], { type: "application/json" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "roll20_chatlog_enhanced.json";
link.click();`;

  const parseLogData = async () => {
    if (!rawData.trim()) {
      alert('데이터를 입력해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      const parsed = JSON.parse(rawData);

      if (Array.isArray(parsed)) {
        const validMessages = parsed.filter(
          item =>
            item &&
            typeof item === 'object' &&
            'time' in item &&
            'sender' in item &&
            'content' in item
        );

        setParsedData(validMessages);

        // sender별 통계 및 아바타 정보 생성 - 개선된 데이터 구조 대응
        const senderStats: {
          [key: string]: { count: number; avatarUrl?: string };
        } = {};
        validMessages.forEach(msg => {
          let sender = msg.sender || 'SYSTEM';

          // 빈 발신자나 특수 케이스 처리
          if (!sender || sender === '' || sender === 'SYSTEM') {
            sender = 'SYSTEM';
          }

          // 이상한 HTML 링크나 URL 패턴 제거
          if (
            sender.includes('http') ||
            sender.includes('www.') ||
            sender.includes('.com')
          ) {
            return; // HTML 링크가 발신자로 잘못 인식된 경우 제외
          }

          // 너무 긴 발신자명도 제외 (보통 HTML이나 오류)
          if (sender.length > 50) {
            return;
          }

          // 귓속말 처리 - 이제 정상적으로 포함
          if ((msg as any).isWhisper) {
            // 귓속말의 발신자가 괄호로 시작하면 제외
            if (sender.startsWith('(') && sender.endsWith(')')) {
              return;
            }
          }

          // desc 메시지는 무조건 SYSTEM으로 처리
          if (
            (msg as any).messageType &&
            (msg as any).messageType.includes('desc')
          ) {
            sender = 'SYSTEM';
          }

          if (!senderStats[sender]) {
            senderStats[sender] = {
              count: 0,
              avatarUrl: (msg as any).avatarUrl || '',
            };
          }
          senderStats[sender].count += 1;

          // 더 좋은 아바타 URL로 업데이트 ($0는 빈 아바타이므로 제외)
          const msgAvatarUrl = (msg as any).avatarUrl || '';
          if (
            msgAvatarUrl &&
            !msgAvatarUrl.includes('$0') &&
            msgAvatarUrl.length > (senderStats[sender].avatarUrl || '').length
          ) {
            senderStats[sender].avatarUrl = msgAvatarUrl;
          }
        });

        const mappings: SenderMapping[] = Object.entries(senderStats)
          .map(([sender, data]) => {
            // 아바타 URL에서 파일명 추출하여 imageFile로 설정
            let imageFile = '';
            if (data.avatarUrl) {
              try {
                const url = new URL(data.avatarUrl);
                const pathname = url.pathname;

                // d20.io 이미지 URL의 경우 특별 처리
                if (
                  url.hostname.includes('d20.io') ||
                  url.hostname.includes('files.d20.io')
                ) {
                  const parts = pathname.split('/');
                  const filename =
                    parts[parts.length - 2] || parts[parts.length - 1]; // 마지막 또는 그 전 부분
                  if (filename && filename.length > 5) {
                    imageFile = `${sender.replace(/\s+/g, '_')}_${filename.substring(0, 8)}.png`;
                  }
                } else if (pathname.includes('/users/avatar/')) {
                  // Roll20 내장 아바타의 경우
                  const avatarId = pathname.split('/').pop();
                  if (avatarId) {
                    imageFile = `${sender.replace(/\s+/g, '_')}_avatar_${avatarId}.png`;
                  }
                } else {
                  // 일반적인 이미지 파일
                  const filename = pathname.split('/').pop();
                  if (
                    filename &&
                    (filename.includes('.png') ||
                      filename.includes('.jpg') ||
                      filename.includes('.jpeg') ||
                      filename.includes('.gif') ||
                      filename.includes('.webp'))
                  ) {
                    imageFile = filename;
                  } else if (filename) {
                    imageFile = `${filename}.png`;
                  }
                }
              } catch (e) {
                // URL 파싱 실패시 발신자명 기반으로 생성
                imageFile = `${sender.replace(/\s+/g, '_')}.png`;
              }
            }

            return {
              sender,
              type: 'character', // 기본값
              count: data.count,
              avatarUrl: data.avatarUrl,
              imageFile: imageFile,
            };
          })
          .sort((a, b) => b.count - a.count);

        setSenderMappings(mappings);
        setCurrentTab('mapping');
      } else {
        throw new Error('올바른 배열 형태가 아닙니다.');
      }
    } catch (error) {
      alert('JSON 파싱에 실패했습니다. 올바른 형태의 데이터인지 확인해주세요.');
      console.error('Parsing error:', error);
    }

    setIsProcessing(false);
  };

  const updateSenderType = (sender: string, type: string) => {
    if (type === 'delete') {
      setSenderMappings(prev =>
        prev.map(mapping =>
          mapping.sender === sender ? { ...mapping, markedForDeletion: true } : mapping
        )
      );
    } else {
      setSenderMappings(prev =>
        prev.map(mapping =>
          mapping.sender === sender ? { ...mapping, type, markedForDeletion: false } : mapping
        )
      );
    }
  };

  const updateSenderImage = (sender: string, imageFile: string) => {
    setSenderMappings(prev =>
      prev.map(mapping =>
        mapping.sender === sender ? { ...mapping, imageFile } : mapping
      )
    );
  };

  const updateDisplayName = (sender: string, displayName: string) => {
    setSenderMappings(prev =>
      prev.map(mapping =>
        mapping.sender === sender ? { ...mapping, displayName } : mapping
      )
    );
  };

  const updateWhisperInfo = (sender: string, whisperFrom: string, whisperTo: string) => {
    setSenderMappings(prev =>
      prev.map(mapping =>
        mapping.sender === sender ? { ...mapping, whisperFrom, whisperTo } : mapping
      )
    );
  };

  const toggleSenderExpanded = (sender: string) => {
    setSenderMappings(prev =>
      prev.map(mapping =>
        mapping.sender === sender
          ? { ...mapping, expanded: !mapping.expanded }
          : mapping
      )
    );
  };

  const getSenderMessages = (sender: string, limit: number = 5) => {
    return parsedData
      .filter(msg => {
        const msgSender = msg.sender || 'SYSTEM';
        return msgSender === sender;
      })
      .slice(0, limit);
  };

  const applyMappings = () => {
    const filteredMappings = senderMappings.filter(m => !m.markedForDeletion);
    const mappingDict = filteredMappings.reduce(
      (acc, mapping) => {
        acc[mapping.sender] = {
          type: mapping.type,
          displayName: mapping.displayName || mapping.sender,
          whisperFrom: mapping.whisperFrom,
          whisperTo: mapping.whisperTo,
        };
        return acc;
      },
      {} as { [key: string]: any }
    );

    const enhancedData = parsedData
      .filter(message => {
        const mapping = senderMappings.find(m => m.sender === message.sender);
        return !mapping?.markedForDeletion;
      })
      .map(message => {
        let sender = message.sender || 'SYSTEM';
        const mapping = mappingDict[sender];

        // desc 메시지는 무조건 SYSTEM으로
        if (
          (message as any).messageType &&
          (message as any).messageType.includes('desc')
        ) {
          sender = 'SYSTEM';
        }

        // 귓속말 처리
        if (mapping?.type === 'whisper') {
          return {
            ...message,
            sender: mapping.displayName || sender,
            type: 'whisper',
            whisperFrom: mapping.whisperFrom,
            whisperTo: mapping.whisperTo,
          };
        }

        return {
          ...message,
          sender: mapping?.displayName || sender,
          type: mapping?.type || 'system',
        };
      });

    setParsedData(enhancedData);
    setCurrentTab('result');
  };

  // ParsedMessage를 LogEntry로 변환
  const convertToLogEntries = (): LogEntry[] => {
    return parsedData.map((message, index) => {
      const logEntry = {
        type:
          message.type === 'character'
            ? 'character'
            : message.type === 'system'
              ? 'system'
              : 'ooc',
        character: message.type === 'system' ? undefined : message.sender,
        content: message.content,
      } as LogEntry;

      return logEntry;
    });
  };

  // 기본 캐릭터 설정 (파싱된 데이터에서 추출)
  const getCharactersFromData = () => {
    const characterSenders = senderMappings
      .filter(mapping => mapping.type === 'character')
      .map(mapping => {
        // 아바타 URL 결정 - 원본 URL 우선, 없으면 assets 폴더, 마지막으로 기본값
        let thumbnailUrl = '/placeholder-user.jpg';

        // 1순위: 원본 아바타 URL (실제 존재하는 이미지)
        if (
          mapping.avatarUrl &&
          !mapping.avatarUrl.includes('$0') &&
          mapping.avatarUrl.trim() !== ''
        ) {
          thumbnailUrl = mapping.avatarUrl;
        }
        // 2순위: assets 폴더의 파일 (실제로 업로드된 경우에만)
        else if (mapping.imageFile && mapping.imageFile.trim() !== '') {
          thumbnailUrl = `/assets/${mapping.imageFile}`;
        }

        const character = {
          name: mapping.sender,
          player: '플레이어',
          class: '모험가',
          description: `${mapping.count}개의 메시지`,
          thumbnail: thumbnailUrl,
        };

        console.log('Character created:', character);
        return character;
      });

    console.log('All characters:', characterSenders);
    return characterSenders;
  };

  const defaultReadingSettings = {
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2,
    centerSystemMessages: false,
  };

  const saveMappingPreset = () => {
    const preset = {
      name:
        prompt('매핑 프리셋 이름을 입력하세요:') ||
        `프리셋_${new Date().toLocaleDateString()}`,
      mappings: senderMappings,
      createdAt: new Date().toISOString(),
    };

    const existingPresets = JSON.parse(
      localStorage.getItem('trpg_mapping_presets') || '[]'
    );
    existingPresets.push(preset);
    localStorage.setItem(
      'trpg_mapping_presets',
      JSON.stringify(existingPresets)
    );

    alert('매핑 프리셋이 저장되었습니다!');
  };

  const loadMappingPreset = () => {
    const existingPresets = JSON.parse(
      localStorage.getItem('trpg_mapping_presets') || '[]'
    );

    if (existingPresets.length === 0) {
      alert('저장된 프리셋이 없습니다.');
      return;
    }

    const presetNames = existingPresets
      .map(
        (preset: any, index: number) =>
          `${index + 1}. ${preset.name} (${new Date(preset.createdAt).toLocaleDateString()})`
      )
      .join('\n');

    const selection = prompt(
      `불러올 프리셋을 선택하세요 (번호 입력):\n${presetNames}`
    );
    const selectedIndex = parseInt(selection || '0') - 1;

    if (selectedIndex >= 0 && selectedIndex < existingPresets.length) {
      const selectedPreset = existingPresets[selectedIndex];

      // 현재 sender 목록과 매칭하여 적용
      const newMappings = senderMappings.map(current => {
        const presetMapping = selectedPreset.mappings.find(
          (preset: any) => preset.sender === current.sender
        );
        return presetMapping
          ? { ...current, type: presetMapping.type }
          : current;
      });

      setSenderMappings(newMappings);
      alert('매핑 프리셋이 적용되었습니다!');
    }
  };

  const downloadParsedData = () => {
    if (parsedData.length === 0) {
      alert('파싱된 데이터가 없습니다.');
      return;
    }

    const blob = new Blob([JSON.stringify(parsedData, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'trpg_chatlog_parsed.json';
    link.click();
  };

  const copyScriptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(originalScript);
      alert('스크립트가 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setRawData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className='container mx-auto p-6 max-w-6xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>TRPG 채팅 로그 파서</h1>
        <p className='text-muted-foreground'>
          Roll20이나 다른 플랫폼에서 추출한 채팅 로그를 분석하고 JSON 형태로
          변환합니다.
        </p>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='script' className='flex items-center gap-2'>
            <Code className='h-4 w-4' />
            원본 스크립트
          </TabsTrigger>
          <TabsTrigger value='parse' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            로그 파싱
          </TabsTrigger>
          <TabsTrigger
            value='mapping'
            className='flex items-center gap-2'
            disabled={senderMappings.length === 0}
          >
            <Settings className='h-4 w-4' />
            타입 매핑
          </TabsTrigger>
          <TabsTrigger
            value='result'
            className='flex items-center gap-2'
            disabled={parsedData.length === 0}
          >
            <Download className='h-4 w-4' />
            결과 확인
          </TabsTrigger>
        </TabsList>

        <TabsContent value='script'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Code className='h-5 w-5' />
                브라우저 콘솔 스크립트
              </CardTitle>
              <CardDescription>
                Roll20 웹페이지에서 개발자 도구 콘솔에 붙여넣어 실행하는
                스크립트입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='relative'>
                <pre className='bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono'>
                  <code>{originalScript}</code>
                </pre>
                <Button
                  onClick={copyScriptToClipboard}
                  className='absolute top-2 right-2'
                  size='sm'
                >
                  복사
                </Button>
              </div>
              <div className='p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <h4 className='font-medium mb-2'>사용 방법:</h4>
                <ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
                  <li>
                    Roll20 세션 페이지에서 F12를 눌러 개발자 도구를 엽니다
                  </li>
                  <li>Console 탭으로 이동합니다</li>
                  <li>위 스크립트를 복사해서 붙여넣고 Enter를 누릅니다</li>
                  <li>자동으로 개선된 JSON 파일이 다운로드됩니다</li>
                </ol>
                <div className='mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800'>
                  <p className='text-xs text-amber-700 dark:text-amber-300'>
                    <strong>개선사항:</strong> DOM 구조를 정확히 분석하여
                    메시지를 추출하고, 아바타 이미지를 자동으로 수집하며,
                    귓속말과 일반 메시지를 구분합니다.
                  </p>
                </div>
                <div className='mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800'>
                  <p className='text-xs text-green-700 dark:text-green-300'>
                    <strong>디버깅:</strong> 콘솔에서 발신자 목록과 메시지 수를
                    확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='parse'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Upload className='h-5 w-5' />
                로그 데이터 업로드 및 파싱
              </CardTitle>
              <CardDescription>
                브라우저에서 추출한 JSON 데이터를 여기에 붙여넣거나 파일로
                업로드하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Button
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                  variant='outline'
                  className='flex items-center gap-2'
                >
                  <Upload className='h-4 w-4' />
                  파일 업로드
                </Button>
                <input
                  id='file-upload'
                  type='file'
                  accept='.json,.txt'
                  onChange={handleFileUpload}
                  className='hidden'
                />
                <Button
                  onClick={parseLogData}
                  disabled={isProcessing || !rawData.trim()}
                  className='flex items-center gap-2'
                >
                  {isProcessing ? '처리 중...' : '파싱 실행'}
                </Button>
              </div>

              <Textarea
                placeholder='JSON 형태의 로그 데이터를 여기에 붙여넣으세요...'
                value={rawData}
                onChange={e => setRawData(e.target.value)}
                className='min-h-[300px] font-mono text-sm'
              />

              {rawData && (
                <div className='text-sm text-muted-foreground'>
                  입력된 데이터: {rawData.length.toLocaleString()} 문자
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='mapping'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                발신자 타입 매핑
              </CardTitle>
              <CardDescription>
                각 발신자의 메시지 타입을 설정하세요. 메시지 개수순으로 정렬되어
                있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {senderMappings.length > 0 && (
                <>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-muted-foreground'>
                      총 {senderMappings.length}명의 발신자
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        onClick={loadMappingPreset}
                        variant='outline'
                        size='sm'
                      >
                        불러오기
                      </Button>
                      <Button
                        onClick={saveMappingPreset}
                        variant='outline'
                        size='sm'
                      >
                        저장하기
                      </Button>
                      <Button
                        onClick={applyMappings}
                        className='flex items-center gap-2'
                      >
                        <MessageSquare className='h-4 w-4' />
                        매핑 적용하여 결과 보기
                      </Button>
                    </div>
                  </div>

                  <div className='grid gap-3'>
                    {senderMappings.map(mapping => (
                      <div key={mapping.sender} className={`border rounded-lg ${mapping.markedForDeletion ? 'opacity-50 bg-red-50 border-red-200' : ''}`}>
                        <div className='flex items-start gap-3 p-3'>
                          <div className='flex items-center gap-3 flex-1'>
                            {/* 아바타 미리보기 */}
                            {!mapping.avatarUrl ||
                            mapping?.avatarUrl?.startsWith(
                              'https://app.roll20.net'
                            ) ? (
                              <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium'>
                                {mapping.sender.charAt(0)}
                              </div>
                            ) : (
                              <img
                                src={mapping.avatarUrl}
                                alt={mapping.sender}
                                className='w-10 h-10 rounded-full object-cover border'
                                onError={e => {
                                  (e.target as HTMLImageElement).style.display =
                                    'none';
                                }}
                              />
                            )}

                            <div className='flex-1'>
                              <div className='font-medium flex items-center gap-2 mb-1'>
                                {mapping.sender}
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  className='h-6 w-6 p-0'
                                  onClick={() =>
                                    toggleSenderExpanded(mapping.sender)
                                  }
                                >
                                  {mapping.expanded ? (
                                    <ChevronDown className='h-3 w-3' />
                                  ) : (
                                    <ChevronRight className='h-3 w-3' />
                                  )}
                                </Button>
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {mapping.count}개의 메시지
                              </div>
                            </div>
                          </div>

                          <div className='flex flex-col gap-2'>
                            <Select
                              value={mapping.markedForDeletion ? 'delete' : mapping.type}
                              onValueChange={value =>
                                updateSenderType(mapping.sender, value)
                              }
                            >
                              <SelectTrigger className='w-48'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {messageTypes.map(type => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                    className={type.value === 'delete' ? 'text-red-600' : ''}
                                  >
                                    <div className='flex items-center gap-2'>
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {!mapping.markedForDeletion && (
                              <>
                                <div className='flex flex-col gap-1'>
                                  <Label className='text-xs text-muted-foreground'>
                                    표시 이름
                                  </Label>
                                  <Input
                                    placeholder={mapping.sender}
                                    value={mapping.displayName || ''}
                                    onChange={e =>
                                      updateDisplayName(
                                        mapping.sender,
                                        e.target.value
                                      )
                                    }
                                    className='w-48 text-sm'
                                  />
                                </div>

                                {mapping.type === 'whisper' && (
                                  <>
                                    <div className='flex flex-col gap-1'>
                                      <Label className='text-xs text-muted-foreground'>
                                        발신자
                                      </Label>
                                      <Input
                                        placeholder='누가 보냈나요?'
                                        value={mapping.whisperFrom || ''}
                                        onChange={e =>
                                          updateWhisperInfo(
                                            mapping.sender,
                                            e.target.value,
                                            mapping.whisperTo || ''
                                          )
                                        }
                                        className='w-48 text-sm'
                                      />
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                      <Label className='text-xs text-muted-foreground'>
                                        수신자
                                      </Label>
                                      <Input
                                        placeholder='누구에게 보냈나요?'
                                        value={mapping.whisperTo || ''}
                                        onChange={e =>
                                          updateWhisperInfo(
                                            mapping.sender,
                                            mapping.whisperFrom || '',
                                            e.target.value
                                          )
                                        }
                                        className='w-48 text-sm'
                                      />
                                    </div>
                                  </>
                                )}

                                {mapping.type === 'character' && (
                                  <div className='flex flex-col gap-1'>
                                    <Label className='text-xs text-muted-foreground'>
                                      이미지 파일명
                                    </Label>
                                    <Input
                                      placeholder='character-name.png'
                                      value={mapping.imageFile || ''}
                                      onChange={e =>
                                        updateSenderImage(
                                          mapping.sender,
                                          e.target.value
                                        )
                                      }
                                      className='w-48 text-sm'
                                    />
                                    <div className='text-xs text-muted-foreground'>
                                      public/assets/ 폴더 기준
                                    </div>
                                    {mapping.avatarUrl && (
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='text-xs h-6 px-2 justify-start'
                                        onClick={() => {
                                          if (mapping.avatarUrl) {
                                            navigator.clipboard.writeText(
                                              mapping.avatarUrl
                                            );
                                            alert('원본 URL이 복사되었습니다!');
                                          }
                                        }}
                                      >
                                        원본 URL 복사
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* 메시지 미리보기 */}
                        {mapping.expanded && (
                          <div className='border-t bg-gray-50 dark:bg-gray-900/20 p-3'>
                            <div className='text-sm font-medium mb-2'>
                              메시지 미리보기:
                            </div>
                            <div className='space-y-2 max-h-48 overflow-y-auto'>
                              {getSenderMessages(mapping.sender, 5).map(
                                (msg, msgIndex) => (
                                  <div
                                    key={msgIndex}
                                    className='p-2 bg-white dark:bg-gray-800 rounded text-xs'
                                  >
                                    <div className='text-muted-foreground mb-1'>
                                      {(msg as any).time || '시간 없음'}
                                    </div>
                                    <div className='truncate'>
                                      {(msg.content || '내용 없음').substring(
                                        0,
                                        100
                                      )}
                                      {(msg.content?.length || 0) > 100
                                        ? '...'
                                        : ''}
                                    </div>
                                  </div>
                                )
                              )}
                              {getSenderMessages(mapping.sender).length ===
                                0 && (
                                <div className='text-muted-foreground text-xs'>
                                  메시지를 찾을 수 없습니다.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='result'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                파싱 결과 - 스크립트 뷰어
              </CardTitle>
              <CardDescription>
                파싱된 메시지들을 스크립트 형태로 확인하고 JSON으로 다운로드할
                수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {parsedData.length > 0 ? (
                <>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary'>
                        총 {parsedData.length}개의 메시지
                      </Badge>
                      <Badge variant='outline'>
                        {
                          senderMappings.filter(m => m.type === 'character')
                            .length
                        }
                        명의 캐릭터
                      </Badge>
                    </div>
                    <Button
                      onClick={downloadParsedData}
                      className='flex items-center gap-2'
                    >
                      <Download className='h-4 w-4' />
                      JSON 다운로드
                    </Button>
                  </div>

                  <div className='space-y-4'>
                    {/* 디버깅 정보 */}
                    <div className='p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs'>
                      <div className='font-medium mb-2'>디버깅 정보:</div>
                      <div className='space-y-1'>
                        <div>캐릭터 수: {getCharactersFromData().length}</div>
                        <div>
                          로그 엔트리 수: {convertToLogEntries().length}
                        </div>
                        <div className='max-h-32 overflow-y-auto'>
                          <strong>캐릭터 목록:</strong>
                          {getCharactersFromData().map(char => {
                            const mapping = senderMappings.find(
                              m => m.sender === char.name
                            );
                            return (
                              <div key={char.name} className='ml-2 text-xs'>
                                <div>
                                  <strong>{char.name}</strong>
                                </div>
                                <div>사용중: {char.thumbnail}</div>
                                <div>원본: {mapping?.avatarUrl || '없음'}</div>
                                <div>파일: {mapping?.imageFile || '없음'}</div>
                                <br />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className='border rounded-lg p-4'>
                      <ScriptLogViewer
                        entries={convertToLogEntries()}
                        characters={getCharactersFromData()}
                        settings={defaultReadingSettings}
                        entriesPerPage={50}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className='text-center py-12 text-muted-foreground'>
                  파싱된 데이터가 없습니다. 먼저 로그 데이터를 파싱해주세요.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
