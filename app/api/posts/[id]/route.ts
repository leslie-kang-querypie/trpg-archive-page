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
    const postDir = path.join(process.cwd(), 'data', 'posts', params.id);
    const mainPostPath = path.join(postDir, 'main.json');
    
    if (!fs.existsSync(postDir) || !fs.existsSync(mainPostPath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = JSON.parse(fs.readFileSync(mainPostPath, 'utf-8'));
    
    // Load all json files in the post directory as sub-posts (except main.json)
    const subPostsData: SubPost[] = [];
    const files = fs.readdirSync(postDir).filter(file => 
      file.endsWith('.json') && file !== 'main.json'
    );

    for (const file of files) {
      const subPostPath = path.join(postDir, file);
      const subPostData = JSON.parse(fs.readFileSync(subPostPath, 'utf-8'));
      subPostsData.push(subPostData);
    }

    // Sort sub-posts by their filename (numeric order)
    subPostsData.sort((a, b) => {
      const aNum = parseInt(files.find(f => f.includes(a.id || '0')), 10) || 0;
      const bNum = parseInt(files.find(f => f.includes(b.id || '0')), 10) || 0;
      return aNum - bNum;
    });

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