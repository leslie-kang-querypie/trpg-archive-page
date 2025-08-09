import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Post } from '@/lib/types';
import { SubPost } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postPath = path.join(process.cwd(), 'data', 'posts', `${params.id}.json`);
    
    if (!fs.existsSync(postPath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = JSON.parse(fs.readFileSync(postPath, 'utf-8'));
    
    // Load sub-posts data
    const subPostsData: SubPost[] = [];
    if (postData.subPostIds && Array.isArray(postData.subPostIds)) {
      for (const subPostId of postData.subPostIds) {
        const subPostPath = path.join(process.cwd(), 'data', 'sub-posts', params.id, `${subPostId}.json`);
        
        if (fs.existsSync(subPostPath)) {
          const subPostData = JSON.parse(fs.readFileSync(subPostPath, 'utf-8'));
          subPostsData.push(subPostData);
        }
      }
    }

    const post: Post = {
      ...postData,
      subPosts: subPostsData
    };

    return NextResponse.json(post);
  } catch (error) {
    console.error(`Failed to load post ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}