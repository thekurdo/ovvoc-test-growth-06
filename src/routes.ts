import { Router, Request, Response } from 'express';
import * as store from './store';
import { ApiResponse, Article, CreateArticleBody } from './types';

const router = Router();

// List or get by optional id — :id? breaks in Express 5
router.get('/articles/:id?', (req: Request, res: Response) => {
  const id = req.params.id;
  if (id) {
    const article = store.getById(parseInt(id));
    if (!article) {
      const resp: ApiResponse<null> = { success: false, error: 'Not found' };
      return res.status(404).json(resp);
    }
    const resp: ApiResponse<Article> = { success: true, data: article };
    return res.json(resp);
  }
  const resp: ApiResponse<Article[]> = { success: true, data: store.getAll() };
  res.json(resp);
});

// Get by slug — :slug? optional breaks in Express 5
router.get('/articles/by-slug/:slug?', (req: Request, res: Response) => {
  const slug = req.params.slug;
  if (!slug) {
    return res.status(400).json({ success: false, error: 'slug required' });
  }
  const article = store.getBySlug(slug);
  if (!article) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  res.json({ success: true, data: article });
});

// Create article
router.post('/articles', (req: Request, res: Response) => {
  const body = req.body as CreateArticleBody;
  if (!body.title || !body.content) {
    return res.status(400).json({ success: false, error: 'title and content required' });
  }
  const article = store.create(body.title, body.content, body.tags);
  res.status(201).json({ success: true, data: article });
});

// Update article
router.put('/articles/:id', (req: Request, res: Response) => {
  const article = store.update(parseInt(req.params.id), req.body);
  if (!article) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  res.json({ success: true, data: article });
});

// Delete article
router.delete('/articles/:id', (req: Request, res: Response) => {
  const removed = store.remove(parseInt(req.params.id));
  if (!removed) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  res.json({ success: true, data: { deleted: true } });
});

// Search
router.get('/search', (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const results = store.search(q);
  res.json({ success: true, data: results });
});

// Catch-all for API help — /help/* wildcard breaks in Express 5
router.get('/help/*', (req: Request, res: Response) => {
  res.json({ success: true, data: { topic: req.url, message: 'API help' } });
});

export default router;
