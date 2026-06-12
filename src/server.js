const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY not set — dashboard will fail to load data.');
}

// Serve the dashboard with env vars injected
app.get('/', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  const injected = html
    .replace('__SUPABASE_URL__', SUPABASE_URL || '')
    .replace('__SUPABASE_ANON_KEY__', SUPABASE_ANON_KEY || '');
  res.setHeader('Content-Type', 'text/html');
  res.send(injected);
});

// Static assets (css, fonts, etc if needed later)
app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
  console.log(`✅  NPS Dashboard running on port ${PORT}`);
});
