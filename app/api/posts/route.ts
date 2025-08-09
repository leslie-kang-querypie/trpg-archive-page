import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Post } from '@/lib/types';

export async function GET() {
  try {
    const postsDir = path.join(process.cwd(), 'data', 'posts');
    
    if (!fs.existsSync(postsDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.json'));
    const posts: Post[] = [];

    for (const file of files) {
      const postPath = path.join(postsDir, file);
      const postData = JSON.parse(fs.readFileSync(postPath, 'utf-8'));
      
      // Don't load sub-posts content for list view
      posts.push({
        ...postData,
        subPosts: []
      });
    }

    const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(sortedPosts);
  } catch (error) {
    console.error('Failed to load posts:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}