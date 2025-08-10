import { User, Type, Space, AlignCenter, List } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ReadingSettings } from '@/types';

interface ReadingSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReadingSettings;
  onSettingsChange: (settings: ReadingSettings) => void;
}

export function ReadingSettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: ReadingSettingsModalProps) {
  const updateSetting = <K extends keyof ReadingSettings>(
    key: K,
    value: ReadingSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const getFontSizeLabel = (size: number) => {
    if (size <= 12) return '작게';
    if (size <= 14) return '보통';
    if (size <= 16) return '크게';
    return '매우 크게';
  };

  const getSpacingLabel = (spacing: number) => {
    if (spacing <= 1) return '좁게';
    if (spacing <= 2) return '보통';
    if (spacing <= 3) return '넓게';
    return '매우 넓게';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>읽기 설정</DialogTitle>
          <DialogDescription>
            로그 읽기 환경을 개인 취향에 맞게 조정하세요.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* 프로필 사진 표시 */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-muted-foreground' />
              <Label htmlFor='avatar-toggle' className='text-sm font-medium'>
                프로필 사진 표시
              </Label>
            </div>
            <Switch
              id='avatar-toggle'
              checked={settings.showAvatars}
              onCheckedChange={checked => updateSetting('showAvatars', checked)}
            />
          </div>

          {/* 시스템 메시지 중앙정렬 */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <AlignCenter className='w-4 h-4 text-muted-foreground' />
              <Label htmlFor='center-system-toggle' className='text-sm font-medium'>
                시스템 메시지 중앙정렬
              </Label>
            </div>
            <Switch
              id='center-system-toggle'
              checked={settings.centerSystemMessages}
              onCheckedChange={checked => updateSetting('centerSystemMessages', checked)}
            />
          </div>

          {/* 페이지당 아이템 수 */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <List className='w-4 h-4 text-muted-foreground' />
              <Label className='text-sm font-medium'>
                페이지당 아이템 수
              </Label>
            </div>
            <Select
              value={settings.itemsPerPage.toString()}
              onValueChange={(value) => updateSetting('itemsPerPage', parseInt(value))}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='50'>50개</SelectItem>
                <SelectItem value='100'>100개</SelectItem>
                <SelectItem value='200'>200개</SelectItem>
                <SelectItem value='500'>500개</SelectItem>
                <SelectItem value='1000'>1000개</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 폰트 크기 */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Type className='w-4 h-4 text-muted-foreground' />
            <Label className='text-sm font-medium'>
              폰트 크기: {getFontSizeLabel(settings.fontSize)}
            </Label>
          </div>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSetting('fontSize', value)}
            min={11}
            max={18}
            step={1}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>작게</span>
            <span>보통</span>
            <span>크게</span>
          </div>
        </div>

        {/* 줄 간격 */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Space className='w-4 h-4 text-muted-foreground' />
            <Label className='text-sm font-medium'>
              줄 간격: {getSpacingLabel(settings.lineSpacing)}
            </Label>
          </div>
          <Slider
            value={[settings.lineSpacing]}
            onValueChange={([value]) => updateSetting('lineSpacing', value)}
            min={1}
            max={4}
            step={0.2}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>좁게</span>
            <span>보통</span>
            <span>넓게</span>
          </div>
        </div>

        {/* 문단 간격 */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Space className='w-4 h-4 text-muted-foreground rotate-90' />
            <Label className='text-sm font-medium'>
              문단 간격: {getSpacingLabel(settings.paragraphSpacing)}
            </Label>
          </div>
          <Slider
            value={[settings.paragraphSpacing]}
            onValueChange={([value]) =>
              updateSetting('paragraphSpacing', value)
            }
            min={0.5}
            max={4}
            step={0.5}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>좁게</span>
            <span>보통</span>
            <span>넓게</span>
          </div>
        </div>

        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button
            onClick={() => {
              // 기본값으로 초기화
              onSettingsChange({
                showAvatars: true,
                fontSize: 14,
                lineSpacing: 1.5,
                paragraphSpacing: 2,
                centerSystemMessages: false,
                itemsPerPage: 200,
              });
            }}
            variant='secondary'
          >
            초기화
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
