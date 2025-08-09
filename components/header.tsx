'use client';

import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showParseButton?: boolean;
}

export function Header({ title, showBackButton = false, showParseButton = false }: HeaderProps) {
  return (
    <header className='border-b bg-card'>
      <div className='container mx-auto px-4 py-4 max-w-6xl'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            {showBackButton && (
              <Link href='/'>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  목록으로
                </Button>
              </Link>
            )}
            <h1 className={showBackButton ? 'text-xl font-semibold' : 'text-2xl font-bold'}>
              {title}
            </h1>
          </div>
          {showParseButton && (
            <Link href='/parse'>
              <Button>
                <Plus className='w-4 h-4 mr-2' />
                로그 파서
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}