'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { ParsedMessage, SenderMapping } from '@/types';
import { Stepper } from '@/components/ui/steps';
import { ScriptStep } from '@/components/parse/script-step';
import { ParseStep } from '@/components/parse/parse-step';
import { MappingStep } from '@/components/parse/mapping-step';

export default function ParsePage() {
  const [rawData, setRawData] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [senderMappings, setSenderMappings] = useState<SenderMapping[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const getSteps = () => [
    {
      id: 'script',
      title: '스크립트 복사',
      description: '브라우저에서 실행',
      status:
        currentStep === 0
          ? 'current'
          : currentStep > 0
            ? 'completed'
            : 'pending',
    },
    {
      id: 'parse',
      title: '데이터 파싱',
      description: 'JSON 분석',
      status:
        currentStep === 1
          ? 'current'
          : currentStep > 1
            ? 'completed'
            : 'pending',
    },
    {
      id: 'mapping',
      title: '타입 매핑',
      description: '발신자 설정',
      status:
        currentStep === 2
          ? 'current'
          : currentStep > 2
            ? 'completed'
            : 'pending',
    },
  ];

  const originalScript = `// Roll20 메시지 파싱 정리 버전
const messages = Array.from(document.querySelectorAll('.message'));

const parsed = messages.map((msg) => {
    // 기본 정보 추출
    const messageId = msg.getAttribute('data-messageid') || '';
    const messageClasses = msg.className;
    const isWhisper = messageClasses.includes('whisper');
    
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
    
    // 아바타 이미지 URL 추출 (OOC 판단용)
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
        messageId: messageId,
        time: time,
        sender: actualSender,
        content: content,
        messageType: messageClasses,
        isWhisper: isWhisper,
        avatarUrl: avatarUrl
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

        // 디버깅: 파싱된 데이터 확인
        console.log('파싱된 메시지 샘플:', validMessages.slice(0, 3));
        console.log(
          'OOC 메시지가 있는지 확인:',
          validMessages.some(msg => (msg as any).isOoc)
        );

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
            // isWhisper가 true인 메시지가 있는지 확인
            const whisperMessages = validMessages.filter(
              msg => msg.sender === sender && (msg as any).isWhisper
            );
            const hasWhisperMessages = whisperMessages.length > 0;

            // 아바타 URL 패턴으로 OOC 여부 판단
            const hasOocUrl =
              data.avatarUrl &&
              (data.avatarUrl.startsWith('https://app.roll20.net/users/') ||
                data.avatarUrl.includes('placeholder') ||
                data.avatarUrl.includes('default'));

            const hasOocMessages = hasOocUrl;

            // 귓속말 메시지가 있으면 기본 발신자/수신자 정보 추출
            let whisperFrom = '';
            let whisperTo = '';

            if (hasWhisperMessages && whisperMessages.length > 0) {
              // 귓속말의 경우 기본적으로 발신자와 수신자 설정
              whisperFrom = sender;
              whisperTo = 'GM'; // 기본값으로 GM에게 보내는 귓속말로 설정
            }

            // 타입 우선순위: 시스템 > OOC > 귓속말 > 캐릭터
            let messageType = 'character';
            if (sender === 'SYSTEM') {
              messageType = 'system';
              console.log(`${sender}를 system 타입으로 설정`);
            } else if (hasOocMessages) {
              messageType = 'ooc';
              console.log(`${sender}를 OOC 타입으로 설정`);
            } else if (hasWhisperMessages) {
              messageType = 'whisper';
              console.log(`${sender}를 whisper 타입으로 설정`);
            } else {
              console.log(`${sender}를 character 타입으로 설정`);
            }

            return {
              sender,
              type: messageType,
              count: data.count,
              avatarUrl: data.avatarUrl,
              whisperFrom: hasWhisperMessages ? whisperFrom : undefined,
              whisperTo: hasWhisperMessages ? whisperTo : undefined,
            };
          })
          .sort((a, b) => b.count - a.count);

        setSenderMappings(mappings);
        setCurrentStep(2);
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
          mapping.sender === sender
            ? { ...mapping, markedForDeletion: true }
            : mapping
        )
      );
    } else {
      setSenderMappings(prev =>
        prev.map(mapping =>
          mapping.sender === sender
            ? { ...mapping, type, markedForDeletion: false }
            : mapping
        )
      );
    }
  };

  const updateSenderAvatarUrl = (sender: string, avatarUrl: string) => {
    setSenderMappings(prev =>
      prev.map(mapping =>
        mapping.sender === sender ? { ...mapping, avatarUrl } : mapping
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

  const updateWhisperInfo = (
    sender: string,
    whisperFrom: string,
    whisperTo: string
  ) => {
    setSenderMappings(prev =>
      prev.map(mapping =>
        mapping.sender === sender
          ? { ...mapping, whisperFrom, whisperTo }
          : mapping
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

    const logEntries = parsedData
      .filter(message => {
        const mapping = senderMappings.find(m => m.sender === message.sender);
        return !mapping?.markedForDeletion;
      })
      .map((message, index) => {
        let sender = message.sender || 'SYSTEM';
        const mapping = mappingDict[sender];

        // desc 메시지는 무조건 SYSTEM으로
        if (
          (message as any).messageType &&
          (message as any).messageType.includes('desc')
        ) {
          sender = 'SYSTEM';
        }

        // LogEntry 형태로 변환
        const logEntry = {
          id: (message as any).messageId || `msg_${index + 1}`, // messageId 사용, 없으면 생성된 id 사용
          content: message.content,
        } as any;

        // 아바타 정보 추가
        const avatarUrl = (message as any).avatarUrl || mapping?.avatarUrl;
        if (avatarUrl && !avatarUrl.includes('$0')) {
          logEntry.avatar = avatarUrl;
        }

        // 타입별 처리
        if (mapping?.type === 'whisper') {
          logEntry.type = 'whisper';
          logEntry.character = mapping.displayName || sender;
          logEntry.target = mapping.whisperTo;
        } else if (mapping?.type === 'system' || sender === 'SYSTEM') {
          logEntry.type = 'system';
        } else if (mapping?.type === 'ooc') {
          logEntry.type = 'ooc';
          logEntry.character = mapping.displayName || sender;
        } else {
          // character 타입
          logEntry.type = 'character';
          logEntry.character = mapping?.displayName || sender;
        }

        return logEntry;
      });

    // JSON 데이터를 localStorage에 저장하고 편집 페이지로 이동
    const dataToSave = {
      parsedData: logEntries, // LogEntry 형태로 저장
      senderMappings: filteredMappings,
    };
    localStorage.setItem('trpg_editing_data', JSON.stringify(dataToSave));
    window.location.href = '/edit';
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
    <>
      <Header title='TRPG 채팅 로그 파서' showBackButton />

      <div className='container mx-auto px-4 py-6 max-w-6xl'>
        <div className='space-y-8'>
          <div className='flex justify-center'>
            <Stepper
              steps={getSteps() as any}
              currentStep={currentStep}
              onStepClick={stepIndex => {
                // 이전 단계나 현재 단계로만 이동 가능
                if (
                  stepIndex <= currentStep ||
                  (stepIndex === 1 && rawData.trim()) ||
                  (stepIndex === 2 && senderMappings.length > 0)
                ) {
                  setCurrentStep(stepIndex);
                }
              }}
              className='max-w-2xl'
            />
          </div>

          {currentStep === 0 && (
            <ScriptStep
              script={originalScript}
              onNext={() => setCurrentStep(1)}
              onCopyScript={copyScriptToClipboard}
            />
          )}

          {currentStep === 1 && (
            <ParseStep
              rawData={rawData}
              isProcessing={isProcessing}
              onDataChange={setRawData}
              onFileUpload={handleFileUpload}
              onParse={parseLogData}
            />
          )}

          {currentStep === 2 && (
            <MappingStep
              mappings={senderMappings}
              messages={parsedData}
              onUpdateSenderType={updateSenderType}
              onUpdateDisplayName={updateDisplayName}
              onUpdateSenderAvatarUrl={updateSenderAvatarUrl}
              onUpdateWhisperInfo={updateWhisperInfo}
              onToggleSenderExpanded={toggleSenderExpanded}
              onSaveMappingPreset={saveMappingPreset}
              onLoadMappingPreset={loadMappingPreset}
              onApplyMappings={applyMappings}
            />
          )}
        </div>
      </div>
    </>
  );
}
