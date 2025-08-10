import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Code } from 'lucide-react';

interface ScriptStepProps {
  script: string;
  onNext: () => void;
  onCopyScript: () => void;
}

export function ScriptStep({ script, onNext, onCopyScript }: ScriptStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2 justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              브라우저 콘솔 스크립트
            </CardTitle>
            <CardDescription>
              Roll20 웹페이지에서 개발자 도구 콘솔에 붙여넣어 실행하는 스크립트입니다.
            </CardDescription>
          </div>
          <Button onClick={onNext} className="flex items-center gap-2">
            다음 단계
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium mb-2">사용 방법:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Roll20 세션 페이지에서 F12를 눌러 개발자 도구를 엽니다</li>
            <li>Console 탭으로 이동합니다</li>
            <li>위 스크립트를 복사해서 붙여넣고 Enter를 누릅니다</li>
            <li>자동으로 JSON 파일이 다운로드됩니다</li>
            <li>다운로드된 파일을 다음 단계에서 업로드하세요</li>
          </ol>
          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>개선사항:</strong> DOM 구조를 정확히 분석하여 메시지를 추출하고, 아바타
              이미지를 자동으로 수집하며, 귓속말과 일반 메시지를 구분합니다.
            </p>
          </div>
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-300">
              <strong>디버깅:</strong> 콘솔에서 발신자 목록과 메시지 수를 확인할 수 있습니다.
            </p>
          </div>
        </div>
        <div className="relative">
          <pre className="bg-muted p-6 rounded-lg text-sm overflow-x-auto font-mono">
            <code>{script}</code>
          </pre>
          <Button
            onClick={onCopyScript}
            className="absolute top-4 right-4"
            size="sm"
          >
            복사
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}