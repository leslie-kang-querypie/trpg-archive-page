import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';

interface ParseStepProps {
  rawData: string;
  isProcessing: boolean;
  onDataChange: (data: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onParse: () => void;
}

export function ParseStep({
  rawData,
  isProcessing,
  onDataChange,
  onFileUpload,
  onParse,
}: ParseStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2 justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              로그 데이터 업로드 및 파싱
            </CardTitle>
            <CardDescription>
              브라우저에서 추출한 JSON 데이터를 여기에 붙여넣거나 파일로 업로드하세요.
            </CardDescription>
          </div>
          <Button
            onClick={onParse}
            disabled={isProcessing || !rawData.trim()}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" />
                처리 중...
              </>
            ) : (
              '파싱 실행 및 다음 단계'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-6 items-end justify-between flex-wrap">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            파일 업로드
          </Button>

          {rawData && (
            <div className="text-sm text-muted-foreground">
              입력된 데이터: {rawData.length.toLocaleString()} 문자
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            accept=".json,.txt"
            onChange={onFileUpload}
            className="hidden"
          />
        </div>

        <Textarea
          placeholder="JSON 형태의 로그 데이터를 여기에 붙여넣으세요..."
          value={rawData}
          onChange={e => onDataChange(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
}