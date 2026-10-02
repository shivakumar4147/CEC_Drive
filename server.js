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
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'cec_drive_secret_key_mock_98231';
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'cec_drive_preset';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lnqnacwcgorpwrvdgdat.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucW5hY3djZ29ycHdydmRnZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDMyODYsImV4cCI6MjEwNjMxOTI4Nn0.AT_jGVGp9zOQd_Rt1BA_mcJ6_lZFOuXaqktDlQ8ySc0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

/**
 * 1. SUPABASE CHECK: "Is this lecturer allowed to upload here?"
 * POST /api/check-permission
 * Request payload: { role, folderId, department, course, action }
 */
app.post('/api/check-permission', async (req, res) => {
  const { role, folderId, department = 'CSE', course, action = 'upload' } = req.body;

  // Student permissions check
  if (role === 'student') {
    return res.status(403).json({
      allowed: false,
      message: `Permission Denied: Students are restricted to Open, Download, and Details only. ${action} operation is not allowed for students.`,
    });
  }

  // Admin permissions check
  if (role === 'admin') {
    return res.json({ allowed: true, message: 'Admin authorized for all system operations.' });
  }

  // Lecturer (uploader) permissions check
  if (role === 'uploader' || role === 'lecturer') {
    if (!folderId || folderId === 'root') {
      // Allowed in root or unassigned for general uploads
      return res.json({ allowed: true, message: 'Lecturer authorized.' });
    }

    // Check folder details in Supabase
    try {
      const { data: folder, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .maybeSingle();

      if (error) {
        console.warn('Supabase folder check query warning:', error.message);
      }

      // Check authorization against lecturer's department / assigned course
      // Example: 'dept-cse', 'sec-cse-a', 'folder-dbms', 'folder-cn'
      const folderNameLower = (folder?.name || folderId || '').toLowerCase();
      const userDeptLower = (department || 'cse').toLowerCase();
      const userCourseLower = (course || '').toLowerCase();

      let isAuthorized = true;
      let rejectReason = '';

      // Check department restriction if folder indicates specific department (e.g. ECE, ME, AI&DS)
      if (
        (folderId.includes('ece') || folderNameLower.includes('ece')) &&
        userDeptLower !== 'ece' &&
        !userCourseLower.includes('ece')
      ) {
        isAuthorized = false;
        rejectReason = `Lecturer (${department}) is not authorized for ECE department folder.`;
      } else if (
        (folderId.includes('me') || folderNameLower.includes('me')) &&
        userDeptLower !== 'me' &&
        !userCourseLower.includes('me')
      ) {
        isAuthorized = false;
        rejectReason = `Lecturer (${department}) is not authorized for ME department folder.`;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          allowed: false,
          message: `Supabase Permission Check: "Is this lecturer allowed to upload here?" -> NO. ${rejectReason}`,
        });
      }

      return res.json({
        allowed: true,
        message: `Supabase Permission Check: "Is this lecturer allowed to upload here?" -> YES. Authorized for folder "${folder?.name || folderId}".`,
      });
    } catch (err) {
      return res.json({ allowed: true, message: 'Lecturer authorized.' });
    }
  }

  return res.status(403).json({ allowed: false, message: 'Unauthorized role' });
});

/**
 * 2. BACKEND CREATES CLOUDINARY SIGNATURE
 * POST /api/cloudinary-signature
 * Request payload: { folder, upload_preset, resource_type }
 */
app.post('/api/cloudinary-signature', (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { folder = 'cec-drive/root', upload_preset = UPLOAD_PRESET } = req.body;

    // Parameters to sign
    const paramsToSign = {
      timestamp,
      folder,
      upload_preset,
    };

    // Generate Cloudinary HMAC-SHA256 signature using API Secret
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
  console.log(`[CEC Drive Backend] Cloudinary Signature & Supabase Authorization Server running on port ${PORT}`);
});
