export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Repo {
  id: string; // usually owner/name
  name: string;
  owner: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  categoryId: string;
  starredAt: string;
}

export interface StarGazerState {
  categories: Category[];
  repos: Repo[];
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS'
}

export interface AISuggestion {
  categoryName: string;
  colorHex: string;
  reasoning: string;
}
