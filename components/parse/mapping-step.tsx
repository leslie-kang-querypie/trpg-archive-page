import { SenderMapping, ParsedMessage } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SenderMappingCard } from './sender-mapping-card';
import { Settings, MessageSquare } from 'lucide-react';

interface MappingStepProps {
  mappings: SenderMapping[];
  messages: ParsedMessage[];
  onUpdateSenderType: (sender: string, type: string) => void;
  onUpdateDisplayName: (sender: string, displayName: string) => void;
  onUpdateSenderAvatarUrl: (sender: string, avatarUrl: string) => void;
  onUpdateWhisperInfo: (sender: string, whisperFrom: string, whisperTo: string) => void;
  onToggleSenderExpanded: (sender: string) => void;
  onSaveMappingPreset: () => void;
  onLoadMappingPreset: () => void;
  onApplyMappings: () => void;
}

export function MappingStep({
  mappings,
  messages,
  onUpdateSenderType,
  onUpdateDisplayName,
  onUpdateSenderAvatarUrl,
  onUpdateWhisperInfo,
  onToggleSenderExpanded,
  onSaveMappingPreset,
  onLoadMappingPreset,
  onApplyMappings,
}: MappingStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2 justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              발신자 타입 매핑
            </CardTitle>
            <CardDescription>
              각 발신자의 메시지 타입을 설정하세요. 메시지 개수순으로 정렬되어 있습니다.
            </CardDescription>
          </div>
          <Button onClick={onApplyMappings} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            로그 편집 페이지로 이동
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mappings.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                총 {mappings.length}명의 발신자
              </div>
              <div className="flex gap-2">
                <Button onClick={onLoadMappingPreset} variant="outline" size="sm">
                  매핑 프리셋 불러오기
                </Button>
                <Button onClick={onSaveMappingPreset} variant="outline" size="sm">
                  매핑 프리셋 저장하기
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {mappings.map(mapping => (
                <SenderMappingCard
                  key={mapping.sender}
                  mapping={mapping}
                  messages={messages}
                  onUpdateType={onUpdateSenderType}
                  onUpdateDisplayName={onUpdateDisplayName}
                  onUpdateAvatarUrl={onUpdateSenderAvatarUrl}
                  onUpdateWhisperInfo={onUpdateWhisperInfo}
                  onToggleExpanded={onToggleSenderExpanded}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}