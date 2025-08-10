'use client';

import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  FileText, 
  Edit3, 
  Download,
  Upload,
  Settings,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InfoPage() {
  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      <div className='space-y-6'>
        {/* 페이지 헤더 */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold'>TRPG 작성 도구 가이드</h1>
          <p className='text-muted-foreground text-lg'>
            Roll20 채팅 로그를 파싱하고 편집하여 아카이브용 로그를 생성하는 방법을 안내합니다.
          </p>
        </div>

        {/* 워크플로우 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              작업 순서
            </CardTitle>
            <CardDescription>
              TRPG 로그를 파싱부터 최종 아카이브까지의 전체 과정입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {/* Step 1 */}
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
                  <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>1</span>
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold mb-2 flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    로그 파싱
                  </h3>
                  <p className='text-muted-foreground mb-3'>
                    Roll20에서 채팅 로그를 추출하고 구조화된 JSON 데이터로 변환합니다.
                  </p>
                  <div className='space-y-2 text-sm'>
                    <div>• Roll20에서 브라우저 개발자 도구를 열고 제공된 스크립트를 실행</div>
                    <div>• 생성된 JSON 파일을 다운로드하여 저장</div>
                    <div>• 발신자별 타입 매핑 (캐릭터, OOC, 귓속말, 시스템) 설정</div>
                  </div>
                  <div className='mt-3'>
                    <Link href='/write/parse'>
                      <Button variant='outline' size='sm'>
                        로그 파싱하기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className='border-l-2 border-muted ml-4 pl-4'>
                <div className='h-4' />
              </div>

              {/* Step 2 */}
              <div className='flex gap-4'>
                <div className='flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                  <span className='text-sm font-bold text-green-600 dark:text-green-400'>2</span>
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold mb-2 flex items-center gap-2'>
                    <Edit3 className='h-4 w-4' />
                    로그 편집
                  </h3>
                  <p className='text-muted-foreground mb-3'>
                    파싱된 로그를 범위 선택하여 편집하고 최종 아카이브용 데이터를 생성합니다.
                  </p>
                  <div className='space-y-2 text-sm'>
                    <div>• 편집할 로그 범위 선택 (체크박스 또는 슬라이더 사용)</div>
                    <div>• 개별 메시지 편집, 추가, 삭제</div>
                    <div>• 세션 메타데이터 (ID, 제목, 설명) 입력</div>
                    <div>• SubPost 형태의 JSON 파일로 최종 출력</div>
                  </div>
                  <div className='mt-3'>
                    <Link href='/write/edit'>
                      <Button variant='outline' size='sm'>
                        로그 편집하기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기능 소개 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FileText className='h-5 w-5' />
                로그 파싱 기능
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <h4 className='font-medium'>자동 메시지 분류</h4>
                <p className='text-sm text-muted-foreground'>
                  캐릭터 발언, OOC, 귓속말, 시스템 메시지를 자동으로 구분하여 분류합니다.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>발신자 매핑</h4>
                <p className='text-sm text-muted-foreground'>
                  각 발신자의 메시지 타입을 설정하고 표시명을 지정할 수 있습니다.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>프리셋 저장</h4>
                <p className='text-sm text-muted-foreground'>
                  매핑 설정을 프리셋으로 저장하여 다른 세션에서 재사용할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Edit3 className='h-5 w-5' />
                로그 편집 기능
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <h4 className='font-medium'>범위 선택 편집</h4>
                <p className='text-sm text-muted-foreground'>
                  전체 로그 중 편집할 부분만 선택하여 효율적으로 작업할 수 있습니다.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>실시간 편집</h4>
                <p className='text-sm text-muted-foreground'>
                  메시지 내용, 발신자, 타입을 실시간으로 편집하고 미리보기할 수 있습니다.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>JSON 출력</h4>
                <p className='text-sm text-muted-foreground'>
                  완성된 로그를 SubPost 형태의 JSON으로 내보내어 아카이브에 활용할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 팁 */}
        <Card className='bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300'>
              <Eye className='h-5 w-5' />
              사용 팁
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-blue-800 dark:text-blue-200'>
            <div className='space-y-2'>
              <h4 className='font-medium'>파싱 단계에서</h4>
              <ul className='text-sm space-y-1 ml-4'>
                <li>• 브라우저 개발자 도구의 Console 탭에서 스크립트를 실행하세요</li>
                <li>• 발신자 타입을 정확히 설정하면 편집 단계에서 더 깔끔한 결과를 얻을 수 있습니다</li>
                <li>• 매핑 프리셋을 저장해두면 같은 세션 멤버로 진행하는 후속 세션에서 시간을 절약할 수 있습니다</li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium'>편집 단계에서</h4>
              <ul className='text-sm space-y-1 ml-4'>
                <li>• 범위 선택으로 메모리를 절약하고 편집 성능을 향상시킬 수 있습니다</li>
                <li>• 사담(OOC) 토글로 OOC 메시지를 숨기거나 표시할 수 있습니다</li>
                <li>• JSON 토글로 실시간으로 출력될 데이터 구조를 확인할 수 있습니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}