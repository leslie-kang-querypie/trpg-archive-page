import { ArrowRight, Dice6, Heart, FileText, Lock } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface LogEntry {
  type:
    | 'system'
    | 'character'
    | 'whisper'
    | 'dice'
    | 'ooc'
    | 'damage'
    | 'handout';
  character?: string;
  target?: string; // 귓속말 대상 (system도 사용 가능)
  content: string;
  // 주사위 관련 추가 정보
  diceResult?: {
    dice: string; // 예: "1d20+5"
    result: number;
    rolls: number[]; // 실제 굴린 값들
    modifier?: number;
    success?: boolean; // 성공/실패 여부
    difficulty?: number; // 목표값
  };
  // 데미지 관련 추가 정보
  damageInfo?: {
    amount: number;
    type: string; // "damage" | "heal"
    target: string;
  };
  // 핸드아웃 관련 추가 정보
  handoutInfo?: {
    title: string;
    target: string; // 받는 플레이어
    category?: string; // "배경", "사명", "비밀" 등
    isSecret?: boolean; // 비밀 핸드아웃 여부
  };
}

interface Character {
  name: string;
  player: string;
  class: string;
  description: string;
  thumbnail: string;
}

interface ReadingSettings {
  showAvatars: boolean;
  fontSize: number;
  lineSpacing: number;
  paragraphSpacing: number;
  centerSystemMessages: boolean;
}

interface ScriptLogViewerProps {
  entries: LogEntry[];
  characters: Character[];
  settings: ReadingSettings;
  entriesPerPage?: number;
}

