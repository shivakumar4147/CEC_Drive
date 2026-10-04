import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'cec-drive';
const API_KEY = process.env.CLOUDINARY_API_KEY || '883921746219482';
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'cec_drive_preset';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lnqnacwcgorpwrvdgdat.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'dummy_key');

if (API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Supabase auth token' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile?.role || 'student').toLowerCase();
  if (role === 'student') {
    return res.status(403).json({ error: 'Permission Denied: Students are not authorized to upload files.' });
  }

  if (!API_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: CLOUDINARY_API_SECRET missing.' });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { folder = 'cec-drive/root', upload_preset = UPLOAD_PRESET } = req.body || {};

    const paramsToSign = {
      timestamp,
      folder,
      upload_preset,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, API_SECRET);

    return res.status(200).json({
      signature,
      timestamp,
      api_key: API_KEY,
      cloud_name: CLOUD_NAME,
      folder,
      upload_preset,
    });
  } catch (err: any) {
    console.error('Vercel API signature generation error:', err);
    return res.status(500).json({ error: err.message || 'Signature generation failed' });
  }
}
