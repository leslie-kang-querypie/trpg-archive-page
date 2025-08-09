'use client';

import { Grid, List, Search, Plus, Eye, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';

import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useKeyboardShortcuts,
  createCommonShortcuts,
} from '@/hooks/use-keyboard-shortcuts';
import { getAllPosts } from '@/lib/data';
import { Post } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagSelectRef = useRef<HTMLButtonElement>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
        setSelectedTag('all');
      },
      description: 'R - 필터 초기화',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  const filteredPosts = posts.filter(post => {
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b bg-card'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>TRPG 로그 아카이브</h1>
            <Link href='/write'>
              <Button>
                <Plus className='w-4 h-4 mr-2' />새 로그 작성
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-6'>
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

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger ref={tagSelectRef} className='w-full md:w-48'>
              <SelectValue placeholder='태그 선택' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>모든 태그</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        </div>

        {/* Posts */}
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredPosts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className='hover:shadow-lg transition-shadow cursor-pointer h-full'>
                  <div className='relative'>
                    <Image
                      src={post.thumbnail || '/placeholder.svg'}
                      alt={post.title}
                      width={300}
                      height={200}
                      className='w-full h-48 object-cover rounded-t-lg'
                    />
                    {post.isPrivate && (
                      <div className='absolute top-2 right-2 bg-black/70 text-white p-1 rounded'>
                        <Lock className='w-4 h-4' />
                      </div>
                    )}
                  </div>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg line-clamp-2'>
                      {post.title}
                    </CardTitle>
                    <CardDescription className='line-clamp-2'>
                      {post.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                    <div className='flex items-center justify-between text-sm text-muted-foreground'>
                      <span>{post.date}</span>
                      <div className='flex items-center gap-2'>
                        <Eye className='w-4 h-4' />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredPosts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className='hover:shadow-md transition-shadow cursor-pointer'>
                  <CardContent className='p-4'>
                    <div className='flex gap-4'>
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
                        <h3 className='font-semibold text-lg mb-1 line-clamp-1'>
                          {post.title}
                        </h3>
                        <p className='text-muted-foreground text-sm mb-2 line-clamp-2'>
                          {post.summary}
                        </p>
                        <div className='flex flex-wrap gap-1 mb-2'>
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
                        <div className='flex items-center justify-between text-sm text-muted-foreground'>
                          <span>{post.date}</span>
                          <div className='flex items-center gap-1'>
                            <Eye className='w-4 h-4' />
                            <span>{post.views}</span>
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
      </div>

      {/* 키보드 단축키 도움말 */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  );
}