export function ScriptLogViewer({
  entries,
  characters,
  settings,
  entriesPerPage = 20,
}: ScriptLogViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('ic');

  // 필터링된 엔트리들
  const getFilteredEntries = () => {
    switch (activeFilter) {
      case 'ic':
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
      case 'all':
        return entries;
      default:
        return entries;
    }
  };

  const filteredEntries = getFilteredEntries();
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  // 필터 변경 시 페이지 초기화
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const getCharacterInfo = (characterName: string) => {
    return characters.find(c => c.name === characterName);
  };

  // 동적 스타일 생성
  const getTextStyle = () => ({
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineSpacing,
  });

  const getParagraphSpacing = () => ({
    marginBottom: `${settings.paragraphSpacing * 0.5}rem`,
  });

  // OOC, System, Character 로그들을 연속된 그룹으로 묶는 함수
  const groupConsecutiveEntries = (entries: LogEntry[]) => {
    const grouped: (LogEntry | LogEntry[])[] = [];
    let currentGroup: LogEntry[] = [];
    let currentGroupType: string | null = null;
    let currentGroupCharacter: string | null = null;

    const finishCurrentGroup = () => {
      if (currentGroup.length > 0) {
        if (currentGroup.length === 1) {
          grouped.push(currentGroup[0]);
        } else {
          grouped.push([...currentGroup]);
        }
        currentGroup = [];
        currentGroupType = null;
        currentGroupCharacter = null;
      }
    };

    entries.forEach((entry, index) => {
      const shouldGroup = 
        entry.type === 'ooc' || 
        entry.type === 'system' || 
        entry.type === 'character';

      if (shouldGroup) {
        const isSameGroup = 
          currentGroupType === entry.type &&
          (entry.type !== 'character' || currentGroupCharacter === entry.character);

        if (isSameGroup) {
          // 같은 그룹이면 추가
          currentGroup.push(entry);
        } else {
          // 다른 그룹이면 현재 그룹 완료 후 새 그룹 시작
          finishCurrentGroup();
          currentGroup = [entry];
          currentGroupType = entry.type;
          currentGroupCharacter = entry.type === 'character' ? entry.character : null;
        }
      } else {
        // 그룹화하지 않는 타입이면 현재 그룹 완료 후 단일로 추가
        finishCurrentGroup();
        grouped.push(entry);
      }
    });

    // 마지막에 남은 그룹 처리
    finishCurrentGroup();

    return grouped;
  };

  const groupedEntries = groupConsecutiveEntries(currentEntries);

  const formatEntry = (entry: LogEntry, index: number) => {
    const key = `${entry.id}-${index}`;
    const textStyle = getTextStyle();
    const paragraphStyle = getParagraphSpacing();

    // 시스템 메시지
    if (entry.type === 'system') {
      if (entry.target) {
        // 시스템이 특정 캐릭터에게 비밀스럽게 전달하는 경우
        return (
          <div key={key} style={paragraphStyle}>
            <div className='flex gap-3'>
              {settings.showAvatars && (
                <div className='w-7 h-7 flex-shrink-0'></div>
              )}
              <div className='flex-1 min-w-0 bg-amber-50 rounded-lg px-3 py-2'>
                <div className='text-muted-foreground italic' style={textStyle}>
                  <ArrowRight className='w-3 h-3 inline mr-1' />
                  <span className='font-medium'>{entry.target}</span>
                  <span className='ml-2'>{entry.content}</span>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // 일반 시스템 메시지
        return (
          <div
            key={key}
            style={{
              ...paragraphStyle,
              marginBottom: `${settings.paragraphSpacing * 0.75}rem`,
            }}
          >
            <div 
              className={`text-muted-foreground ${
                settings.centerSystemMessages ? 'text-center' : ''
              }`} 
              style={textStyle}
            >
              {entry.content}
            </div>
          </div>
        );
      }
    }

    // 귓속말 - 아바타를 칸 안에 표시
    if (entry.type === 'whisper' && entry.character) {
      const characterInfo = getCharacterInfo(entry.character);

      return (
        <div key={key} style={paragraphStyle}>
          <div className='bg-amber-50 rounded-lg px-3 py-2 italic'>
            <div className='flex items-start gap-3'>
              {settings.showAvatars &&
                (characterInfo ? (
                  <Avatar className='w-6 h-6 flex-shrink-0'>
                    <AvatarImage
                      src={
                        characterInfo.thumbnail ||
                        '/placeholder.svg?height=40&width=40&query=character'
                      }
                      alt={entry.character}
                    />
                    <AvatarFallback className='bg-transparent border-0 text-xs'>
                      {entry.character.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className='w-6 h-6 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-xs'>
                    {entry.character.charAt(0)}
                  </div>
                ))}
              <div className='flex-1 min-w-0' style={textStyle}>
                <span className='font-bold'>{entry.character}</span>
                {entry.target && (
                  <>
                    <ArrowRight className='w-3 h-3 inline mx-1' />
                    <span className='font-medium'>{entry.target}</span>
                  </>
                )}
                <span className='ml-2'>{entry.content}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 주사위 굴리기 - 성공/실패 상태 추가
    if (entry.type === 'dice' && entry.diceResult) {
      const { dice, result, rolls, modifier, success, difficulty } =
        entry.diceResult;
      return (
        <div key={key} style={paragraphStyle}>
          <div className='flex gap-3'>
            {settings.showAvatars && (
              <div className='w-7 h-7 flex-shrink-0'></div>
            )}
            <div className='flex-1 min-w-0 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200'>
              <div
                className='flex items-center gap-2 flex-wrap'
                style={textStyle}
              >
                <Dice6 className='w-4 h-4 text-blue-600' />
                <span className='font-bold'>{entry.character}</span>
                <span>굴림:</span>
                <Badge variant='secondary' className='font-mono'>
                  {dice}
                </Badge>
                <span>=</span>
                <span className='font-mono text-sm text-muted-foreground'>
                  [{rolls.join(', ')}]{modifier ? ` + ${modifier}` : ''}
                </span>
                <span>=</span>
                <Badge variant='default' className='font-bold'>
                  {result}
                </Badge>
                {typeof success === 'boolean' && (
                  <>
                    <span>/</span>
                    <Badge
                      variant={success ? 'default' : 'destructive'}
                      className={`font-bold ${success ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                      {success ? '성공' : '실패'}
                    </Badge>
                    {difficulty && (
                      <span className='text-xs text-muted-foreground'>
                        (목표: {difficulty})
                      </span>
                    )}
                  </>
                )}
              </div>
              {entry.content && (
                <div
                  className='mt-1 text-sm text-muted-foreground'
                  style={textStyle}
                >
                  {entry.content}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // OOC (Out of Character) - 아이콘 제거
    if (entry.type === 'ooc') {
      return (
        <div key={key} style={paragraphStyle}>
          <div className='flex gap-3'>
            {settings.showAvatars && (
              <div className='w-7 h-7 flex-shrink-0'></div>
            )}
            <div className='flex-1 min-w-0 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200'>
              <div className='flex items-center gap-2' style={textStyle}>
                <span className='font-medium'>{entry.character}</span>
                <span className='text-muted-foreground'>{entry.content}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 핸드아웃 (시노비가미) - 비밀 타입 구분
    if (entry.type === 'handout' && entry.handoutInfo) {
      const { title, target, category, isSecret } = entry.handoutInfo;

      if (isSecret) {
        // 비밀 핸드아웃 - 어두운 배경, 흰색 폰트
        return (
          <div key={key} style={paragraphStyle}>
            <div className='flex gap-3'>
              {settings.showAvatars && (
                <div className='w-7 h-7 flex-shrink-0'></div>
              )}
              <div className='flex-1 min-w-0 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2' style={textStyle}>
                    <Lock className='w-4 h-4 text-gray-300' />
                    <Badge
                      variant='secondary'
                      className='bg-gray-700 text-gray-200 border-gray-600'
                    >
                      비밀 핸드아웃
                    </Badge>
                    {category && (
                      <Badge
                        variant='outline'
                        className='text-xs border-gray-600 text-gray-300'
                      >
                        {category}
                      </Badge>
                    )}
                    <ArrowRight className='w-3 h-3 text-gray-400' />
                    <span className='font-bold text-gray-100'>{target}</span>
                  </div>
                  <div className='pl-6'>
                    <div
                      className='font-medium text-gray-100 mb-1'
                      style={textStyle}
                    >
                      {title}
                    </div>
                    <div className='text-sm text-gray-200' style={textStyle}>
                      {entry.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // 일반 핸드아웃 - 흰색 배경
        return (
          <div key={key} style={paragraphStyle}>
            <div className='flex gap-3'>
              {settings.showAvatars && (
                <div className='w-7 h-7 flex-shrink-0'></div>
              )}
              <div className='flex-1 min-w-0 bg-white rounded-lg px-3 py-2 border border-gray-200'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2' style={textStyle}>
                    <FileText className='w-4 h-4 text-gray-600' />
                    <Badge
                      variant='secondary'
                      className='bg-gray-100 text-gray-800'
                    >
                      핸드아웃
                    </Badge>
                    {category && (
                      <Badge variant='outline' className='text-xs'>
                        {category}
                      </Badge>
                    )}
                    <ArrowRight className='w-3 h-3 text-muted-foreground' />
                    <span className='font-bold text-gray-800'>{target}</span>
                  </div>
                  <div className='pl-6'>
                    <div
                      className='font-medium text-gray-900 mb-1'
                      style={textStyle}
                    >
                      {title}
                    </div>
                    <div className='text-sm text-gray-700' style={textStyle}>
                      {entry.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // 데미지/힐링
    if (entry.type === 'damage' && entry.damageInfo) {
      const { amount, type, target } = entry.damageInfo;
      const isDamage = type === 'damage';
      return (
        <div key={key} style={paragraphStyle}>
          <div className='flex gap-3'>
            {settings.showAvatars && (
              <div className='w-7 h-7 flex-shrink-0'></div>
            )}
            <div
              className={`flex-1 min-w-0 rounded-lg px-3 py-2 border ${
                isDamage
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className='flex items-center gap-2' style={textStyle}>
                <Heart
                  className={`w-4 h-4 ${isDamage ? 'text-red-600' : 'text-green-600'}`}
                />
                <Badge
                  variant='secondary'
                  className={
                    isDamage
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }
                >
                  {isDamage ? '데미지' : '힐링'}
                </Badge>
                <span className='font-bold'>{target}</span>
                <span>{isDamage ? '받은 피해:' : '회복:'}</span>
                <Badge
                  variant='default'
                  className={`font-bold ${isDamage ? 'bg-red-600' : 'bg-green-600'}`}
                >
                  {amount}
                </Badge>
              </div>
              {entry.content && (
                <div
                  className='mt-1 text-sm text-muted-foreground'
                  style={textStyle}
                >
                  {entry.content}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 일반 캐릭터 대화
    if (entry.type === 'character' && entry.character) {
      const characterInfo = getCharacterInfo(entry.character);

      return (
        <div key={key} className='flex gap-3' style={paragraphStyle}>
          {/* 일반 캐릭터 - 설정에 따라 아바타 표시/숨김 */}
          {settings.showAvatars &&
            (characterInfo ? (
              <Avatar className='w-7 h-7 flex-shrink-0'>
                <AvatarImage
                  src={
                    characterInfo.thumbnail ||
                    '/placeholder.svg?height=40&width=40&query=character'
                  }
                  alt={entry.character}
                  onError={e => {
                    console.log(
                      `Avatar failed to load for ${entry.character}:`,
                      characterInfo.thumbnail
                    );
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <AvatarFallback className='bg-gray-200 text-xs font-medium'>
                  {entry.character?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            ) : (
              // NPC의 경우 기본 아바타 표시
              <div className='w-7 h-7 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700'>
                {entry.character?.charAt(0) || '?'}
              </div>
            ))}

          <div className='flex-1 min-w-0'>
            <div style={textStyle}>
              <span className='font-bold'>{entry.character}</span>
              <span className='ml-4'>{entry.content}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // OOC 그룹 처리 (연속된 OOC들을 하나의 프레임에)
  const formatOOCGroup = (oocEntries: LogEntry[], groupIndex: number) => {
    const key = `ooc-group-${groupIndex}`;
    const textStyle = getTextStyle();
    const paragraphStyle = getParagraphSpacing();

    return (
      <div key={key} style={paragraphStyle}>
        <div className='flex gap-3'>
          {settings.showAvatars && (
            <div className='w-7 h-7 flex-shrink-0'></div>
          )}
          <div className='flex-1 min-w-0 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200'>
            <div className='space-y-2'>
              {oocEntries.map((entry, index) => (
                <div
                  key={`${entry.id}-${index}`}
                  className='flex items-start gap-2'
                  style={textStyle}
                >
                  <div className='flex-1 min-w-0'>
                    <span className='font-medium'>{entry.character}</span>
                    <span className='ml-2 text-muted-foreground'>
                      {entry.content}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // System 그룹 처리 (연속된 System들을 하나의 문단으로)
  const formatSystemGroup = (systemEntries: LogEntry[], groupIndex: number) => {
    const key = `system-group-${groupIndex}`;
    const textStyle = getTextStyle();
    const paragraphStyle = getParagraphSpacing();

    return (
      <div key={key} style={{
        ...paragraphStyle,
        marginBottom: `${settings.paragraphSpacing * 0.75}rem`,
      }}>
        <div 
          className={`text-muted-foreground ${
            settings.centerSystemMessages ? 'text-center' : ''
          }`} 
          style={textStyle}
        >
          {systemEntries.map((entry, index) => (
            <div key={`${entry.id}-${index}`}>
              {entry.content}
              {index < systemEntries.length - 1 && <br />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Character 그룹 처리 (같은 캐릭터의 연속 대사들을 하나로)
  const formatCharacterGroup = (characterEntries: LogEntry[], groupIndex: number) => {
    const key = `character-group-${groupIndex}`;
    const textStyle = getTextStyle();
    const paragraphStyle = getParagraphSpacing();
    const firstEntry = characterEntries[0];
    const characterInfo = getCharacterInfo(firstEntry.character!);

    return (
      <div key={key} className='flex gap-3' style={paragraphStyle}>
        {/* 아바타 */}
        {settings.showAvatars && (
          characterInfo ? (
            <Avatar className='w-7 h-7 flex-shrink-0'>
              <AvatarImage
                src={
                  characterInfo.thumbnail ||
                  '/placeholder.svg?height=40&width=40&query=character'
                }
                alt={firstEntry.character}
                onError={e => {
                  console.log(
                    `Avatar failed to load for ${firstEntry.character}:`,
                    characterInfo.thumbnail
                  );
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <AvatarFallback className='bg-gray-200 text-xs font-medium'>
                {firstEntry.character?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          ) : (
            // NPC의 경우 기본 아바타 표시
            <div className='w-7 h-7 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700'>
              {firstEntry.character?.charAt(0) || '?'}
            </div>
          )
        )}

        <div className='flex-1 min-w-0'>
          <div style={textStyle}>
            <span className='font-bold'>{firstEntry.character}</span>
            <span className='ml-4'>
              {characterEntries.map((entry, index) => (
                <span key={`${entry.id}-${index}`}>
                  {entry.content}
                  {index < characterEntries.length - 1 && <br />}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5; // 보여줄 페이지 수

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    // 끝에서 시작점 조정
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // 이전 버튼
    pages.push(
      <Button
        key='prev'
        variant='outline'
        size='sm'
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </Button>
    );

    // 첫 페이지
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={1 === currentPage ? 'default' : 'outline'}
          size='sm'
          onClick={() => goToPage(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key='dots1' className='px-2 text-muted-foreground'>
            ...
          </span>
        );
      }
    }

    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size='sm'
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>
      );
    }

    // 마지막 페이지
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key='dots2' className='px-2 text-muted-foreground'>
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={totalPages === currentPage ? 'default' : 'outline'}
          size='sm'
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    // 다음 버튼
    pages.push(
      <Button
        key='next'
        variant='outline'
        size='sm'
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </Button>
    );

    return pages;
  };

  return (
    <div className='space-y-4'>
      {/* 필터 탭 - IC가 기본, 전체가 두번째 */}
      <Tabs
        value={activeFilter}
        onValueChange={handleFilterChange}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='ic'>IC</TabsTrigger>
          <TabsTrigger value='all'>전체</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className='mt-4'>
          {/* 로그 내용 */}
          <div className='min-h-96'>
            <div className='space-y-0'>
              {groupedEntries.map((item, index) => {
                if (Array.isArray(item)) {
                  // 그룹인 경우 - OOC, System, Character 타입 확인
                  const firstEntry = item[0];
                  if (firstEntry.type === 'ooc') {
                    return formatOOCGroup(item, index);
                  } else if (firstEntry.type === 'system') {
                    return formatSystemGroup(item, index);
                  } else if (firstEntry.type === 'character') {
                    return formatCharacterGroup(item, index);
                  }
                  return null;
                } else {
                  // 단일 로그인 경우
                  return formatEntry(item, index);
                }
              })}
            </div>

            {currentEntries.length === 0 && (
              <div className='text-center py-12 text-muted-foreground'>
                해당 필터에 표시할 내용이 없습니다.
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-1 pt-4 border-t'>
              {renderPagination()}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
