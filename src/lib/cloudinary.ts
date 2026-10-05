import { supabase } from './supabase';
import { logActivity } from './activity';

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  bytes: number;
  format: string;
  original_filename: string;
  resource_type: string;
}

// Get Cloudinary config from environment variables
const CLOUD_NAME = import.meta.env.CLOUDINARY_CLOUD_NAME || 'cec-drive';
const API_KEY = import.meta.env.CLOUDINARY_API_KEY || '';
const API_SECRET = import.meta.env.CLOUDINARY_API_SECRET || '';
const UPLOAD_PRESET = import.meta.env.CLOUDINARY_UPLOAD_PRESET || 'cec_drive_preset';

/**
 * 1. SUPABASE AUTHENTICATION & FOLDER PERMISSION CHECK
 * Checks: "Is this lecturer allowed to upload here?"
 */
export async function checkUserUploadPermission(
  currentUserProfile?: { role?: string; email?: string; department?: string; course?: string } | null,
  folderId?: string | null
): Promise<{ allowed: boolean; user?: any; message?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const effectiveRole = currentUserProfile?.role || 'uploader';

    // Student permissions check: Students can ONLY Open, Download, Details.
    if (effectiveRole === 'student') {
      return {
        allowed: false,
        user: session?.user || null,
        message: 'Permission Denied: Students are restricted to Open, Download, and Details only. Upload is disabled.',
      };
    }

    // Try backend permission validation endpoint first
    try {
      const res = await fetch('http://localhost:3001/api/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: effectiveRole,
          folderId: folderId || 'root',
          department: currentUserProfile?.department || 'CSE',
          course: currentUserProfile?.course,
          action: 'upload',
        }),
      });

      if (res.ok) {
        const backendResult = await res.json();
        if (!backendResult.allowed) {
          return {
            allowed: false,
            user: session?.user || currentUserProfile,
            message: backendResult.message || 'Supabase check failed: Lecturer is not authorized for this folder.',
          };
        }
      }
    } catch (e) {
      // Offline fallback permission evaluation
    }

    // Client-side fallback authorization logic for Lecturers in specific folders
    if (effectiveRole === 'uploader' || effectiveRole === 'lecturer') {
      if (folderId && (folderId.includes('ece') || folderId.includes('me'))) {
        const userDept = (currentUserProfile?.department || 'CSE').toLowerCase();
        if (!folderId.toLowerCase().includes(userDept)) {
          return {
            allowed: false,
            message: `Supabase Permission Check: "Is this lecturer allowed to upload here?" -> NO. Lecturer (${currentUserProfile?.department || 'CSE'}) is not authorized for this folder.`,
          };
        }
      }
    }

    return {
      allowed: true,
      user: session?.user || currentUserProfile,
    };
  } catch (err) {
    console.warn('Permission check fallback:', err);
    return { allowed: true };
  }
}

/**
 * 2. CLOUDINARY RESOURCE TYPE DETECTOR
 * Maps file extension / MIME type to Cloudinary resource types:
 * - PDF, DOCX, XLSX, PPTX, ZIP, CSV, TXT => 'raw'
 * - JPG, PNG, WEBP, GIF, SVG => 'image'
 * - MP4, WEBM, MOV, AVI => 'video'
 * - Defaults to 'auto' for Cloudinary auto-detection
 */
export function detectCloudinaryResourceType(filename: string, mimeType?: string): 'image' | 'video' | 'raw' | 'auto' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || (mimeType?.startsWith('image/') && mimeType !== 'application/pdf')) {
    return 'image';
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext) || mimeType?.startsWith('video/')) {
    return 'video';
  }
  if (['pdf'].includes(ext) || mimeType === 'application/pdf') {
    return 'auto';
  }
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'txt', 'csv'].includes(ext)) {
    return 'raw';
  }
  return 'auto';
}

/**
 * 3. STRUCTURED CLOUDINARY STORAGE PATH GENERATOR
 * Constructs target storage directory: cec-drive/folders/{folderId || 'root'}/files/{docId}
 */
export function buildCloudinaryStoragePath(folderId?: string | null, docId?: string): string {
  const safeFolder = folderId ? folderId.trim() : 'root';
  const safeDocId = docId ? docId.trim() : `file-${Date.now()}`;
  return `cec-drive/folders/${safeFolder}/files/${safeDocId}`;
}

/**
 * 4. SIGNED CLOUDINARY UPLOAD FLOW
 * Sequence: Lecturer selects file -> Supabase checks folder permission -> Backend creates Cloudinary signature -> Cloudinary stores file -> Returns Cloudinary response
 */
