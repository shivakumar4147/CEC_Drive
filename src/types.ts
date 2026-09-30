export type UserRole = 'admin' | 'uploader' | 'student';

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
  size: string;
  type: 'pdf' | 'doc' | 'sheet' | 'spec' | 'presentation';
  tag?: 'important' | 'normal';
  starred?: boolean;
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
}

export type ViewMode = 'list' | 'grid';
export type ThemeMode = 'light' | 'dark';

export type ActiveNavKey =
  | 'dashboard'
  | 'calendar'
  | 'inbox'
  | 'my-tasks'
  | 'folders'
  | 'documents'
  | 'admin-panel'
  | 'lecturer-panel'
  | 'tag-important'
  | 'tag-normal';
