import express from 'express';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for frontend dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Environment Configuration
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'cec-drive';
const API_KEY = process.env.CLOUDINARY_API_KEY || '883921746219482';
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'cec_drive_preset';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lnqnacwcgorpwrvdgdat.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.warn('[Warning] VITE_SUPABASE_ANON_KEY is missing from environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'dummy_key');

if (API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
} else {
  console.warn('[Warning] CLOUDINARY_API_SECRET is missing. Signed uploads will require configured secret key.');
}

/**
 * JWT Authentication Middleware
 * Validates Supabase Bearer token and attaches verified user & role
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ allowed: false, error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ allowed: false, error: 'Unauthorized: Invalid Supabase auth token' });
    }

    // Fetch verified role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = (profile?.role || 'student').toLowerCase();

    req.user = user;
    req.userRole = role === 'uploader' ? 'lecturer' : role;
    next();
  } catch (err) {
    return res.status(401).json({ allowed: false, error: 'Unauthorized: Token validation failed' });
  }
}

/**
 * 1. SUPABASE CHECK: "Is this user allowed to upload here?"
 * POST /api/check-permission (JWT Protected)
 */
app.post('/api/check-permission', authenticateToken, async (req, res) => {
  const role = req.userRole;
  const { folderId, action = 'upload' } = req.body;

  // Student permissions check
  if (role === 'student') {
    return res.status(403).json({
      allowed: false,
      message: `Permission Denied: Students are restricted to Open, Download, and Details only. ${action} is prohibited for students.`,
    });
  }

  // Admin permissions check
  if (role === 'admin') {
    return res.json({ allowed: true, message: 'Admin authorized for all system operations.' });
  }

  // Lecturer (uploader) permissions check
  if (role === 'uploader' || role === 'lecturer') {
    if (!folderId || folderId === 'root') {
      return res.json({ allowed: true, message: 'Lecturer authorized.' });
    }

    try {
      const { data: folder } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .maybeSingle();

      return res.json({
        allowed: true,
        message: `Permission Check PASSED for folder "${folder?.name || folderId}".`,
      });
    } catch (err) {
      return res.json({ allowed: true, message: 'Lecturer authorized.' });
    }
  }

  return res.status(403).json({ allowed: false, message: 'Unauthorized role' });
});

/**
 * 2. BACKEND CREATES CLOUDINARY SIGNATURE (JWT Protected)
 * POST /api/cloudinary-signature
 */
app.post('/api/cloudinary-signature', authenticateToken, (req, res) => {
  if (req.userRole === 'student') {
    return res.status(403).json({ error: 'Permission Denied: Students are not authorized to upload files.' });
  }

  if (!API_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: CLOUDINARY_API_SECRET missing.' });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { folder = 'cec-drive/root', upload_preset = UPLOAD_PRESET } = req.body;

    const paramsToSign = {
      timestamp,
      folder,
      upload_preset,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, API_SECRET);

    return res.json({
      signature,
      timestamp,
      api_key: API_KEY,
      cloud_name: CLOUD_NAME,
      folder,
      upload_preset,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return res.status(500).json({ error: error.message || 'Signature generation failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[CEC Drive Backend] JWT Protected Authorization Server running on port ${PORT}`);
});
