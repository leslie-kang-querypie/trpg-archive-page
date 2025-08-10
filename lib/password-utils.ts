import { createHash } from 'crypto';

export function hashPassword(password: string, postId?: number): string {
  const salt = postId ? `trpg-archive-${postId}` : 'trpg-archive';
  return createHash('sha256').update(password + salt).digest('hex');
}

export function verifyPassword(inputPassword: string, hashedPassword: string, postId?: number): boolean {
  const inputHash = hashPassword(inputPassword, postId);
  return inputHash === hashedPassword;
}