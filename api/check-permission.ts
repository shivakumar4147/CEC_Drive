import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lnqnacwcgorpwrvdgdat.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'dummy_key');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ allowed: false, error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ allowed: false, error: 'Unauthorized: Invalid Supabase auth token' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile?.role || 'student').toLowerCase();
  const { folderId, action = 'upload' } = req.body || {};

  if (role === 'student') {
    return res.status(403).json({
      allowed: false,
      message: `Permission Denied: Students are restricted to Open, Download, and Details only. ${action} is prohibited for students.`,
    });
  }

  if (role === 'admin') {
    return res.status(200).json({ allowed: true, message: 'Admin authorized for all system operations.' });
  }

  if (role === 'uploader' || role === 'lecturer') {
    if (!folderId || folderId === 'root') {
      return res.status(200).json({ allowed: true, message: 'Lecturer authorized.' });
    }

    try {
      const { data: folder } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .maybeSingle();

      return res.status(200).json({
        allowed: true,
        message: `Permission Check PASSED for folder "${folder?.name || folderId}".`,
      });
    } catch (err) {
      return res.status(200).json({ allowed: true, message: 'Lecturer authorized.' });
    }
  }

  return res.status(403).json({ allowed: false, message: 'Unauthorized role' });
}
