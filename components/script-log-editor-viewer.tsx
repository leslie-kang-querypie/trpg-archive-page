import {
  ArrowRight,
  Dice6,
  Heart,
  FileText,
  Lock,
} from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogEntry, Character, ReadingSettings } from '@/types';

interface ScriptLogEditorViewerProps {
  entries: LogEntry[];
  characters: Character[];
  settings: ReadingSettings;
  showOOC?: boolean;
}

export interface ScriptLogEditorViewerRef {
  scrollTo: (index: number) => void;
}

export const ScriptLogEditorViewer = forwardRef<ScriptLogEditorViewerRef, ScriptLogEditorViewerProps>(
  ({ entries, characters, settings, showOOC = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const entryRefs = useRef<{ [key: number]: HTMLDivElement }>({});

    useImperativeHandle(ref, () => ({
      scrollTo: (index: number) => {
        const entryElement = entryRefs.current[index];
        if (entryElement && containerRef.current) {
          const containerTop = containerRef.current.scrollTop;
          const containerHeight = containerRef.current.clientHeight;
          const entryTop = entryElement.offsetTop;
          const entryHeight = entryElement.clientHeight;

          // 뷰포트 중앙에 위치시키기
          const targetScrollTop = entryTop - (containerHeight / 2) + (entryHeight / 2);
          containerRef.current.scrollTop = targetScrollTop;
        }
      },
    }));

    // 필터링된 엔트리들
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

    const getCharacterInfo = (characterName: string) => {
      return characters.find(c => c.name === characterName);
    };

    // 개별 로그의 아바타 URL을 우선적으로 사용하는 함수
    const getAvatarUrl = (entry: LogEntry, characterInfo?: Character) => {
      // 1. 로그에 직접 아바타가 있으면 사용
      if (entry.avatar && !entry.avatar.includes('$0')) {
        return entry.avatar;
      }
      // 2. 캐릭터 정보의 썸네일 사용
      if (characterInfo?.thumbnail) {
        return characterInfo.thumbnail;
      }
      // 3. 기본 플레이스홀더
      return '/placeholder.svg?height=28&width=28&query=character';
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
            (entry.type !== 'character' ||
              currentGroupCharacter === entry.character);

          if (isSameGroup) {
            // 같은 그룹이면 추가
            currentGroup.push(entry);
          } else {
            // 다른 그룹이면 현재 그룹 완료 후 새 그룹 시작
            finishCurrentGroup();
            currentGroup = [entry];
            currentGroupType = entry.type;
            currentGroupCharacter =
              entry.type === 'character' ? (entry.character ?? null) : null;
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

    const formatEntry = (entry: LogEntry, index: number) => {
      const key = `${entry.id}-${index}`;
      const textStyle = getTextStyle();
      const paragraphStyle = getParagraphSpacing();

      // 시스템 메시지
      if (entry.type === 'system') {
        if (entry.target) {
          return (
            <div 
              key={key} 
              style={paragraphStyle}
              ref={el => el && (entryRefs.current[index] = el)}
            >
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
          return (
            <div
              key={key}
              style={{
                ...paragraphStyle,
                marginBottom: `${settings.paragraphSpacing * 0.75}rem`,
              }}
              ref={el => el && (entryRefs.current[index] = el)}
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

      // 귓속말
      if (entry.type === 'whisper' && entry.character) {
        const characterInfo = getCharacterInfo(entry.character);
        const avatarUrl = getAvatarUrl(entry, characterInfo);

        return (
          <div 
            key={key} 
            style={paragraphStyle}
            ref={el => el && (entryRefs.current[index] = el)}
          >
            <div className='bg-amber-50 rounded-lg px-3 py-2 italic'>
              <div className='flex items-start gap-3'>
                {settings.showAvatars && (
                  <Avatar className='w-6 h-6 flex-shrink-0'>
                    <AvatarImage
                      src={avatarUrl}
                      alt={entry.character}
                      className='object-cover'
                    />
                    <AvatarFallback className='bg-transparent border-0 text-xs'>
                      {entry.character.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
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

      // OOC
      if (entry.type === 'ooc') {
        return (
          <div 
            key={key} 
            style={paragraphStyle}
            ref={el => el && (entryRefs.current[index] = el)}
          >
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

      // 일반 캐릭터 대화
      if (entry.type === 'character' && entry.character) {
        const characterInfo = getCharacterInfo(entry.character);
        const avatarUrl = getAvatarUrl(entry, characterInfo);

        return (
          <div 
            key={key} 
            className='flex gap-3' 
            style={paragraphStyle}
            ref={el => el && (entryRefs.current[index] = el)}
          >
            {settings.showAvatars && (
              <Avatar className='w-7 h-7 flex-shrink-0'>
                <AvatarImage
                  src={avatarUrl}
                  alt={entry.character}
                  className='object-cover'
                />
                <AvatarFallback className='bg-gray-200 text-xs font-medium'>
                  {entry.character?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            )}

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
        <div 
          key={key} 
          style={paragraphStyle}
          ref={el => el && (entryRefs.current[groupIndex] = el)}
        >
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
        <div
          key={key}
          style={{
            ...paragraphStyle,
            marginBottom: `${settings.paragraphSpacing * 0.75}rem`,
          }}
          ref={el => el && (entryRefs.current[groupIndex] = el)}
        >
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
    const formatCharacterGroup = (
      characterEntries: LogEntry[],
      groupIndex: number
    ) => {
      const key = `character-group-${groupIndex}`;
      const textStyle = getTextStyle();
      const paragraphStyle = getParagraphSpacing();
      const firstEntry = characterEntries[0];
      const characterInfo = getCharacterInfo(firstEntry.character!);
      const avatarUrl = getAvatarUrl(firstEntry, characterInfo);

      return (
        <div 
          key={key} 
          className='flex gap-3' 
          style={paragraphStyle}
          ref={el => el && (entryRefs.current[groupIndex] = el)}
        >
          {/* 아바타 */}
          {settings.showAvatars && (
            <Avatar className='w-7 h-7 flex-shrink-0'>
              <AvatarImage
                src={avatarUrl}
                alt={firstEntry.character}
                className='object-cover'
              />
              <AvatarFallback className='bg-gray-200 text-xs font-medium'>
                {firstEntry.character?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
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

    const groupedEntries = groupConsecutiveEntries(filteredEntries);

    return (
      <div 
        ref={containerRef}
        className='space-y-0 h-full overflow-y-auto'
      >
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

        {filteredEntries.length === 0 && (
          <div className='text-center py-12 text-muted-foreground'>
            표시할 내용이 없습니다.
          </div>
        )}
      </div>
    );
  }
);

ScriptLogEditorViewer.displayName = 'ScriptLogEditorViewer';