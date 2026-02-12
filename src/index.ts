import express from 'express';
import routes from './routes';

const app = express();
app.use(express.json());

// Health check using req.host (renamed to req.hostname in Express 5)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', host: req.host });
});

// API routes
app.use('/api', routes);

// 404 catch-all — bare * breaks in Express 5
app.all('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Server on :3000'));
}

export default app;
