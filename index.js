const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Connection (Zinachukuliwa kutoka Render Environment Variables)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Root & Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Online', app: 'Techboy TV API', time: new Date() });
});

// 2. AUTHENTICATION APIs
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ access_token: data.session?.access_token || 'verified', user: data.user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ access_token: data.session.access_token, user: data.user });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Maelekezo yametumwa kwenye barua pepe yako.' });
});

// 3. CONTENT STREAMING APIs (Zinachota moja kwa moja Supabase tables)
app.get('/api/hero', async (req, res) => {
  const { data, error } = await supabase.from('hero_slides').select('*').order('order_index', { ascending: true });
  if (error) return res.json([]);
  res.json(data || []);
});

app.get('/api/movies', async (req, res) => {
  const { data, error } = await supabase.from('movies').select('*');
  if (error) return res.json([]);
  res.json(data || []);
});

app.get('/api/series', async (req, res) => {
  const { data, error } = await supabase.from('series').select('*');
  if (error) return res.json([]);
  res.json(data || []);
});

app.get('/api/sports', async (req, res) => {
  const { data, error } = await supabase.from('sports').select('*');
  if (error) return res.json([]);
  res.json(data || []);
});

app.get('/api/live', async (req, res) => {
  const { data, error } = await supabase.from('live_channels').select('*');
  if (error) return res.json([]);
  res.json(data || []);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Techboy TV Server inafanya kazi kwenye port ${PORT}`);
});