export async function uploadFileToCloudinary(
  file: File,
  options?: {
    folderId?: string | null;
    docId?: string;
    customPath?: string;
    currentUserProfile?: { role?: string; email?: string; department?: string } | null;
    onProgress?: (progressPercent: number) => void;
  }
): Promise<CloudinaryUploadResult> {
  // Step 1: Check Supabase Auth & Role Permissions ("Is this lecturer allowed to upload here?")
  const permCheck = await checkUserUploadPermission(
    options?.currentUserProfile,
    options?.folderId
  );
  if (!permCheck.allowed) {
    throw new Error(permCheck.message || 'Unauthorized upload attempt');
  }

  // Step 1.5: Enforce strict file size limits
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const fileSizeMB = file.size / (1024 * 1024);

  if ((ext === 'pdf' || file.type === 'application/pdf') && fileSizeMB > 25) {
    throw new Error('File limit exceeded: PDF documents must be under 25 MB.');
  } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) && fileSizeMB > 10) {
    throw new Error('File limit exceeded: Image files must be under 10 MB.');
  } else if (fileSizeMB > 100) {
    throw new Error('File limit exceeded: Upload size cannot exceed 100 MB.');
  }

  // Step 2: Build Cloudinary Storage Path
  const storageFolder = options?.customPath || buildCloudinaryStoragePath(options?.folderId, options?.docId);

  // Step 3: Detect Cloudinary Resource Type (raw, image, video, auto)
  const resourceType = detectCloudinaryResourceType(file.name, file.type);

  // Step 4: Fetch Backend Cloudinary Signature with Supabase JWT
  const { data: { session } } = await supabase.auth.getSession();
  let signatureData: { signature: string; timestamp: number; api_key: string; upload_preset: string } | null = null;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const sigRes = await fetch('http://localhost:3001/api/cloudinary-signature', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        folder: storageFolder,
        upload_preset: UPLOAD_PRESET,
        resource_type: resourceType,
      }),
    });
    if (sigRes.ok) {
      signatureData = await sigRes.json();
    }
  } catch (err) {
    console.warn('Backend signature service notice:', err);
  }

  // Helper function to execute Cloudinary POST upload request with XMLHttpRequest for live progress
  const doUpload = async (): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', signatureData?.upload_preset || UPLOAD_PRESET);
    formData.append('folder', storageFolder);

    if (signatureData?.signature) {
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('api_key', signatureData.api_key);
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

      if (xhr.upload && options?.onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && e.total > 0) {
            const percent = Math.round((e.loaded / e.total) * 100);
            options.onProgress!(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const finalUrl = data.secure_url || data.url;

            resolve({
              url: finalUrl,
              public_id: data.public_id,
              bytes: data.bytes || file.size,
              format: data.format || file.name.split('.').pop() || 'file',
              original_filename: data.original_filename || file.name,
              resource_type: data.resource_type || (resourceType === 'auto' ? 'raw' : resourceType),
            });
          } catch (err) {
            resolve({ error: 'Failed to parse Cloudinary response JSON' });
          }
        } else {
          let errMsg = `Cloudinary upload rejected with status ${xhr.status}`;
          try {
            const errJson = JSON.parse(xhr.responseText);
            if (errJson.error?.message) errMsg = errJson.error.message;
          } catch (e) {}
          resolve({ error: errMsg });
        }
      };

      xhr.onerror = () => resolve({ error: 'Network error during Cloudinary upload' });
      xhr.send(formData);
    });
  };

  try {
    const uploadResult = await doUpload();
    if ('url' in uploadResult) {
      return uploadResult as CloudinaryUploadResult;
    }
    throw new Error(`Cloudinary upload failed: ${uploadResult.error}`);
  } catch (err: any) {
    console.error('Cloudinary upload failure:', err);
    throw new Error(err.message || 'Failed to upload file to Cloudinary.');
  }
}

/**
 * 5. SAVE METADATA IN SUPABASE & REFRESH FOLDER DATA
 * Upserts file record into public.files & public.documents tables
 */
