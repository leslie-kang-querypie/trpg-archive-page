'use client';

import { ArrowLeft, Eye, Lock, Unlock, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { ReadingSettingsModal } from '@/components/reading-settings-modal';

// 컴포넌트 imports
import { SessionInfoTemplate } from '@/components/session-info-template';
import { SubPostContent } from '@/components/sub-post-content';
import { SubPostSidebar } from '@/components/sub-post-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useKeyboardShortcuts,
  createCommonShortcuts,
} from '@/hooks/use-keyboard-shortcuts';

// 더미 데이터 (실제로는 API에서 가져옴)
const getPost = (id: string) => {
  const posts = [
    {
      id: 1,
      title: '시노비가미 - 벚꽃이 지는 밤에',
      summary:
        '현대 일본을 배경으로 한 닌자들의 이야기. 숨겨진 진실을 찾아 나서는 모험',
      thumbnail: '/fantasy-dungeon-goblins.png',
      tags: ['시노비가미', '현대', '닌자'],
      date: '2024-01-15',
      views: 245,
      password: '1234',
      sessionInfo: {
        rule: '시노비가미 RPG',
        scenario: '벚꽃이 지는 밤에',
        author: '자작 시나리오',
        playerCount: 3,
        overview:
          '현대 일본의 어느 도시에서 벌어지는 닌자들의 이야기. 각자의 사명을 가진 닌자들이 하나의 사건에 얽히게 되면서 시작되는 모험',
        characters: [
          {
            name: '카게마루',
            player: '타로',
            class: '하급닌자',
            description:
              '전통적인 닌자 가문 출신. 조용하고 신중한 성격으로 정보 수집에 능하다.',
            thumbnail: '/character-elf-rogue.png',
          },
          {
            name: '사쿠라',
            player: '하나코',
            class: '쿠노이치',
            description:
              '현대적인 감각을 가진 여성 닌자. 사교적이고 적응력이 뛰어나다.',
            thumbnail: '/character-human-bard.png',
          },
          {
            name: '류진',
            player: '지로',
            class: '상급닌자',
            description:
              '경험 많은 베테랑 닌자. 과묵하지만 동료를 아끼는 마음이 깊다.',
            thumbnail: '/character-dwarf-fighter.png',
          },
        ],
        highlight:
          '벚꽃이 흩날리는 봄밤, 세 명의 닌자가 도쿄의 네온사인 아래에서 만났다. 각자 다른 사명을 가지고 있었지만, 운명은 그들을 하나의 길로 이끌었다. 현대와 전통이 교차하는 이 도시에서, 그들만이 알 수 있는 진실이 기다리고 있었다.',
      },
      subPosts: [
        {
          id: 'session-1',
          title: '1세션: 첫 만남',
          description:
            '세 명의 닌자가 처음 만나 사건의 실마리를 찾아가는 이야기',
          content: [
            {
              id: 1,
              type: 'system' as const,
              content:
                '도쿄 시부야의 한 카페. 벚꽃이 흩날리는 봄밤, 평범해 보이는 카페에 세 명의 특별한 손님이 모였다.',
            },
            {
              id: 2,
              type: 'character' as const,
              character: '카게마루',
              content:
                '조용히 카페 구석 자리에 앉아 다른 두 사람을 관찰한다. "...예상했던 대로군."',
            },
            {
              id: 3,
              type: 'ooc' as const,
              character: '타로',
              content:
                '카게마루는 어떤 느낌으로 앉아있을까요? 경계하는 느낌인가요?',
            },
            {
              id: 4,
              type: 'ooc' as const,
              character: 'GM',
              content:
                '네, 카게마루는 항상 주변을 경계하는 습관이 있어요. 특히 처음 보는 사람들과 만날 때는 더욱 그렇죠.',
            },
            {
              id: 5,
              type: 'ooc' as const,
              character: '타로',
              content: '알겠습니다! 그럼 그런 느낌으로 연기해볼게요.',
            },
            {
              id: 6,
              type: 'character' as const,
              character: '사쿠라',
              content:
                '밝은 미소를 지으며 다가온다. "안녕하세요! 오늘 날씨가 정말 좋네요. 벚꽃이 예쁘게 피었어요."',
            },
            {
              id: 7,
              type: 'character' as const,
              character: '카게마루',
              content:
                '사쿠라를 조심스럽게 바라보며 고개를 끄덕인다. "...그렇군요."',
            },
            {
              id: 8,
              type: 'ooc' as const,
              character: '하나코',
              content:
                '사쿠라는 아직 다른 두 사람이 닌자라는 걸 확신하지 못하는 상황인가요?',
            },
            {
              id: 9,
              type: 'ooc' as const,
              character: 'GM',
              content:
                '맞습니다. 사쿠라는 추측만 하고 있는 상태예요. 확신은 없죠.',
            },
            {
              id: 10,
              type: 'character' as const,
              character: '류진',
              content:
                '묵묵히 커피를 마시며 상황을 지켜본다. "모두 모인 것 같군. 본론으로 들어가자."',
            },
            {
              id: 11,
              type: 'system' as const,
              content:
                '류진의 말에 카페의 분위기가 순간 긴장감으로 바뀌었다. 다른 손님들은 여전히 평범한 대화를 나누고 있었지만, 이 세 사람 사이에는 다른 공기가 흘렀다.',
            },
            {
              id: 12,
              type: 'character' as const,
              character: '사쿠라',
              content:
                '"그런데... 여러분도 최근 이상한 일들이 많이 일어난다고 생각하지 않으세요?"',
            },
            {
              id: 13,
              type: 'character' as const,
              character: '카게마루',
              content:
                '잠시 침묵한 후 천천히 입을 연다. "어떤 종류의 이상한 일을 말하는 건가요?"',
            },
            {
              id: 14,
              type: 'ooc' as const,
              character: '타로',
              content: '카게마루가 상대방을 떠보는 느낌으로 말하는 거죠?',
            },
            {
              id: 15,
              type: 'ooc' as const,
              character: 'GM',
              content:
                '네, 정확해요. 상대방이 얼마나 알고 있는지 파악하려는 거예요.',
            },
            {
              id: 16,
              type: 'character' as const,
              character: '사쿠라',
              content:
                '"음... 그냥 뉴스에서 보는 사건들이 좀 이상하다고 생각해서요. 마치 누군가 의도적으로..."',
            },
            {
              id: 17,
              type: 'character' as const,
              character: '류진',
              content:
                '사쿠라의 말을 끊으며 "조심스럽게 말하는 게 좋겠군. 여기는 공개된 장소니까."',
            },
            {
              id: 18,
              type: 'system' as const,
              content:
                '이때 카페 밖으로 검은 정장을 입은 수상한 남자들이 지나가는 것이 보였다. 세 닌자 모두 그들의 존재를 눈치챘다.',
            },
            {
              id: 19,
              type: 'ooc' as const,
              character: '지로',
              content: '류진이 저 남자들을 알아볼까요?',
            },
            {
              id: 20,
              type: 'ooc' as const,
              character: 'GM',
              content: '인식 판정을 해보세요. 목표값은 8입니다.',
            },
            {
              id: 21,
              type: 'dice' as const,
              character: '류진',
              content: '저들이 조직 사람들인지 확인한다.',
              diceResult: {
                dice: '2d6+2',
                result: 10,
                rolls: [4, 4],
                modifier: 2,
                success: true,
                difficulty: 8,
              },
            },
            {
              id: 22,
              type: 'ooc' as const,
              character: 'GM',
              content:
                '성공입니다! 류진은 저들이 "검은 벚꽃" 조직의 감시팀이라는 것을 알아챕니다.',
            },
            {
              id: 23,
              type: 'character' as const,
              character: '류진',
              content:
                '표정이 굳어지며 작은 목소리로 "이곳은 안전하지 않다. 다른 곳으로 이동하자."',
            },
            {
              id: 24,
              type: 'character' as const,
              character: '카게마루',
              content: '류진의 말에 즉시 반응하며 일어선다. "알겠습니다."',
            },
            {
              id: 25,
              type: 'character' as const,
              character: '사쿠라',
              content:
                '상황을 파악하지 못한 채 당황하며 "어, 어디로 가시는 거예요?"',
            },
            {
              id: 26,
              type: 'ooc' as const,
              character: '하나코',
              content: '사쿠라도 따라가야 하나요? 아직 상황을 잘 모르는데...',
            },
            {
              id: 27,
              type: 'ooc' as const,
              character: 'GM',
              content:
                '사쿠라의 직감으로 판정해보세요. 이 상황이 위험한지 느낄 수 있는지요.',
            },
            {
              id: 28,
              type: 'ooc' as const,
              character: '하나코',
              content: '직감 판정이군요. 굴려볼게요!',
            },
            {
              id: 29,
              type: 'dice' as const,
              character: '사쿠라',
              content: '뭔가 위험한 상황인지 직감으로 느껴본다.',
              diceResult: {
                dice: '2d6+1',
                result: 8,
                rolls: [3, 4],
                modifier: 1,
                success: true,
                difficulty: 7,
              },
            },
            {
              id: 30,
              type: 'ooc' as const,
              character: 'GM',
              content:
                '성공! 사쿠라는 지금 상황이 심상치 않다는 것을 직감적으로 느낍니다.',
            },
            {
              id: 31,
              type: 'character' as const,
              character: '사쿠라',
              content:
                '직감적으로 위험을 느끼며 "저... 저도 같이 가도 될까요?"',
            },
            {
              id: 32,
              type: 'character' as const,
              character: '류진',
              content:
                '잠시 사쿠라를 바라보더니 고개를 끄덕인다. "따라오시오."',
            },
            {
              id: 33,
              type: 'system' as const,
              content:
                '세 닌자는 각자 다른 방향으로 카페를 빠져나갔다. 하지만 이것은 시작에 불과했다.',
            },
            {
              id: 34,
              type: 'ooc' as const,
              character: '타로',
              content: '오늘 세션은 여기서 마무리인가요?',
            },
            {
              id: 35,
              type: 'ooc' as const,
              character: 'GM',
              content:
                '네, 오늘은 여기까지 하겠습니다. 다음 세션에서는 안전한 장소에서의 본격적인 대화부터 시작할게요.',
            },
            {
              id: 36,
              type: 'ooc' as const,
              character: '하나코',
              content: '오늘 정말 재미있었어요! 다음 세션이 기대됩니다.',
            },
            {
              id: 37,
              type: 'ooc' as const,
              character: '지로',
              content:
                '저도요. 류진이 조직 사람들을 알아본 부분이 인상적이었어요.',
            },
            {
              id: 38,
              type: 'ooc' as const,
              character: 'GM',
              content: '다음 세션 준비해서 또 만나요! 수고하셨습니다.',
            },
          ],
        },
      ],
    },
  ];

  return posts.find(p => p.id === parseInt(id)) || null;
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [readingSettings, setReadingSettings] = useState({
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2,
  });
  const [activeSubPostId, setActiveSubPostId] = useState<string | null>(null);

  const post = getPost(params.id as string);

  // 키보드 단축키 설정
  const shortcuts = [
    ...createCommonShortcuts(router),
    {
      key: 'Escape',
      action: () => router.push('/'),
      description: 'ESC - 목록으로 돌아가기',
    },
    {
      key: 'p',
      action: () => {
        if (!isUnlocked) {
          passwordInputRef.current?.focus();
        }
      },
      description: 'P - 비밀번호 입력창 포커스',
    },
    {
      key: 'ArrowUp',
      action: () => {
        if (isUnlocked && post?.subPosts) {
          const currentIndex = post.subPosts.findIndex(
            sp => sp.id === activeSubPostId
          );
          if (currentIndex > 0) {
            setActiveSubPostId(post.subPosts[currentIndex - 1].id);
          }
        }
      },
      description: '↑ - 이전 세션',
    },
    {
      key: 'ArrowDown',
      action: () => {
        if (isUnlocked && post?.subPosts) {
          const currentIndex = post.subPosts.findIndex(
            sp => sp.id === activeSubPostId
          );
          if (currentIndex < post.subPosts.length - 1) {
            setActiveSubPostId(post.subPosts[currentIndex + 1].id);
          }
        }
      },
      description: '↓ - 다음 세션',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  if (!post) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card>
          <CardContent className='p-6 text-center'>
            <h2 className='text-xl font-semibold mb-2'>
              게시글을 찾을 수 없습니다
            </h2>
            <Link href='/'>
              <Button>홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === post.password) {
      setIsUnlocked(true);
      setPasswordError('');
      // 첫 번째 하위 포스트를 자동 선택
      if (post.subPosts && post.subPosts.length > 0) {
        setActiveSubPostId(post.subPosts[0].id);
      }
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
    }
  };

  const activeSubPost =
    post.subPosts?.find(sp => sp.id === activeSubPostId) || null;

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b bg-card'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center gap-4'>
            <Link href='/'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                목록으로
              </Button>
            </Link>
            <h1 className='text-xl font-semibold'>TRPG 로그 상세</h1>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-6 max-w-6xl'>
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex items-start gap-4'>
              <Image
                src={post.thumbnail || '/placeholder.svg'}
                alt={post.title}
                width={200}
                height={150}
                className='rounded-lg object-cover flex-shrink-0'
              />
              <div className='flex-1'>
                <CardTitle className='text-2xl mb-2'>{post.title}</CardTitle>
                <div className='flex flex-wrap gap-2 mb-3'>
                  {post.tags.map(tag => (
                    <Badge key={tag} variant='secondary'>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  <span>{post.date}</span>
                  <div className='flex items-center gap-1'>
                    <Eye className='w-4 h-4' />
                    <span>{post.views}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <FileText className='w-4 h-4' />
                    <span>{post.subPosts?.length || 0}개 세션</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='space-y-6'>
              {/* 공개 요약 */}
              <div>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <Unlock className='w-5 h-5' />
                  캠페인 정보
                </h3>
                <div className='bg-muted/30 p-6 rounded-lg'>
                  <SessionInfoTemplate sessionInfo={post.sessionInfo} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 세션 로그 섹션 */}
        {!isUnlocked ? (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Lock className='w-5 h-5' />
                세션 로그 (비밀글)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-lg font-medium flex items-center gap-2 mb-2'>
                    <Lock className='w-5 h-5' />
                    비밀번호가 필요합니다
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    모든 세션 로그를 보려면 비밀번호를 입력해주세요.
                  </p>
                </div>
                <form onSubmit={handlePasswordSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='password'>비밀번호</Label>
                    <Input
                      ref={passwordInputRef}
                      id='password'
                      type='password'
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder='비밀번호를 입력하세요 (단축키: P)'
                      required
                    />
                    {passwordError && (
                      <p className='text-sm text-destructive'>
                        {passwordError}
                      </p>
                    )}
                  </div>
                  <Button type='submit'>
                    <Unlock className='w-4 h-4 mr-2' />
                    잠금 해제
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className='flex gap-6'>
            {/* Sticky 세션 목록 */}
            <SubPostSidebar
              subPosts={post.subPosts || []}
              activeSubPostId={activeSubPostId}
              onSubPostSelect={setActiveSubPostId}
              onSettingsClick={() => setSettingsOpen(true)}
            />

            {/* 세션 콘텐츠 */}
            <SubPostContent
              subPost={activeSubPost}
              characters={post.sessionInfo.characters}
              settings={readingSettings}
            />
          </div>
        )}
      </div>

      {/* 읽기 설정 모달 */}
      <ReadingSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={readingSettings}
        onSettingsChange={setReadingSettings}
      />

      {/* 키보드 단축키 도움말 */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  );
}
