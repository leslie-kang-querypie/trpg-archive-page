'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { FileText, Edit3, Info, Menu, X, BookOpen } from 'lucide-react';

const sidebarItems = [
  {
    href: '/write/session',
    label: '포스트 작성',
    icon: BookOpen,
    description: 'TRPG 캠페인 포스트 작성',
  },
  {
    href: '/write/parse',
    label: '로그 파싱',
    icon: FileText,
    description: 'Roll20 채팅 로그 파싱',
  },
  {
    href: '/write/edit',
    label: '로그 편집',
    icon: Edit3,
    description: 'TRPG 로그 편집 및 조정',
  },
  {
    href: '/write/info',
    label: '작성 가이드',
    icon: Info,
    description: '작성 도구 사용법',
  },
];

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Header title='TRPG 작성 도구' showBackButton />

      <div className='flex h-[calc(100vh-64px)] bg-background'>
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className='flex flex-col h-full'>
            {/* Sidebar header */}
            <div className='flex items-center justify-between p-4 border-b'>
              <h2 className='text-lg font-semibold'>작성 도구</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSidebarOpen(false)}
                className='lg:hidden'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            {/* Navigation items */}
            <nav className='flex-1 p-4 space-y-2'>
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                      isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:text-accent-foreground'
                    )}
                  >
                    <Icon className='h-4 w-4' />
                    <div className='flex-1'>
                      <div className='font-medium'>{item.label}</div>
                      <div className='text-xs text-muted-foreground'>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className='flex-1 flex flex-col min-w-0'>
          {/* Mobile header */}
          <header className='lg:hidden border-b bg-card p-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className='h-4 w-4' />
              <span className='ml-2'>메뉴</span>
            </Button>
          </header>

          {/* Page content */}
          <main className='flex-1 overflow-auto'>{children}</main>
        </div>
      </div>
    </>
  );
}
