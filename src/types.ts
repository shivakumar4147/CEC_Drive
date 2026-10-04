export type UserRole = 'admin' | 'uploader' | 'student';

export function normalizeUserRole(roleStr?: string | null): UserRole | undefined {
  if (!roleStr) return undefined;
  const lower = roleStr.trim().toLowerCase();
  if (['admin', 'administrator', 'superadmin'].includes(lower)) return 'admin';
  if (['uploader', 'lecturer', 'teacher', 'staff', 'faculty', 'professor'].includes(lower)) return 'uploader';
  if (['student', 'user', 'learner'].includes(lower)) return 'student';
  return undefined;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  section?: string;
  initial: string;
  bgColor: string;
}

export interface FileItem {
  id: string;
  name: string;
  folder_id?: string | null;
  uploaded_by?: string | null;
  cloudinary_public_id: string;
  cloudinary_url: string;
  resource_type: string;
  mime_type: string;
  file_size: string;
  original_filename: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentItem {
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
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface UploadingDocItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'sheet' | 'spec' | 'presentation';
  folderId?: string | null;
  progress: number;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string | null;
  fileCount: number;
  totalSize: string;
  selected?: boolean;
  color?: string;
  createdAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export type ViewMode = 'list' | 'grid';
export type ThemeMode = 'light' | 'dark';

export type ActiveNavKey =
  | 'dashboard'
  | 'calendar'
  | 'pinned-folders'
  | 'recent-files'
  | 'announcements'
  | 'inbox'
  | 'my-tasks'
  | 'folders'
  | 'documents'
  | 'admin-panel'
  | 'lecturer-panel'
  | 'recycle-bin'
  | 'tag-important'
  | 'tag-normal';
