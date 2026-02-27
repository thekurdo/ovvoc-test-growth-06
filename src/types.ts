export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published: boolean;
  createdAt: string;
}

export interface CreateArticleBody {
  title: string;
  content: string;
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
