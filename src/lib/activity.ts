import { supabase } from './supabase';

export interface ActivityLogEntry {
  id?: string;
  user_id?: string | null;
  action: 'UPLOAD' | 'DOWNLOAD' | 'MOVE' | 'DELETE' | 'RENAME' | 'CREATE_FOLDER';
  file_id?: string | null;
  folder_id?: string | null;
  timestamp?: string;
  metadata: {
    userName?: string;
    fileName?: string;
    folderName?: string;
    targetFolderName?: string;
    details?: string;
    [key: string]: any;
  };
}

/**
 * 1. LOG ACTIVITY TO SUPABASE
 * Inserts activity log record into public.activity table
 */
export async function logActivity(params: {
  userId?: string | null;
  userName?: string;
  action: 'UPLOAD' | 'DOWNLOAD' | 'MOVE' | 'DELETE' | 'RENAME' | 'CREATE_FOLDER';
  fileId?: string | null;
  fileName?: string;
  folderId?: string | null;
  folderName?: string;
  targetFolderName?: string;
  details?: string;
  extraMeta?: Record<string, any>;
}) {
  try {
    const payload = {
      user_id: params.userId || null,
      action: params.action,
      file_id: params.fileId || null,
      folder_id: params.folderId || null,
      timestamp: new Date().toISOString(),
      metadata: {
        userName: params.userName || 'User',
        fileName: params.fileName || '',
        folderName: params.folderName || '',
        targetFolderName: params.targetFolderName || '',
        details: params.details || '',
        ...(params.extraMeta || {}),
      },
    };

    const { data, error } = await supabase.from('activity').insert([payload]);
    if (error) {
      console.warn('Supabase activity log note:', error.message);
    }
    return data;
  } catch (err) {
    console.error('Error logging activity to Supabase:', err);
  }
}

/**
 * 2. FETCH RECENT ACTIVITIES FROM SUPABASE
 * Queries latest activity log entries for the Activity dashboard feed
 */
export async function fetchRecentActivities(limit: number = 20): Promise<ActivityLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('activity')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching activity log:', error.message);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      action: item.action,
      file_id: item.file_id,
      folder_id: item.folder_id,
      timestamp: item.timestamp,
      metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata || {},
    }));
  } catch (err) {
    console.error('Failed to fetch recent activities:', err);
    return [];
  }
}