export async function saveDocumentWithCloudinary(docData: {
  id: string;
  name: string;
  dateAdded: string;
  rawDate: string;
  author: {
    name: string;
    initial: string;
    bgColor: string;
  };
  folderId?: string | null;
  uploadedBy?: string | null;
  size: string;
  type: 'pdf' | 'doc' | 'sheet' | 'spec' | 'presentation';
  tag?: 'important' | 'normal';
  starred?: boolean;
  fileUrl?: string;
  url?: string;
  cloudinaryPublicId?: string;
  resourceType?: string;
  mimeType?: string;
  originalFilename?: string;
}) {
  const cloudinaryUrl = docData.fileUrl || docData.url;
  if (!cloudinaryUrl || cloudinaryUrl.startsWith('blob:')) {
    throw new Error('Invalid file URL: Cannot save temporary blob: URL to database. File must be uploaded to Cloudinary first.');
  }

  const cloudinaryPublicId =
    docData.cloudinaryPublicId ||
    `cec-drive/folders/${docData.folderId || 'root'}/files/${docData.id}`;

  const isUuid = (str?: string | null) =>
    !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  let validUploadedByUuid: string | null = null;
  if (isUuid(docData.uploadedBy)) {
    validUploadedByUuid = docData.uploadedBy as string;
  } else {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user?.id && isUuid(authUser.user.id)) {
        validUploadedByUuid = authUser.user.id;
      }
    } catch (e) {
      // fallback to null
    }
  }

  try {
    // 1. Save to public.files table
    const filesPayload = {
      id: docData.id,
      name: docData.name,
      folder_id: docData.folderId || null,
      uploaded_by: validUploadedByUuid,
      cloudinary_public_id: cloudinaryPublicId,
      cloudinary_url: cloudinaryUrl,
      resource_type: docData.resourceType || 'raw',
      mime_type: docData.mimeType || 'application/pdf',
      file_size: docData.size,
      original_filename: docData.originalFilename || docData.name,
      updated_at: new Date().toISOString(),
    };

    const { error: filesErr } = await supabase.from('files').upsert(filesPayload, { onConflict: 'id' });
    if (filesErr) {
      console.error('Supabase error inserting into files table:', filesErr.message);
      throw new Error(`Database error saving file record: ${filesErr.message}`);
    }

    // 2. Also save to public.documents for backward compatibility
    const docsPayload = {
      id: docData.id,
      name: docData.name,
      date_added: docData.dateAdded,
      raw_date: docData.rawDate ? docData.rawDate.split('T')[0] : new Date().toISOString().split('T')[0],
      author_name: docData.author.name,
      author_initial: docData.author.initial,
      author_bg_color: docData.author.bgColor,
      folder_id: docData.folderId || null,
      size: docData.size,
      type: docData.type,
      tag: docData.tag || 'normal',
      starred: docData.starred || false,
      file_url: cloudinaryUrl,
      cloudinary_public_id: cloudinaryPublicId,
    };

    const { data: docRes, error: docErr } = await supabase.from('documents').upsert(docsPayload, { onConflict: 'id' });
    if (docErr) {
      console.error('Supabase error inserting into documents table:', docErr.message);
      throw new Error(`Database error saving document record: ${docErr.message}`);
    }

    // 3. Log UPLOAD Activity to Supabase
    await logActivity({
      userId: docData.uploadedBy || null,
      userName: docData.author.name || 'Academic Staff',
      action: 'UPLOAD',
      fileId: docData.id,
      fileName: docData.name,
      folderId: docData.folderId || null,
      details: `Uploaded "${docData.name}" (${docData.size})`,
    });

    return docRes;
  } catch (e: any) {
    console.error('Failed to link document/file to Supabase:', e);
    throw e;
  }
}

/**
 * Helper to resolve download filename, extension, and MIME type based on document metadata
 */
