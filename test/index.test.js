const assert = require('assert');
const app = require('../dist/index').default;
const store = require('../dist/store');

async function runTests() {
  const server = await new Promise(resolve => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try { await fn(); passed++; }
    catch (err) { failed++; console.error(`FAIL: ${name} — ${err.message}`); }
  }

  store.reset();

  await test('GET /health', async () => {
    const res = await fetch(`${base}/health`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.status, 'ok');
  });

  await test('GET /api/articles returns empty', async () => {
    const res = await fetch(`${base}/api/articles`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.ok(d.success);
    assert.strictEqual(d.data.length, 0);
  });

  await test('POST /api/articles creates article', async () => {
    const res = await fetch(`${base}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hello World', content: 'First post', tags: ['intro'] }),
    });
    assert.strictEqual(res.status, 201);
    const d = await res.json();
    assert.strictEqual(d.data.title, 'Hello World');
    assert.strictEqual(d.data.slug, 'hello-world');
  });

  await test('GET /api/articles/:id returns article', async () => {
    const res = await fetch(`${base}/api/articles/1`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.data.id, 1);
  });

  await test('GET /api/articles (optional id omitted) lists all', async () => {
    const res = await fetch(`${base}/api/articles`);
    const d = await res.json();
    assert.strictEqual(d.data.length, 1);
  });

  await test('GET /api/articles/by-slug/:slug', async () => {
    const res = await fetch(`${base}/api/articles/by-slug/hello-world`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.data.title, 'Hello World');
  });

  await test('PUT /api/articles/:id updates', async () => {
    const res = await fetch(`${base}/api/articles/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: true }),
    });
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.data.published, true);
  });

  await test('GET /api/search?q=hello', async () => {
    const res = await fetch(`${base}/api/search?q=hello`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.data.length, 1);
  });

  await test('GET /api/help/* returns help', async () => {
    const res = await fetch(`${base}/api/help/articles/create`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.ok(d.data.message);
  });

  await test('DELETE /api/articles/:id', async () => {
    const res = await fetch(`${base}/api/articles/1`, { method: 'DELETE' });
    assert.strictEqual(res.status, 200);
  });

  await test('GET /unknown returns 404', async () => {
    const res = await fetch(`${base}/unknown`);
    assert.strictEqual(res.status, 404);
  });

  server.close();
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => { console.error(err); process.exit(1); });
