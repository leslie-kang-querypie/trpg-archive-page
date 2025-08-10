import { SenderMapping, MESSAGE_TYPES, ParsedMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SenderMappingCardProps {
  mapping: SenderMapping;
  messages: ParsedMessage[];
  onUpdateType: (sender: string, type: string) => void;
  onUpdateDisplayName: (sender: string, displayName: string) => void;
  onUpdateAvatarUrl: (sender: string, avatarUrl: string) => void;
  onUpdateWhisperInfo: (sender: string, whisperFrom: string, whisperTo: string) => void;
  onToggleExpanded: (sender: string) => void;
}

export function SenderMappingCard({
  mapping,
  messages,
  onUpdateType,
  onUpdateDisplayName,
  onUpdateAvatarUrl,
  onUpdateWhisperInfo,
  onToggleExpanded,
}: SenderMappingCardProps) {
  const getSenderMessages = (sender: string, limit: number = 5) => {
    return messages
      .filter(msg => {
        const msgSender = msg.sender || 'SYSTEM';
        return msgSender === sender;
      })
      .slice(0, limit);
  };

  return (
    <div
      className={`border rounded-lg ${
        mapping.markedForDeletion ? 'opacity-50 bg-red-50 border-red-200' : ''
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <div className="flex items-center gap-3 flex-1">
          {/* 아바타 미리보기 */}
          {mapping.avatarUrl && (mapping.type === 'character' || mapping.type === 'whisper') ? (
            <img
              src={mapping.avatarUrl}
              alt={mapping.sender}
              className="w-10 h-10 rounded-full object-cover border"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {mapping.sender.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="font-medium flex items-center gap-2 mb-1">
              {mapping.sender}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onToggleExpanded(mapping.sender)}
              >
                {mapping.expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">{mapping.count}개의 메시지</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Select
            value={mapping.markedForDeletion ? 'delete' : mapping.type}
            onValueChange={value => onUpdateType(mapping.sender, value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_TYPES.map(type => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className={type.value === 'delete' ? 'text-red-600' : ''}
                >
                  <div className="flex items-center gap-2">{type.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!mapping.markedForDeletion && (
            <>
              {mapping.type !== 'system' && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">표시 이름</Label>
                  <Input
                    placeholder={mapping.sender}
                    value={mapping.displayName || ''}
                    onChange={e => onUpdateDisplayName(mapping.sender, e.target.value)}
                    className="w-48 text-sm"
                  />
                </div>
              )}

              {mapping.type === 'whisper' && (
                <>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">발신자</Label>
                    <Input
                      placeholder="누가 보냈나요?"
                      value={mapping.whisperFrom || ''}
                      onChange={e =>
                        onUpdateWhisperInfo(
                          mapping.sender,
                          e.target.value,
                          mapping.whisperTo || ''
                        )
                      }
                      className="w-48 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">수신자</Label>
                    <Input
                      placeholder="누구에게 보냈나요?"
                      value={mapping.whisperTo || ''}
                      onChange={e =>
                        onUpdateWhisperInfo(
                          mapping.sender,
                          mapping.whisperFrom || '',
                          e.target.value
                        )
                      }
                      className="w-48 text-sm"
                    />
                  </div>
                </>
              )}

              {/* 아바타 URL 입력 필드 */}
              {(mapping.type === 'character' || mapping.type === 'whisper') && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">아바타 URL</Label>
                  <Input
                    placeholder="아바타 이미지 URL을 입력하세요"
                    value={mapping.avatarUrl || ''}
                    onChange={e => onUpdateAvatarUrl(mapping.sender, e.target.value)}
                    className="w-48 text-sm"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 메시지 미리보기 */}
      {mapping.expanded && (
        <div className="border-t bg-gray-50 dark:bg-gray-900/20 p-3">
          <div className="text-sm font-medium mb-2">메시지 미리보기:</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getSenderMessages(mapping.sender, 5).map((msg, msgIndex) => (
              <div
                key={msgIndex}
                className="p-2 bg-white dark:bg-gray-800 rounded text-xs"
              >
                <div className="text-muted-foreground mb-1">
                  {(msg as any).time || '시간 없음'}
                </div>
                <div className="truncate">
                  {(msg.content || '내용 없음').substring(0, 100)}
                  {(msg.content?.length || 0) > 100 ? '...' : ''}
                </div>
              </div>
            ))}
            {getSenderMessages(mapping.sender).length === 0 && (
              <div className="text-muted-foreground text-xs">메시지를 찾을 수 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}