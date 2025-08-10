import { useState } from 'react';
import { LogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { X } from 'lucide-react';

interface LogEntryFormProps {
  onSubmit: (entry: LogEntry) => void;
  onCancel: () => void;
  existingEntries: LogEntry[];
}

export function LogEntryForm({ onSubmit, onCancel, existingEntries }: LogEntryFormProps) {
  const [selectedLogType, setSelectedLogType] = useState<string>('');
  const [newEntryData, setNewEntryData] = useState<Partial<LogEntry>>({});

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
    if (
      ['character', 'ooc', 'whisper'].includes(selectedLogType) &&
      !newEntryData.character
    ) {
      alert('캐릭터명을 입력해주세요.');
      return;
    }
    if (selectedLogType === 'whisper' && !newEntryData.target) {
      alert('받는 사람을 입력해주세요.');
      return;
    }
    if (
      selectedLogType === 'dice' &&
      (!newEntryData.diceResult?.dice || !newEntryData.diceResult?.result)
    ) {
      alert('주사위 정보를 모두 입력해주세요.');
      return;
    }
    if (
      selectedLogType === 'damage' &&
      (!newEntryData.damageInfo?.target || !newEntryData.damageInfo?.amount)
    ) {
      alert('데미지 정보를 모두 입력해주세요.');
      return;
    }
    if (
      selectedLogType === 'handout' &&
      (!newEntryData.handoutInfo?.title || !newEntryData.handoutInfo?.target)
    ) {
      alert('핸드아웃 제목과 받는 사람을 입력해주세요.');
      return;
    }

    const newEntry: LogEntry = {
      id: Math.max(...existingEntries.map(e => e.id), 0) + 1,
      type: selectedLogType as any,
      content: newEntryData.content,
      ...newEntryData,
    };

    onSubmit(newEntry);
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">새 로그 추가</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
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
            {(selectedLogType === 'character' ||
              selectedLogType === 'ooc' ||
              selectedLogType === 'whisper') && (
              <>
                <div>
                  <Label className="text-sm font-medium">캐릭터명</Label>
                  <Input
                    value={newEntryData.character || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        character: e.target.value,
                      }))
                    }
                    placeholder="캐릭터명을 입력하세요"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">아바타 URL (선택사항)</Label>
                  <Input
                    value={newEntryData.avatar || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        avatar: e.target.value,
                      }))
                    }
                    placeholder="아바타 이미지 URL"
                  />
                </div>
              </>
            )}

            {/* 귓속말 타겟 */}
            {selectedLogType === 'whisper' && (
              <div>
                <Label className="text-sm font-medium">받는 사람</Label>
                <Input
                  value={newEntryData.target || ''}
                  onChange={e =>
                    setNewEntryData(prev => ({
                      ...prev,
                      target: e.target.value,
                    }))
                  }
                  placeholder="받는 사람을 입력하세요"
                />
              </div>
            )}

            {/* 주사위 결과 */}
            {selectedLogType === 'dice' && (
              <>
                <div>
                  <Label className="text-sm font-medium">캐릭터명</Label>
                  <Input
                    value={newEntryData.character || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        character: e.target.value,
                      }))
                    }
                    placeholder="주사위를 굴린 캐릭터명"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">주사위 표기 (예: 2d6+3)</Label>
                  <Input
                    value={newEntryData.diceResult?.dice || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        diceResult: {
                          dice: e.target.value,
                          result: prev.diceResult?.result || 0,
                          rolls: prev.diceResult?.rolls || [],
                        },
                      }))
                    }
                    placeholder="2d6+3"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">결과값</Label>
                  <Input
                    type="number"
                    value={newEntryData.diceResult?.result || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        diceResult: {
                          dice: prev.diceResult?.dice || '',
                          result: parseInt(e.target.value) || 0,
                          rolls: prev.diceResult?.rolls || [],
                        },
                      }))
                    }
                    placeholder="최종 결과값"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">개별 주사위 값 (쉼표로 구분)</Label>
                  <Input
                    value={newEntryData.diceResult?.rolls?.join(', ') || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        diceResult: {
                          dice: prev.diceResult?.dice || '',
                          result: prev.diceResult?.result || 0,
                          rolls: e.target.value
                            .split(',')
                            .map(v => parseInt(v.trim()))
                            .filter(n => !isNaN(n)),
                        },
                      }))
                    }
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
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        damageInfo: {
                          target: e.target.value,
                          amount: prev.damageInfo?.amount || 0,
                          type: prev.damageInfo?.type || 'damage',
                        },
                      }))
                    }
                    placeholder="대상 캐릭터명"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">유형</Label>
                  <Select
                    value={newEntryData.damageInfo?.type || 'damage'}
                    onValueChange={value =>
                      setNewEntryData(prev => ({
                        ...prev,
                        damageInfo: {
                          target: prev.damageInfo?.target || '',
                          amount: prev.damageInfo?.amount || 0,
                          type: value,
                        },
                      }))
                    }
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
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        damageInfo: {
                          target: prev.damageInfo?.target || '',
                          amount: parseInt(e.target.value) || 0,
                          type: prev.damageInfo?.type || 'damage',
                        },
                      }))
                    }
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
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        handoutInfo: {
                          title: e.target.value,
                          target: prev.handoutInfo?.target || '',
                          category: prev.handoutInfo?.category,
                          isSecret: prev.handoutInfo?.isSecret,
                        },
                      }))
                    }
                    placeholder="핸드아웃 제목"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">받는 사람</Label>
                  <Input
                    value={newEntryData.handoutInfo?.target || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        handoutInfo: {
                          title: prev.handoutInfo?.title || '',
                          target: e.target.value,
                          category: prev.handoutInfo?.category,
                          isSecret: prev.handoutInfo?.isSecret,
                        },
                      }))
                    }
                    placeholder="받는 사람"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">카테고리</Label>
                  <Input
                    value={newEntryData.handoutInfo?.category || ''}
                    onChange={e =>
                      setNewEntryData(prev => ({
                        ...prev,
                        handoutInfo: {
                          title: prev.handoutInfo?.title || '',
                          target: prev.handoutInfo?.target || '',
                          category: e.target.value,
                          isSecret: prev.handoutInfo?.isSecret,
                        },
                      }))
                    }
                    placeholder="카테고리 (선택사항)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-secret"
                    checked={newEntryData.handoutInfo?.isSecret || false}
                    onCheckedChange={checked =>
                      setNewEntryData(prev => ({
                        ...prev,
                        handoutInfo: {
                          title: prev.handoutInfo?.title || '',
                          target: prev.handoutInfo?.target || '',
                          category: prev.handoutInfo?.category,
                          isSecret: checked as boolean,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="is-secret" className="text-sm font-medium">
                    비밀 핸드아웃
                  </Label>
                </div>
              </>
            )}

            {/* 내용 */}
            <div>
              <Label className="text-sm font-medium">내용</Label>
              <Textarea
                value={newEntryData.content || ''}
                onChange={e =>
                  setNewEntryData(prev => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder={
                  selectedLogType === 'handout'
                    ? '핸드아웃 내용을 입력하세요'
                    : '내용을 입력하세요'
                }
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
  );
}