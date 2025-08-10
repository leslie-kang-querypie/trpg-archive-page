'use client';

import { Grid, List, Search, Lock, ChevronDown, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';

import { Header } from '@/components/header';
import { LoadingPage } from '@/components/ui/spinner';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { ReadingSettingsModal } from '@/components/reading-settings-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useKeyboardShortcuts,
  createCommonShortcuts,
} from '@/hooks/use-keyboard-shortcuts';
import { getAllPosts } from '@/lib/data';
import { Post } from '@/lib/types';
import { ReadingSettings } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagSelectRef = useRef<HTMLButtonElement>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRule, setSelectedRule] = useState<string>('all');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>({
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2,
    centerSystemMessages: false,
    itemsPerPage: 200,
  });

  React.useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const postsData = await getAllPosts();
        setPosts(postsData);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));
  const allRules = Array.from(
    new Set(posts.map(post => post.sessionInfo.rule))
  );
  const allPlayerCounts = Array.from(
    new Set(posts.map(post => post.sessionInfo.playerCount.toString()))
  ).sort((a, b) => parseInt(a) - parseInt(b));

  const shortcuts = [
    ...createCommonShortcuts(router),
    {
      key: '/',
      action: () => searchInputRef.current?.focus(),
      description: '/ - 검색창 포커스',
    },
    {
      key: 'v',
      action: () => setViewMode(prev => (prev === 'grid' ? 'list' : 'grid')),
      description: 'V - 뷰 모드 전환',
    },
    {
      key: 't',
      action: () => tagSelectRef.current?.click(),
      description: 'T - 태그 필터 열기',
    },
    {
      key: 'r',
      action: () => {
        setSearchQuery('');
        setSelectedTags([]);
        setSelectedRule('all');
        setSelectedPlayerCount('all');
      },
      description: 'R - 필터 초기화',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  const filteredPosts = posts.filter(post => {
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some(tag => post.tags.includes(tag));
    const matchesRule =
      selectedRule === 'all' || post.sessionInfo.rule === selectedRule;
    const matchesPlayerCount =
      selectedPlayerCount === 'all' ||
      post.sessionInfo.playerCount.toString() === selectedPlayerCount;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTags && matchesRule && matchesPlayerCount && matchesSearch;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPosts.length / settings.itemsPerPage);
  const startIndex = (currentPage - 1) * settings.itemsPerPage;
  const endIndex = startIndex + settings.itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // 필터 변경 시 첫 페이지로 이동
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags, selectedRule, selectedPlayerCount, settings.itemsPerPage]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Header title='TRPG 로그 아카이브' />

      <div className='container mx-auto px-4 py-6 max-w-6xl'>
        {/* Controls */}
        <div className='flex flex-col md:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              ref={searchInputRef}
              placeholder='로그 제목이나 내용으로 검색... (단축키: /)'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={selectedRule} onValueChange={setSelectedRule}>
            <SelectTrigger className='w-full md:w-48'>
              <SelectValue placeholder='룰 선택' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>모든 룰</SelectItem>
              {allRules.map(rule => (
                <SelectItem key={rule} value={rule}>
                  {rule}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedPlayerCount}
            onValueChange={setSelectedPlayerCount}
          >
            <SelectTrigger className='w-full md:w-32'>
              <SelectValue placeholder='인원 선택' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>모든 인원</SelectItem>
              {allPlayerCounts.map(count => (
                <SelectItem key={count} value={count}>
                  {count}인
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                ref={tagSelectRef}
                variant='outline'
                className='w-full md:w-48 justify-between'
              >
                {selectedTags.length === 0
                  ? '태그 선택'
                  : selectedTags.length === 1
                    ? selectedTags[0]
                    : `${selectedTags.length}개 태그 선택`}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-48'>
              <div className='space-y-4'>
                {allTags.map(tag => (
                  <div key={tag} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedTags(prev => [...prev, tag]);
                        } else {
                          setSelectedTags(prev => prev.filter(t => t !== tag));
                        }
                      }}
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      {tag}
                    </label>
                  </div>
                ))}
                {selectedTags.length > 0 && (
                  <>
                    <hr className='my-2' />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setSelectedTags([])}
                      className='w-full'
                    >
                      모든 태그 해제
                    </Button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className='flex gap-2'>
            <div className='flex border rounded-lg'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='rounded-r-none'
              >
                <Grid className='w-4 h-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='rounded-l-none'
              >
                <List className='w-4 h-4' />
              </Button>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className='w-4 h-4' />
            </Button>
          </div>
        </div>

        {/* 결과 정보 */}
        <div className='mb-4 flex justify-between items-center'>
          <div className='text-sm text-muted-foreground'>
            총 {filteredPosts.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)}개 표시
          </div>
          {totalPages > 1 && (
            <div className='text-sm text-muted-foreground'>
              {currentPage} / {totalPages} 페이지
            </div>
          )}
        </div>

        {/* Posts */}
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {paginatedPosts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className='hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden pt-0'>
                  <div className='relative'>
                    <Image
                      src={post.thumbnail || '/placeholder.svg'}
                      alt={post.title}
                      width={300}
                      height={200}
                      className='w-full h-48 object-cover'
                    />
                    {post.isPrivate && (
                      <div className='absolute top-2 right-2 bg-black/70 text-white p-1 rounded'>
                        <Lock className='w-4 h-4' />
                      </div>
                    )}
                  </div>
                  <CardHeader className='pb-2'>
                    <div className='flex flex-wrap gap-1 mb-2'>
                      <Badge variant='default' className='text-xs'>
                        {post.sessionInfo.rule}
                      </Badge>
                      <Badge variant='outline' className='text-xs'>
                        {post.sessionInfo.playerCount}명
                      </Badge>
                    </div>
                    <CardTitle className='text-lg line-clamp-2'>
                      {post.title}
                    </CardTitle>
                    <CardDescription className='line-clamp-4'>
                      {post.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='mt-auto'>
                    <div className='flex flex-wrap gap-1 mb-3'>
                      {post.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant='secondary'
                          className='text-xs'
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      <span>{post.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {paginatedPosts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className='hover:shadow-md transition-shadow cursor-pointer'>
                  <CardContent className='px-8 py-2'>
                    <div className='flex gap-8'>
                      <div className='relative flex-shrink-0'>
                        <Image
                          src={post.thumbnail || '/placeholder.svg'}
                          alt={post.title}
                          width={120}
                          height={80}
                          className='w-30 h-20 object-cover rounded'
                        />
                        {post.isPrivate && (
                          <div className='absolute top-1 right-1 bg-black/70 text-white p-0.5 rounded'>
                            <Lock className='w-3 h-3' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-wrap gap-1 mb-2'>
                          <Badge variant='default' className='text-xs'>
                            {post.sessionInfo.rule}
                          </Badge>
                          <Badge variant='outline' className='text-xs'>
                            {post.sessionInfo.playerCount}명
                          </Badge>
                        </div>
                        <h3 className='font-semibold text-lg mb-1 line-clamp-1'>
                          {post.title}
                        </h3>
                        <p className='text-muted-foreground text-sm mb-3 line-clamp-2'>
                          {post.summary}
                        </p>
                        <div className='flex gap-2 justify-between'>
                          <div className='flex flex-wrap gap-1'>
                            {post.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant='secondary'
                                className='text-xs'
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            <span>{post.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center gap-2 mt-8'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='w-4 h-4' />
              이전
            </Button>
            
            <div className='flex gap-1'>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setCurrentPage(pageNum)}
                    className='w-10'
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              다음
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        )}
      </div>

      {/* 읽기 설정 모달 */}
      <ReadingSettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* 키보드 단축키 도움말 */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </>
  );
}
