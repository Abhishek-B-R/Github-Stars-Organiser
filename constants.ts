import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_tools', name: 'Tools', color: '#7ee787' },
  { id: 'cat_ui', name: 'UI/UX', color: '#db61a2' },
  { id: 'cat_learning', name: 'Learning', color: '#d2a8ff' },
  { id: 'cat_backend', name: 'Backend', color: '#ffa657' },
];

export const MOCK_REPOS = [
  {
    id: 'facebook/react',
    name: 'react',
    owner: 'facebook',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    url: 'https://github.com/facebook/react',
    language: 'JavaScript',
    stars: 205000,
    categoryId: 'cat_ui',
    starredAt: new Date().toISOString()
  },
  {
    id: 'microsoft/typescript',
    name: 'TypeScript',
    owner: 'microsoft',
    description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    url: 'https://github.com/microsoft/typescript',
    language: 'TypeScript',
    stars: 95000,
    categoryId: 'cat_tools',
    starredAt: new Date().toISOString()
  }
];

export const EXTENSION_ID = 'stargazer-extension';
