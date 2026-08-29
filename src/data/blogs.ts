import { existingPosts } from './posts/existingPosts';
import { aiGeneratedPosts } from './posts/aiGeneratedPosts';

export interface BlogBlock {
  type: 'paragraph' | 'heading' | 'code' | 'list' | 'blockquote' | 'table' | 'image';
  value: any;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readingTime: string;
  coverImage: string;
  excerpt: string;
  content: BlogBlock[];
}

export const blogs: BlogPost[] = [
  ...existingPosts,
  ...aiGeneratedPosts
];
