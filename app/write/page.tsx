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
  Info,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WritePage() {
  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      <div className='space-y-6'>
        {/* 페이지 헤더 */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold'>TRPG 작성 도구</h1>
          <p className='text-muted-foreground text-lg'>
            Roll20 채팅 로그를 파싱하고 편집하여 아카이브용 로그를 생성하세요.
          </p>
        </div>

        {/* 도구 카드들 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card className='group hover:shadow-lg transition-shadow cursor-pointer'>
            <Link href='/write/parse'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-blue-600' />
                  로그 파싱
                </CardTitle>
                <CardDescription>
                  Roll20 채팅 로그를 구조화된 JSON 데이터로 변환
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div>• 브라우저 스크립트 실행</div>
                  <div>• 자동 메시지 분류</div>
                  <div>• 발신자 타입 매핑</div>
                </div>
                <div className='mt-4 flex items-center text-blue-600 group-hover:text-blue-700'>
                  <span className='text-sm font-medium'>시작하기</span>
                  <ArrowRight className='h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform' />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className='group hover:shadow-lg transition-shadow cursor-pointer'>
            <Link href='/write/edit'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Edit3 className='h-5 w-5 text-green-600' />
                  로그 편집
                </CardTitle>
                <CardDescription>
                  파싱된 로그를 편집하고 최종 아카이브 생성
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div>• 범위 선택 편집</div>
                  <div>• 실시간 미리보기</div>
                  <div>• SubPost JSON 출력</div>
                </div>
                <div className='mt-4 flex items-center text-green-600 group-hover:text-green-700'>
                  <span className='text-sm font-medium'>시작하기</span>
                  <ArrowRight className='h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform' />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className='group hover:shadow-lg transition-shadow cursor-pointer'>
            <Link href='/write/session'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5 text-orange-600' />
                  포스트 작성
                </CardTitle>
                <CardDescription>
                  TRPG 캠페인 포스트 생성 및 관리
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div>• 캠페인 기본 정보 설정</div>
                  <div>• 캐릭터 및 세션 관리</div>
                  <div>• 서브포스트 통합 관리</div>
                </div>
                <div className='mt-4 flex items-center text-orange-600 group-hover:text-orange-700'>
                  <span className='text-sm font-medium'>시작하기</span>
                  <ArrowRight className='h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform' />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className='group hover:shadow-lg transition-shadow cursor-pointer'>
            <Link href='/write/info'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Info className='h-5 w-5 text-purple-600' />
                  작성 가이드
                </CardTitle>
                <CardDescription>
                  작성 도구 사용법과 팁
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div>• 전체 작업 워크플로우</div>
                  <div>• 기능별 상세 설명</div>
                  <div>• 효율적인 사용 팁</div>
                </div>
                <div className='mt-4 flex items-center text-purple-600 group-hover:text-purple-700'>
                  <span className='text-sm font-medium'>가이드 보기</span>
                  <ArrowRight className='h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform' />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* 빠른 시작 */}
        <Card className='bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-800'>
          <CardHeader>
            <CardTitle className='text-lg'>빠른 시작</CardTitle>
            <CardDescription>
              처음 사용하시나요? 단계별로 진행해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Link href='/write/info'>
                <Button variant='outline' className='w-full sm:w-auto'>
                  가이드 먼저 읽기
                </Button>
              </Link>
              <Link href='/write/parse'>
                <Button className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700'>
                  로그 파싱하기
                </Button>
              </Link>
              <Link href='/write/session'>
                <Button className='w-full sm:w-auto bg-orange-600 hover:bg-orange-700'>
                  포스트 작성하기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}