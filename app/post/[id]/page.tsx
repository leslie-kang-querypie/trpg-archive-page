'use client';

import { Lock, Unlock, FileText, InfoIcon } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';

import { Header } from '@/components/header';
import { LoadingPage } from '@/components/ui/spinner';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { ReadingSettingsModal } from '@/components/reading-settings-modal';

// 컴포넌트 imports
import { SessionInfoTemplate } from '@/components/session-info-template';
import { SubPostContent } from '@/components/sub-post-content';
import { SubPostNavigation } from '@/components/sub-post-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useKeyboardShortcuts,
  createCommonShortcuts,
} from '@/hooks/use-keyboard-shortcuts';
import { getPost } from '@/lib/data';
import { verifyPassword } from '@/lib/password-utils';
import { Post } from '@/lib/types';
import { ReadingSettings } from '@/types';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [oocUnlocked, setOocUnlocked] = useState(false);
  const [oocPasswordInput, setOocPasswordInput] = useState('');
  const [oocError, setOocError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2,
    centerSystemMessages: false,
    itemsPerPage: 200,
  });
  const [activeSubPostId, setActiveSubPostId] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // Load post data
  React.useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const postData = await getPost(params.id as string);
        setPost(postData);
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params.id]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (post && verifyPassword(passwordInput, post.password, post.id)) {
      setIsUnlocked(true);
      setError('');
      if (post.subPosts.length > 0) {
        setActiveSubPostId(post.subPosts[0].id);
      }
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPasswordInput('');
    }
  };

  const handleOocPasswordSubmit = (password: string) => {
    if (!post) return;

    if (verifyPassword(password, post.oocPassword || post.password, post.id)) {
      setOocUnlocked(true);
      setOocError('');
      setOocPasswordInput(''); // 비밀번호 입력 필드 초기화
    } else {
      setOocError('사담 비밀번호가 올바르지 않습니다.');
      setOocPasswordInput('');
    }
  };

  const activeSubPost =
    post?.subPosts.find(sp => sp.id === activeSubPostId) || null;

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
    {
      key: 's',
      action: () => {
        if (isUnlocked) {
          setSettingsOpen(true);
        }
      },
      description: 'S - 읽기 설정',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  if (loading) {
    return <LoadingPage />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <Header title='TRPG 로그 상세' showBackButton />

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
                <div className='text-sm text-muted-foreground'>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <InfoIcon className='w-5 h-5' />
                  세션 정보
                </h3>
                <div className='bg-muted/30 p-6 rounded-lg'>
                  <SessionInfoTemplate sessionInfo={post.sessionInfo} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {post.isPrivate && !isUnlocked ? (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 mb-2'>
                <Lock className='w-5 h-5' />
                세션 로그
              </CardTitle>
              <CardDescription className='text-sm text-muted-foreground'>
                이 세션 로그는 잠겨 있습니다. 열람하기 위해서는 비밀번호를
                입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className='flex gap-2'>
                <div className='flex flex-col gap-2 grow-1'>
                  <Input
                    ref={passwordInputRef}
                    id='password'
                    type='password'
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder='비밀번호를 입력하세요 (단축키: P)'
                    required
                  />
                  {error && <p className='text-sm text-destructive'>{error}</p>}
                </div>
                <Button type='submit'>
                  <Unlock className='w-4 h-4 mr-2' />
                  잠금 해제
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : !post.isPrivate && !isUnlocked ? (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 mb-2'>
                <FileText className='w-5 h-5' />
                세션 로그
              </CardTitle>
              <CardDescription className='text-sm text-muted-foreground'>
                아래 버튼을 클릭하여 세션 로그를 볼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  setIsUnlocked(true);
                  if (post.subPosts.length > 0) {
                    setActiveSubPostId(post.subPosts[0].id);
                  }
                }}
              >
                <FileText className='w-4 h-4 mr-2' />
                세션 로그 보기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            <SubPostNavigation
              subPosts={post.subPosts || []}
              activeSubPostId={activeSubPostId}
              onSubPostSelect={setActiveSubPostId}
            />

            <SubPostContent
              subPost={activeSubPost}
              characters={post.sessionInfo.characters}
              settings={readingSettings}
              oocUnlocked={oocUnlocked}
              onOocPasswordSubmit={handleOocPasswordSubmit}
              oocError={oocError}
              onSettingsClick={() => setSettingsOpen(true)}
              hasOocPassword={!!post.oocPassword}
            />
          </div>
        )}
      </div>

      <ReadingSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={readingSettings}
        onSettingsChange={setReadingSettings}
      />

      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </>
  );
}
