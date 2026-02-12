import { Article } from './types';

const articles: Article[] = [];
let nextId = 1;

export function getAll(): Article[] {
  return articles.slice();
}

export function getById(id: number): Article | undefined {
  return articles.find(a => a.id === id);
}

export function getBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}

export function create(title: string, content: string, tags: string[] = []): Article {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const article: Article = {
    id: nextId++,
    title,
    slug,
    content,
    tags,
    published: false,
    createdAt: new Date().toISOString(),
  };
  articles.push(article);
  return article;
}

export function update(id: number, updates: Partial<Article>): Article | null {
  const article = getById(id);
  if (!article) return null;
  Object.assign(article, updates);
  return article;
}

export function remove(id: number): boolean {
  const idx = articles.findIndex(a => a.id === id);
  if (idx === -1) return false;
  articles.splice(idx, 1);
  return true;
}

export function search(query: string): Article[] {
  const q = query.toLowerCase();
  return articles.filter(a =>
    a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
  );
}

export function reset(): void {
  articles.length = 0;
  nextId = 1;
}
