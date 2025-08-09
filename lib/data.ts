import { Post } from '@/lib/types';

export async function getAllPosts(): Promise<Post[]> {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to load posts:', error);
    return [];
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch post');
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to load post ${id}:`, error);
    return null;
  }
}