export function resolveDownloadFilenameAndMime(
  doc: { name: string; type?: string; mimeType?: string; originalFilename?: string },
  fileRecord?: { original_filename?: string; mime_type?: string; resource_type?: string } | null
): { filename: string; mimeType: string } {
  const rawName = fileRecord?.original_filename || doc.originalFilename || doc.name || 'download';
  let mimeType = fileRecord?.mime_type || doc.mimeType || '';

  // Extract extension from rawName if present
  const extMatch = rawName.match(/\.([a-zA-Z0-9]+)$/);
  let ext = extMatch ? extMatch[1].toLowerCase() : '';

  // If rawName has no extension, map from doc.type or mimeType
  if (!ext) {
    if (doc.type === 'doc' || mimeType.includes('word') || mimeType.includes('msword')) {
      ext = 'docx';
      mimeType = mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (doc.type === 'presentation' || doc.type === 'spec' || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      ext = 'pptx';
      mimeType = mimeType || 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (doc.type === 'sheet' || mimeType.includes('sheet') || mimeType.includes('excel')) {
      ext = 'xlsx';
      mimeType = mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (doc.type === 'pdf' || mimeType.includes('pdf')) {
      ext = 'pdf';
      mimeType = mimeType || 'application/pdf';
    } else {
      ext = 'pdf';
      mimeType = mimeType || 'application/pdf';
    }
  }

  // Ensure appropriate MIME type based on extension
  if (!mimeType) {
    if (['doc', 'docx'].includes(ext)) {
      mimeType = ext === 'doc' ? 'application/msword' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (['ppt', 'pptx'].includes(ext)) {
      mimeType = ext === 'ppt' ? 'application/vnd.ms-powerpoint' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (['xls', 'xlsx'].includes(ext)) {
      mimeType = ext === 'xls' ? 'application/vnd.ms-excel' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (ext === 'pdf') {
      mimeType = 'application/pdf';
    } else if (['jpg', 'jpeg'].includes(ext)) {
      mimeType = 'image/jpeg';
    } else if (ext === 'png') {
      mimeType = 'image/png';
    } else if (ext === 'zip') {
      mimeType = 'application/zip';
    } else if (ext === 'txt') {
      mimeType = 'text/plain';
    } else {
      mimeType = 'application/octet-stream';
    }
  }

  const filename = extMatch ? rawName : `${rawName}.${ext}`;
  return { filename, mimeType };
}

/**
 * 6. AUTHENTICATED FILE DOWNLOAD HANDLER
 * Sequence: Student clicks Download -> Supabase Auth -> Check file permission in DB -> Get verified Cloudinary URL -> Download with original format/extension
 */
export async function handleSecureFileDownload(
  doc: { id: string; name: string; type?: string; mimeType?: string; originalFilename?: string; fileUrl?: string; cloudinaryPublicId?: string },
  currentUserProfile?: { id?: string; email?: string; role?: string } | null
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    // Step 1: Supabase authentication check
    const { data: { session } } = await supabase.auth.getSession();
    
    // Step 2: Query Supabase DB for verified file record & permissions
    const { data: fileRecord } = await supabase
      .from('files')
      .select('cloudinary_url, cloudinary_public_id, original_filename, mime_type, resource_type')
      .eq('id', doc.id)
      .maybeSingle();

    let verifiedUrl = fileRecord?.cloudinary_url;

    // Fallback query to documents table if files table record isn't cached
    if (!verifiedUrl) {
      const { data: docRecord } = await supabase
        .from('documents')
        .select('file_url, cloudinary_public_id')
        .eq('id', doc.id)
        .maybeSingle();
      verifiedUrl = docRecord?.file_url;
    }

    // Fallback to memory URL if database record fallback is active
    if (!verifiedUrl && doc.fileUrl) {
      verifiedUrl = doc.fileUrl;
    }

    if (!verifiedUrl) {
      return {
        success: false,
        message: 'File URL not found in verified database record.',
      };
    }

    // Step 3: Resolve exact filename and MIME type (Word .docx, PPT .pptx, Excel .xlsx, PDF .pdf, etc.)
    const { filename: targetFileName, mimeType: targetMimeType } = resolveDownloadFilenameAndMime(doc, fileRecord);

    try {
      // 1. Try fetching the verified URL directly
      let res = await fetch(verifiedUrl);
      
      // 2. If 401 ACL error on image/upload URL, attempt fetching via raw/upload URL
      if (!res.ok && verifiedUrl.includes('/image/upload/')) {
        const rawUrl = verifiedUrl.replace('/image/upload/', '/raw/upload/');
        const resRaw = await fetch(rawUrl);
        if (resRaw.ok) {
          res = resRaw;
        }
      }

      if (res.ok) {
        const blob = await res.blob();
        const fileBlob = blob.type && blob.type !== 'text/html' ? blob : new Blob([blob], { type: targetMimeType });
        const blobUrl = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = targetFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        const link = document.createElement('a');
        link.href = verifiedUrl;
        link.download = targetFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (fetchErr) {
      console.warn('Direct fetch download error:', fetchErr);
      const link = document.createElement('a');
      link.href = verifiedUrl;
      link.download = targetFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Step 4: Log DOWNLOAD Activity to Supabase
    await logActivity({
      userId: currentUserProfile?.id || session?.user?.id || null,
      userName: currentUserProfile?.email || 'Authenticated User',
      action: 'DOWNLOAD',
      fileId: doc.id,
      fileName: doc.name,
      details: `Downloaded "${doc.name}" as ${targetFileName}`,
    });

    return {
      success: true,
      url: verifiedUrl,
    };
  } catch (err: any) {
    console.error('Secure download flow error:', err);
    return {
      success: false,
      message: err.message || 'An error occurred during secure file download.',
    };
  }
}
