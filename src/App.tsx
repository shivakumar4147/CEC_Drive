import React, { useState, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Folder as FolderIcon,
  Search,
  Plus,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { SynapseLogo } from './components/SynapseLogo';
import { CECDriveLoader } from './components/CECDriveLoader';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeaderAccountMenu } from './components/HeaderAccountMenu';
import { ProfileView } from './components/ProfileView';
import { Dashboard } from './components/Dashboard';
import { Inbox } from './components/Inbox';
import { MyTasks } from './components/MyTasks';
import { AdminPanel } from './components/AdminPanel';
import { LecturerPanel } from './components/LecturerPanel';
import { CalendarView } from './components/CalendarView';
import { PinnedFoldersView } from './components/PinnedFoldersView';
import { RecentFilesView } from './components/RecentFilesView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { FolderCard } from './components/FolderCard';
import { FolderList } from './components/FolderList';
import { FolderToolbar } from './components/FolderToolbar';
import { DocumentTable, SortField, SortOrder } from './components/DocumentTable';
import { DocumentGrid } from './components/DocumentGrid';
import { supabase } from './lib/supabase';
import { handleSecureFileDownload } from './lib/cloudinary';
import { logActivity } from './lib/activity';
import { BatchActionBar } from './components/BatchActionBar';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { NewDocumentModal } from './components/NewDocumentModal';
import { RecycleBinView } from './components/RecycleBinView';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import {
  DocumentItem,
  FolderItem,
  ViewMode,
  ThemeMode,
  ActiveNavKey,
  UserRole,
  UserProfile,
} from './types';

// Complete University File Explorer Hierarchy:
// Year (2026-2027) -> Semester (1st to 8th) -> Department (CSE, ECE, ME, AI&DS) -> Section (Sec A, Sec B) -> Subject/Notes Folders -> Files
const INITIAL_FOLDERS: FolderItem[] = [
  // 1. Academic Years
  {
    id: 'year-2026-27',
    name: '2026-2027',
    parentId: null,
    fileCount: 0,
    totalSize: '0 MB',
  },
  {
    id: 'year-2025-26',
    name: '2025-2026',
    parentId: null,
    fileCount: 5,
    totalSize: '60.1 MB',
  },

  // 2. All 8 Semesters inside 2025-2026
  { id: 'sem-1', name: '1st Sem', parentId: 'year-2025-26', fileCount: 0, totalSize: '0 MB' },
  { id: 'sem-2', name: '2nd Sem', parentId: 'year-2025-26', fileCount: 0, totalSize: '0 MB' },
  { id: 'sem-3', name: '3rd Sem', parentId: 'year-2025-26', fileCount: 0, totalSize: '0 MB' },
  { id: 'sem-4', name: '4th Sem', parentId: 'year-2025-26', fileCount: 0, totalSize: '0 MB' },
  { id: 'sem-5', name: '5th Sem', parentId: 'year-2025-26', fileCount: 5, totalSize: '60.1 MB' },
  { id: 'sem-6', name: '6th Sem', parentId: 'year-2025-26', fileCount: 0, totalSize: '0 MB' },
  { id: 'sem-7', name: '7th Sem', parentId: 'year-2025-26', fileCount: 0, totalSize: '0 MB' },
  { id: 'sem-8', name: '8th Sem', parentId: 'year-2025-26', fileCount: 0, totalSize: '0 MB' },

  // 3. Departments inside 5th Sem
  { id: 'dept-cse', name: 'CSE', parentId: 'sem-5', fileCount: 5, totalSize: '60.1 MB' },
  { id: 'dept-ece', name: 'ECE', parentId: 'sem-5', fileCount: 0, totalSize: '0 MB' },
  { id: 'dept-me', name: 'ME', parentId: 'sem-5', fileCount: 0, totalSize: '0 MB' },
  { id: 'dept-aids', name: 'AI & DS', parentId: 'sem-5', fileCount: 0, totalSize: '0 MB' },

  // 4. Sections inside CSE Department
  { id: 'sec-cse-a', name: 'Section A', parentId: 'dept-cse', fileCount: 5, totalSize: '60.1 MB' },
  { id: 'sec-cse-b', name: 'Section B', parentId: 'dept-cse', fileCount: 0, totalSize: '0 MB' },
  { id: 'sec-cse-c', name: 'Section C', parentId: 'dept-cse', fileCount: 0, totalSize: '0 MB' },

  // 5. Subject Notes Folders inside Section A
  { id: 'folder-dbms', name: 'DBMS', parentId: 'sec-cse-a', fileCount: 3, totalSize: '24.5 MB' },
  { id: 'folder-dbms-unit1', name: 'Unit 1 - ER Diagrams & SQL', parentId: 'folder-dbms', fileCount: 2, totalSize: '16.1 MB' },
  { id: 'folder-dbms-unit2', name: 'Unit 2 - Relational Algebra', parentId: 'folder-dbms', fileCount: 1, totalSize: '8.4 MB' },

  { id: 'folder-cn', name: 'Computer Networks', parentId: 'sec-cse-a', fileCount: 2, totalSize: '14.8 MB' },
  { id: 'folder-cn-ppt', name: 'CN Unit 3 Presentations', parentId: 'folder-cn', fileCount: 1, totalSize: '6.7 MB' },

  { id: 'folder-daa', name: 'DAA', parentId: 'sec-cse-a', fileCount: 1, totalSize: '18.9 MB' },
  { id: 'folder-se', name: 'Software Engineering', parentId: 'sec-cse-a', fileCount: 0, totalSize: '0 MB' },
  { id: 'folder-web', name: 'Web Technology', parentId: 'sec-cse-a', fileCount: 0, totalSize: '0 MB' },
];

import { SAMPLE_PDF_DATA_URL } from './utils/samplePdf';

// Initial Student Academic Documents linked to folder hierarchy
const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'DBMS Complete Lecture Notes 2025',
    dateAdded: 'Mon, 25 Aug 2025',
    rawDate: '2025-08-25',
    author: {
      name: 'Prof. Sharma',
      initial: 'S',
      bgColor: 'bg-purple-600',
    },
    folderId: 'folder-dbms-unit1',
    size: '14.2 MB',
    type: 'pdf',
    tag: 'important',
    starred: true,
    fileUrl: SAMPLE_PDF_DATA_URL,
  },
  {
    id: 'doc-2',
    name: 'ER Model & Normalization Problem Set',
    dateAdded: 'Fri, 01 Sep 2025',
    rawDate: '2025-09-01',
    author: {
      name: 'Shiva Student',
      initial: 'S',
      bgColor: 'bg-rose-500',
    },
    folderId: 'folder-dbms-unit1',
    size: '1.9 MB',
    type: 'pdf',
    tag: 'important',
    fileUrl: SAMPLE_PDF_DATA_URL,
  },
  {
    id: 'doc-3',
    name: 'Relational Algebra Notes & Cheat Sheet',
    dateAdded: 'Tue, 05 Sep 2025',
    rawDate: '2025-09-05',
    author: {
      name: 'Prof. Sharma',
      initial: 'S',
      bgColor: 'bg-fuchsia-600',
    },
    folderId: 'folder-dbms-unit2',
    size: '8.4 MB',
    type: 'sheet',
    tag: 'normal',
  },
  {
    id: 'doc-4',
    name: 'Computer Networks Unit 3 PPT Slides',
    dateAdded: 'Wed, 10 Sep 2025',
    rawDate: '2025-09-10',
    author: {
      name: 'Dr. Kumar',
      initial: 'K',
      bgColor: 'bg-sky-500',
    },
    folderId: 'folder-cn-ppt',
    size: '6.7 MB',
    type: 'presentation',
    tag: 'normal',
  },
  {
    id: 'doc-5',
    name: 'DAA Important Exam Questions & Solutions',
    dateAdded: 'Thu, 15 Sep 2025',
    rawDate: '2025-09-15',
    author: {
      name: 'Prof. Rao',
      initial: 'R',
      bgColor: 'bg-indigo-600',
    },
    folderId: 'folder-daa',
    size: '18.9 MB',
    type: 'doc',
    tag: 'important',
  },
];

// Initial System Users for the 3 Control Panel Roles
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Shiva Student',
    email: 'shiva@student.cec.edu.in',
    role: 'student',
    department: 'CSE',
    section: 'Section A',
    initial: 'S',
    bgColor: 'bg-blue-600',
  },
  {
    id: 'usr-2',
    name: 'Prof. Sharma',
    email: 'sharma@lecturer.cec.edu.in',
    role: 'uploader',
    department: 'CSE',
    section: 'Section A',
    initial: 'S',
    bgColor: 'bg-amber-600',
  },
  {
    id: 'usr-3',
    name: 'CEC Admin',
    email: 'admin@cec.edu.in',
    role: 'admin',
    department: 'System Wide',
    initial: 'A',
    bgColor: 'bg-purple-600',
  },
];

export function deduplicateDocuments(docs: DocumentItem[]): DocumentItem[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const result: DocumentItem[] = [];

  for (const d of docs) {
    if (!d || !d.id) continue;
    const nameKey = `${d.folderId || 'root'}::${(d.name || '').trim().toLowerCase()}`;
    if (seenIds.has(d.id) || seenKeys.has(nameKey)) {
      continue;
    }
    seenIds.add(d.id);
    seenKeys.add(nameKey);
    result.push(d);
  }

  return result;
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('synapse_theme') as ThemeMode;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#191919';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#ffffff';
    }
    localStorage.setItem('synapse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Users & Role State
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeUserProfile, setActiveUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cec_drive_active_user_profile');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  // Landing page / authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cec_drive_authenticated');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Butter-Smooth Glitch Protection Splash Loading State
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [fadeSplashOut, setFadeSplashOut] = useState(false);

  const dismissSplash = () => {
    setFadeSplashOut(true);
    setTimeout(() => setIsInitialLoading(false), 300);
  };

  useEffect(() => {
    const timer = setTimeout(dismissSplash, 350);
    return () => clearTimeout(timer);
  }, []);

  // Check URL on mount for password recovery tokens
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setIsResetPasswordModalOpen(true);
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    }
  }, []);

  // Supabase Auth Listener
  useEffect(() => {
    const syncUserProfile = async (user: any) => {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cec_drive_authenticated', 'true');
      }
      const meta = user.user_metadata || {};
      
      let effectiveRole: UserRole = (meta.role as UserRole) || 'student';
      let dbName = meta.name;

      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('role, name, department, section')
          .eq('id', user.id)
          .maybeSingle();

        if (dbProfile) {
          if (dbProfile.role) effectiveRole = dbProfile.role as UserRole;
          if (dbProfile.name) dbName = dbProfile.name;
        }
      } catch (e) {
        console.warn('Failed to fetch role/profile from profiles table:', e);
      }

      setCurrentRole(effectiveRole);

      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        name: dbName || (user.email ? user.email.split('@')[0] : 'User'),
        role: effectiveRole,
        department: meta.department || 'CSE',
        section: meta.section || 'Sec A',
        initial: ((dbName || user.email || 'U')[0]).toUpperCase(),
        bgColor: effectiveRole === 'admin' ? 'bg-purple-600' : effectiveRole === 'uploader' ? 'bg-amber-600' : 'bg-blue-600',
      };
      setActiveUserProfile(profile);

      // Load user's pinned folders EXCLUSIVELY from user_folder_pins table in Supabase
      try {
        const { data: pinsData } = await supabase
          .from('user_folder_pins')
          .select('folder_id')
          .eq('user_id', user.id);

        if (pinsData) {
          setPinnedFolderIds(pinsData.map((p: any) => p.folder_id));
        } else {
          setPinnedFolderIds([]);
        }
      } catch (e) {
        setPinnedFolderIds([]);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('cec_drive_active_user_profile', JSON.stringify(profile));
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserProfile(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetPasswordModalOpen(true);
        if (typeof window !== 'undefined' && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
      if (session?.user) {
        syncUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setActiveUserProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cec_drive_authenticated', 'false');
          localStorage.removeItem('cec_drive_active_user_profile');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPasswordSuccess = async () => {
    setIsResetPasswordModalOpen(false);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    setActiveUserProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cec_drive_authenticated', 'false');
      localStorage.removeItem('cec_drive_active_user_profile');
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    showToast('Password updated successfully! Please sign in with your new password.');
  };

  const handleLoginSuccess = (role?: UserRole, userDetails?: Partial<UserProfile> & { id?: string }) => {
    if (role) {
      setCurrentRole(role);
    }
    if (userDetails) {
      const profile: UserProfile = {
        id: userDetails.id || `usr-${Date.now()}`,
        email: userDetails.email || '',
        name: userDetails.name || 'User',
        role: role || userDetails.role || 'student',
        department: userDetails.department || 'CSE',
        section: userDetails.section || 'Sec A',
        initial: (userDetails.initial || (userDetails.name || 'U')[0]).toUpperCase(),
        bgColor: userDetails.bgColor || (role === 'student' ? 'bg-blue-600' : 'bg-amber-600'),
      };
      setActiveUserProfile(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cec_drive_active_user_profile', JSON.stringify(profile));
      }
    }
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cec_drive_authenticated', 'true');
    }
  };

  const handleLogout = async () => {
    try {
      // Scope sign-out strictly to the local device browser session (does not invalidate PC session)
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Supabase sign out error:', err);
    }
    setIsAuthenticated(false);
    setActiveUserProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cec_drive_authenticated', 'false');
      localStorage.removeItem('cec_drive_active_user_profile');
    }
  };

  const currentUser = useMemo(() => {
    if (activeUserProfile) return activeUserProfile;
    const found = users.find((u) => u.role === currentRole);
    return found || users[0];
  }, [activeUserProfile, users, currentRole]);

  // Active navigation & Explorer location state with localStorage persistence across reloads
  const [activeNav, setActiveNav] = useState<ActiveNavKey>(() => {
    if (typeof window !== 'undefined') {
      const savedNav = localStorage.getItem('cec_drive_active_nav') as ActiveNavKey;
      if (savedNav) return savedNav;
    }
    return 'dashboard';
  });

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const savedFolder = localStorage.getItem('cec_drive_current_folder_id');
      if (savedFolder !== null && savedFolder !== 'null') return savedFolder;
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cec_drive_active_nav', activeNav);
    }
  }, [activeNav]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentFolderId === null) {
        localStorage.setItem('cec_drive_current_folder_id', 'null');
      } else {
        localStorage.setItem('cec_drive_current_folder_id', currentFolderId);
      }
    }
  }, [currentFolderId]);

  // User-Isolated Pinned Folders (Strictly private per logged-in user email/id)
  const getUserPinStorageKey = (userObj?: UserProfile | null) => {
    if (!userObj || (!userObj.id && !userObj.email)) return null;
    const identifier = (userObj.email || userObj.id).replace(/[^a-zA-Z0-9]/g, '_');
    return `cec_drive_pinned_folders_v2_${identifier}`;
  };

  const [pinnedFolderIds, setPinnedFolderIds] = useState<string[]>([]);

  // Load user pins directly from Supabase user_folder_pins table as soon as user ID is resolved
  useEffect(() => {
    const fetchPinsForUser = async () => {
      if (!activeUserProfile?.id) return;
      try {
        console.log('[SUPABASE PIN FETCH] Querying user_folder_pins for user_id:', activeUserProfile.id);
        const { data: pins, error } = await supabase
          .from('user_folder_pins')
          .select('folder_id, created_at')
          .eq('user_id', activeUserProfile.id)
          .order('created_at', { ascending: false });

        console.log('[SUPABASE PIN FETCH] Rows:', pins, 'Error:', error);
        if (!error && pins) {
          setPinnedFolderIds(pins.map((p: any) => p.folder_id));
        }
      } catch (e) {
        console.error('[SUPABASE PIN FETCH EXCEPTION]:', e);
      }
    };

    fetchPinsForUser();
  }, [activeUserProfile?.id]);

  const handleTogglePinFolder = async (folderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || activeUserProfile?.id;

      if (!userId) {
        showToast('Please sign in to pin folders');
        return;
      }

      const isCurrentlyPinned = pinnedFolderIds.includes(folderId);
      const folderName = folders.find((f) => f.id === folderId)?.name || 'Folder';

      // Immediate UI update
      const updatedPins = isCurrentlyPinned
        ? pinnedFolderIds.filter((id) => id !== folderId)
        : [...pinnedFolderIds, folderId];
      setPinnedFolderIds(updatedPins);
      showToast(isCurrentlyPinned ? `Unpinned "${folderName}"` : `Pinned "${folderName}" to Quick Access`);

      if (isCurrentlyPinned) {
        // Delete pin specifically for this user and folder
        const { error } = await supabase
          .from('user_folder_pins')
          .delete()
          .eq('user_id', userId)
          .eq('folder_id', folderId);
        if (error) console.error('Supabase unpin error:', error.message);
      } else {
        // Insert pin for this user and folder
        const { error } = await supabase
          .from('user_folder_pins')
          .upsert([{ user_id: userId, folder_id: folderId }], { onConflict: 'user_id,folder_id' });
        if (error) console.error('Supabase pin insert error:', error.message);
      }
    } catch (e) {
      console.error('Failed to toggle pin in Supabase:', e);
    }
  };

  // View mode: 'list' or 'grid' (grid is default)
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Data states with localStorage persistence for soft-deleted items
  const [folders, setFolders] = useState<FolderItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cec_drive_folders');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_FOLDERS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cec_drive_documents');
        if (saved) return deduplicateDocuments(JSON.parse(saved));
      } catch (e) {}
    }
    return deduplicateDocuments(INITIAL_DOCUMENTS);
  });

  useEffect(() => {
    try {
      localStorage.setItem('cec_drive_folders', JSON.stringify(folders));
    } catch (e) {}
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem('cec_drive_documents', JSON.stringify(documents));
    } catch (e) {}
  }, [documents]);

  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Sorting & Search
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Notifications
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const INITIAL_NOTIFICATIONS = {
    dashboard: false,
    calendar: true,
    pinned: true,
    recent: true,
    announcements: true,
    folders: true,
  };

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('cec_drive_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cec_drive_notifications', JSON.stringify(notifications));
    } catch (e) {
      // ignore
    }
  }, [notifications]);

  // Handle mobile menu popstate (browser back button)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    window.history.pushState({ mobileMenu: true }, '');

    const handlePopState = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [mobileMenuOpen]);

  const handleSelectNav = (key: ActiveNavKey) => {
    setActiveNav(key);
    if (key !== 'documents') {
      setCurrentFolderId(null);
    }
    if (key === 'calendar') {
      setNotifications((prev: Record<string, boolean>) => ({ ...prev, calendar: false }));
    } else if (key === 'pinned-folders') {
      setNotifications((prev: Record<string, boolean>) => ({ ...prev, pinned: false }));
    } else if (key === 'recent-files') {
      setNotifications((prev: Record<string, boolean>) => ({ ...prev, recent: false }));
    } else if (key === 'announcements') {
      setNotifications((prev: Record<string, boolean>) => ({ ...prev, announcements: false }));
    } else if (key === 'documents') {
      setNotifications((prev: Record<string, boolean>) => ({ ...prev, folders: false }));
    } else if (key === 'dashboard' || key === 'admin-panel' || key === 'lecturer-panel') {
      setNotifications((prev: Record<string, boolean>) => ({ ...prev, dashboard: false }));
    }
  };

  // Supabase Data Fetching
  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        const { data: remoteDocs, error: docErr } = await supabase.from('documents').select('*');
        if (!docErr && remoteDocs && remoteDocs.length > 0) {
          const normalizedDocs: DocumentItem[] = remoteDocs.map((d: any) => ({
            id: d.id,
            name: d.name,
            dateAdded: d.dateAdded || d.date_added || 'Recently',
            rawDate: d.rawDate || d.raw_date || '2026-09-30',
            author: d.author || {
              name: d.author_name || 'Academic Staff',
              initial: (d.author_name || 'A')[0] || 'A',
              bgColor: 'bg-blue-600',
            },
            folderId: d.folderId !== undefined ? d.folderId : (d.folder_id !== undefined ? d.folder_id : null),
            size: d.size || '0 MB',
            type: d.type || 'pdf',
            tag: d.tag || 'normal',
            starred: d.starred || false,
            fileUrl: d.fileUrl || d.file_url || d.cloudinary_url || d.url || undefined,
            cloudinaryPublicId: d.cloudinaryPublicId || d.cloudinary_public_id || undefined,
            mimeType: d.mimeType || d.mime_type || undefined,
            originalFilename: d.originalFilename || d.original_filename || undefined,
            isDeleted: d.is_deleted || d.isDeleted || false,
            deletedAt: d.deleted_at || d.deletedAt || undefined,
            deletedBy: d.deleted_by || d.deletedBy || undefined,
          }));
          setDocuments(deduplicateDocuments(normalizedDocs));
        }

        // 1. Ensure initial folder structure exists in Supabase to support foreign key constraints
        try {
          const initialFolderPayloads = INITIAL_FOLDERS.map((f) => ({
            id: f.id,
            name: f.name,
            parent_id: f.parentId || null,
            file_count: f.fileCount || 0,
            total_size: f.totalSize || '0 MB',
            is_deleted: false,
          }));
          await supabase.from('folders').upsert(initialFolderPayloads, { onConflict: 'id' });
        } catch (seedErr) {
          console.warn('Initial folder seeding warning:', seedErr);
        }

        const { data: remoteFolders, error: folderErr } = await supabase.from('folders').select('*');
        if (!folderErr && remoteFolders && remoteFolders.length > 0) {
          const normalizedFolders: FolderItem[] = remoteFolders.map((f: any) => ({
            id: f.id,
            name: f.name,
            parentId: f.parentId !== undefined ? f.parentId : (f.parent_id !== undefined ? f.parent_id : null),
            fileCount: f.fileCount ?? f.file_count ?? 0,
            totalSize: f.totalSize ?? f.total_size ?? '0 MB',
            isDeleted: f.is_deleted || f.isDeleted || false,
            deletedAt: f.deleted_at || f.deletedAt || undefined,
            deletedBy: f.deleted_by || f.deletedBy || undefined,
          }));
          setFolders((prevLocal) => {
            const remoteIds = new Set(normalizedFolders.map((nf) => nf.id));
            const localOnlyFolders = prevLocal.filter((lf) => !remoteIds.has(lf.id));
            return [...normalizedFolders, ...localOnlyFolders];
          });
        }

        const { data: remoteProfiles } = await supabase.from('profiles').select('*');
        if (remoteProfiles && remoteProfiles.length > 0) {
          const loadedUsers: UserProfile[] = remoteProfiles.map((p: any) => ({
            id: p.id,
            email: p.email || '',
            name: p.name || (p.email ? p.email.split('@')[0] : 'User'),
            role: (p.role as UserRole) || 'student',
            department: p.department || 'CSE',
            section: p.section || 'Sec A',
            initial: ((p.name || p.email || 'U')[0]).toUpperCase(),
            bgColor: p.role === 'admin' ? 'bg-purple-600' : p.role === 'uploader' ? 'bg-amber-600' : 'bg-blue-600',
          }));
          setUsers(loadedUsers);

          // Real-time cross-device sync: Sync active user's pinned_folders directly from user_folder_pins table
          if (activeUserProfile?.id) {
            const { data: userPins } = await supabase
              .from('user_folder_pins')
              .select('folder_id')
              .eq('user_id', activeUserProfile.id);

            if (userPins) {
              setPinnedFolderIds(userPins.map((p: any) => p.folder_id));
            } else {
              const activeProfile = remoteProfiles.find(
                (p: any) => p.id === activeUserProfile.id || (p.email && p.email.toLowerCase() === activeUserProfile.email.toLowerCase())
              );
              if (activeProfile && Array.isArray(activeProfile.pinned_folders)) {
                setPinnedFolderIds(activeProfile.pinned_folders);
              }
            }
          }
        }
      } catch (err) {
        console.log('Supabase sync notice: using initial dataset');
      }
    }

    fetchSupabaseData();

    // Auto-refresh Supabase data when switching back to tab (PC <-> Mobile sync)
    const handleFocus = () => {
      fetchSupabaseData();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    // Supabase Realtime Subscription: Direct In-Memory Payload Patching for 0ms Instant Cross-Device Sync
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_folder_pins' }, (payload: any) => {
        console.log('[REALTIME PIN PAYLOAD]', payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          const newPin = payload.new;
          if (activeUserProfile?.id && newPin.user_id === activeUserProfile.id) {
            setPinnedFolderIds((prev) => (prev.includes(newPin.folder_id) ? prev : [...prev, newPin.folder_id]));
          }
        } else if (payload.eventType === 'DELETE') {
          console.log('[REALTIME UNPIN PAYLOAD]', payload);
          const deletedFolderId = payload.old?.folder_id;
          if (deletedFolderId) {
            setPinnedFolderIds((prev) => prev.filter((id) => id !== deletedFolderId));
          }
          // Always execute immediate targeted pin sync for active user on DELETE
          if (activeUserProfile?.id) {
            supabase
              .from('user_folder_pins')
              .select('folder_id')
              .eq('user_id', activeUserProfile.id)
              .then(({ data, error }) => {
                if (!error && data) {
                  console.log('[REALTIME UNPIN SYNC RESULT]', data);
                  setPinnedFolderIds(data.map((p: any) => p.folder_id));
                }
              });
          }
        } else {
          fetchSupabaseData();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'folders' }, (payload: any) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const newF = payload.new;
          setFolders((prev) => {
            if (prev.some((f) => f.id === newF.id)) return prev;
            return [
              ...prev,
              {
                id: newF.id,
                name: newF.name,
                parentId: newF.parent_id || null,
                fileCount: newF.file_count || 0,
                totalSize: newF.total_size || '0 MB',
                isDeleted: !!newF.is_deleted,
                deletedAt: newF.deleted_at,
                deletedBy: newF.deleted_by,
                createdBy: newF.created_by,
              },
            ];
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const updF = payload.new;
          setFolders((prev) =>
            prev.map((f) =>
              f.id === updF.id
                ? {
                    ...f,
                    name: updF.name,
                    parentId: updF.parent_id || null,
                    fileCount: updF.file_count ?? f.fileCount,
                    totalSize: updF.total_size ?? f.totalSize,
                    isDeleted: !!updF.is_deleted,
                    deletedAt: updF.deleted_at,
                    deletedBy: updF.deleted_by,
                  }
                : f
            )
          );
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setFolders((prev) => prev.filter((f) => f.id !== payload.old.id));
        } else {
          fetchSupabaseData();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, (payload: any) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const newD = payload.new;
          setDocuments((prev) => {
            if (prev.some((d) => d.id === newD.id)) return prev;
            return [
              ...prev,
              {
                id: newD.id,
                name: newD.name,
                dateAdded: newD.date_added || 'Just now',
                rawDate: newD.raw_date || new Date().toISOString(),
                author: {
                  name: newD.author_name || 'User',
                  initial: newD.author_initial || 'U',
                  bgColor: newD.author_bg_color || 'bg-blue-600',
                },
                folderId: newD.folder_id || null,
                size: newD.size || '0 KB',
                type: newD.type || 'pdf',
                tag: newD.tag || 'normal',
                starred: !!newD.starred,
                isDeleted: !!newD.is_deleted,
                deletedAt: newD.deleted_at,
                deletedBy: newD.deleted_by,
                url: newD.url || newD.file_url,
                cloudinaryPublicId: newD.cloudinary_public_id,
              },
            ];
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const updD = payload.new;
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === updD.id
                ? {
                    ...d,
                    name: updD.name,
                    folderId: updD.folder_id || null,
                    starred: !!updD.starred,
                    isDeleted: !!updD.is_deleted,
                    deletedAt: updD.deleted_at,
                    deletedBy: updD.deleted_by,
                  }
                : d
            )
          );
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setDocuments((prev) => prev.filter((d) => d.id !== payload.old.id));
        } else {
          fetchSupabaseData();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [activeUserProfile?.id, activeUserProfile?.email]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch role handler
  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      setActiveNav('admin-panel');
    } else if (newRole === 'uploader') {
      setActiveNav('lecturer-panel');
    } else {
      setActiveNav('dashboard');
    }
    showToast(`Switched control panel view to ${newRole.toUpperCase()} mode`);
  };

  // User Management Handlers for Admin
  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, bgColor: newRole === 'admin' ? 'bg-purple-600' : newRole === 'uploader' ? 'bg-amber-600' : 'bg-blue-600' } : u))
    );

    if (activeUserProfile && activeUserProfile.id === userId) {
      setCurrentRole(newRole);
      const updatedProfile = {
        ...activeUserProfile,
        role: newRole,
        bgColor: newRole === 'admin' ? 'bg-purple-600' : newRole === 'uploader' ? 'bg-amber-600' : 'bg-blue-600',
      };
      setActiveUserProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cec_drive_active_user_profile', JSON.stringify(updatedProfile));
      }
    }

    showToast(`Updated user role to ${newRole.toUpperCase()}`);

    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    } catch (e) {
      console.warn('Failed to persist user role in Supabase:', e);
    }
  };

  const handleAddUser = (newUser: Omit<UserProfile, 'id'>) => {
    const userItem: UserProfile = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, userItem]);
    showToast(`Added new user "${newUser.name}"`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('User removed');
  };

  // Helper to recursively get all subfolder IDs under a folder
  const getAllSubfolderIds = (folderId: string, allFolders: FolderItem[]): string[] => {
    const directChildren = allFolders.filter((f) => {
      const pId = f.parentId !== undefined ? f.parentId : (f as any).parent_id;
      return pId === folderId;
    });
    let ids = directChildren.map((f) => f.id);
    directChildren.forEach((child) => {
      ids = [...ids, ...getAllSubfolderIds(child.id, allFolders)];
    });
    return ids;
  };

  // Dynamic Computation of Folders with Aggregated File Counts & Sizes
  const computedFolders = useMemo(() => {
    return folders.map((folder) => {
      const allNestedFolderIds = [folder.id, ...getAllSubfolderIds(folder.id, folders)];
      const folderDocs = documents.filter((d) => {
        const fId = d.folderId !== undefined ? d.folderId : (d as any).folder_id;
        return fId && allNestedFolderIds.includes(fId);
      });
      const count = folderDocs.length;

      let totalMB = 0;
      folderDocs.forEach((d) => {
        const val = parseFloat(d.size.replace(/[^0-9.]/g, '')) || 0;
        totalMB += val;
      });

      return {
        ...folder,
        fileCount: count,
        totalSize: `${totalMB.toFixed(1)} MB`,
      };
    });
  }, [folders, documents]);

  // Compute Breadcrumb Navigation Path
  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Folders' }];

    let currId = currentFolderId;
    const pathStack: { id: string; name: string }[] = [];

    while (currId) {
      const found = folders.find((f) => f.id === currId);
      if (found) {
        pathStack.unshift({ id: found.id, name: found.name });
        const pId = found.parentId !== undefined ? found.parentId : (found as any).parent_id;
        currId = pId || null;
      } else {
        break;
      }
    }

    return [...crumbs, ...pathStack];
  }, [currentFolderId, folders]);

  // Soft-deleted item memos for Admin Recycle Bin
  const deletedFolders = useMemo(() => computedFolders.filter((f) => f.isDeleted), [computedFolders]);
  const deletedDocuments = useMemo(() => documents.filter((d) => d.isDeleted), [documents]);

  // Active Subfolders (Filtered by search & sorted, excluding soft-deleted items)
  const activeSubfolders = useMemo(() => {
    let list = computedFolders.filter((f) => !f.isDeleted);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => (f.name || '').toLowerCase().includes(q));
    } else {
      list = list.filter((f) => {
        const pId = f.parentId !== undefined ? f.parentId : (f as any).parent_id;
        return (pId || null) === currentFolderId;
      });
    }

    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'dateAdded') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'author') {
        comparison = (a.name || '').localeCompare(b.name || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [computedFolders, currentFolderId, searchQuery, sortField, sortOrder]);

  // Documents in current active directory location or filtered view (Excludes soft-deleted items)
  const filteredAndSortedDocuments = useMemo(() => {
    let result = documents.filter((d) => !d.isDeleted);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          (d.name || '').toLowerCase().includes(q) ||
          (d.author?.name || '').toLowerCase().includes(q) ||
          (d.type || '').toLowerCase().includes(q) ||
          (d.dateAdded || '').toLowerCase().includes(q)
      );
    } else if (activeNav === 'tag-important') {
      result = result.filter((d) => d.tag === 'important');
    } else if (activeNav === 'tag-normal') {
      result = result.filter((d) => d.tag === 'normal');
    } else if (activeNav === 'documents') {
      result = result.filter((d) => ((d.folderId !== undefined ? d.folderId : (d as any).folder_id) || null) === currentFolderId);
    }

    return result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'dateAdded') {
        const dateA = a.rawDate || a.dateAdded || '';
        const dateB = b.rawDate || b.dateAdded || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === 'author') {
        const authorA = a.author?.name || '';
        const authorB = b.author?.name || '';
        comparison = authorA.localeCompare(authorB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [documents, activeNav, currentFolderId, searchQuery, sortField, sortOrder]);

  // Folder-Based Permission Check: Student -> Read-Only; Lecturer -> Authorized Folders; Admin -> Full Access
  const canUserModifyFolder = useMemo(() => {
    const role = currentUser?.role || currentRole;
    if (role === 'student') return false;
    if (role === 'admin') return true;
    if (role === 'uploader' || role === 'lecturer') {
      if (!currentFolderId) return true;
      const currentFolder = folders.find((f) => f.id === currentFolderId);
      if (!currentFolder) return true;
      const userDept = (currentUser?.department || 'CSE').toLowerCase();
      const folderNameLower = (currentFolder.name || '').toLowerCase();
      const folderIdLower = (currentFolder.id || '').toLowerCase();
      if ((folderIdLower.includes('ece') || folderNameLower.includes('ece')) && userDept !== 'ece') return false;
      if ((folderIdLower.includes('me') || folderNameLower.includes('me')) && userDept !== 'me') return false;
      if ((folderIdLower.includes('aids') || folderNameLower.includes('ai & ds')) && !userDept.includes('ai')) return false;
      return true;
    }
    return false;
  }, [currentUser, currentRole, currentFolderId, folders]);

  // Folder Explorer Logic Actions
  const handleCreateFolder = async (name: string, parentId: string | null) => {
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
      fileCount: 0,
      totalSize: '0 MB',
    };
    setFolders((prev) => [...prev, newFolder]);
    showToast(`Created folder "${name}"`);

    // Sync to Supabase with schema fallbacks
    try {
      const fullFolderPayload: any = {
        id: newFolder.id,
        name: newFolder.name,
        parent_id: parentId || null,
        file_count: 0,
        total_size: '0 MB',
        is_deleted: false,
      };
      const { error: fullErr } = await supabase.from('folders').upsert([fullFolderPayload], { onConflict: 'id' });
      if (fullErr) {
        console.warn('Full folder insert warning, trying minimal payload:', fullErr.message);
        const minimalFolderPayload: any = {
          id: newFolder.id,
          name: newFolder.name,
          parent_id: parentId || null,
        };
        const { error: minErr } = await supabase.from('folders').upsert([minimalFolderPayload], { onConflict: 'id' });
        if (minErr) {
          console.error('Minimal folder insert error:', minErr.message);
        }
      }
    } catch (e) {
      console.error('Failed to sync new folder to Supabase:', e);
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
    );
    showToast(`Renamed folder to "${newName}"`);

    try {
      await supabase.from('folders').update({ name: newName }).eq('id', folderId);
    } catch (e) {
      // ignore offline fallback
    }
  };

  const handleDeleteFolder = async (folderId: string, skipConfirm = false) => {
    const folderToDelete = folders.find((f) => f.id === folderId);
    if (!folderToDelete) return;
    if (!skipConfirm && !confirm(`Are you sure you want to delete folder "${folderToDelete.name}"? It will be moved to the Admin Recycle Bin.`)) {
      return;
    }
    const idsToSoftDelete = [folderId, ...getAllSubfolderIds(folderId, folders)];
    const now = new Date().toISOString();
    const userName = currentUser.name || currentUser.email || 'User';

    setFolders((prev) =>
      prev.map((f) => (idsToSoftDelete.includes(f.id) ? { ...f, isDeleted: true, deletedAt: now, deletedBy: userName } : f))
    );
    setDocuments((prev) =>
      prev.map((d) => (d.folderId && idsToSoftDelete.includes(d.folderId) ? { ...d, isDeleted: true, deletedAt: now, deletedBy: userName } : d))
    );
    setSelectedFolderIds((prev) => prev.filter((id) => !idsToSoftDelete.includes(id)));
    showToast(`Moved folder "${folderToDelete.name}" to Recycle Bin`);

    try {
      await supabase.from('folders').update({ is_deleted: true, deleted_at: now, deleted_by: userName }).in('id', idsToSoftDelete);
      await supabase.from('documents').update({ is_deleted: true, deleted_at: now, deleted_by: userName }).in('folder_id', idsToSoftDelete);
    } catch (e) {
      // ignore offline fallback
    }
  };

  const handleMoveDocToFolder = (docId: string, targetFolderId: string | null) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, folderId: targetFolderId } : d))
    );
    const targetFolder = folders.find((f) => f.id === targetFolderId);
    showToast(`Moved file to ${targetFolder ? `"${targetFolder.name}"` : 'Folders'}`);
  };

  const handleMoveSelectedDocsToFolder = (targetFolderId: string | null) => {
    setDocuments((prev) =>
      prev.map((d) => (selectedDocIds.includes(d.id) ? { ...d, folderId: targetFolderId } : d))
    );
    const targetFolder = folders.find((f) => f.id === targetFolderId);
    const count = selectedDocIds.length;
    setSelectedDocIds([]);
    showToast(`Moved ${count} file(s) to ${targetFolder ? `"${targetFolder.name}"` : 'Folders'}`);
  };
  const handleDownloadSelectedFolders = async () => {
    if (selectedFolderIds.length === 0) return;
    showToast(`Preparing ZIP archive for ${selectedFolderIds.length} folder(s)...`);

    try {
      const zip = new JSZip();

      // Recursive helper function to populate zip folders and files
      const addFolderContentToZip = async (folderId: string, currentZipDir: JSZip) => {
        const folderObj = folders.find((f) => f.id === folderId);
        if (!folderObj) return;

        // Get files in this folder
        const docsInFolder = documents.filter(
          (d) => (d.folderId !== undefined ? d.folderId : (d as any).folder_id) === folderId
        );

        for (const doc of docsInFolder) {
          const docUrl = (doc as any).url || (doc as any).fileUrl;
          if (docUrl) {
            try {
              const res = await fetch(docUrl);
              const blob = await res.blob();
              currentZipDir.file(doc.name, blob);
            } catch (err) {
              currentZipDir.file(doc.name, `Content of ${doc.name}`);
            }
          } else {
            currentZipDir.file(
              doc.name,
              `File: ${doc.name}\nSize: ${doc.size}\nDate: ${doc.dateAdded || 'N/A'}`
            );
          }
        }

        // Subfolders recursion
        const subfolders = folders.filter((f) => {
          const pId = f.parentId !== undefined ? f.parentId : (f as any).parent_id;
          return pId === folderId;
        });

        for (const sub of subfolders) {
          const subDir = currentZipDir.folder(sub.name);
          if (subDir) {
            await addFolderContentToZip(sub.id, subDir);
          }
        }
      };

      for (const folderId of selectedFolderIds) {
        const folderObj = folders.find((f) => f.id === folderId);
        if (folderObj) {
          const targetDir = selectedFolderIds.length === 1 ? zip : zip.folder(folderObj.name);
          if (targetDir) {
            await addFolderContentToZip(folderId, targetDir);
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const mainFolder = folders.find((f) => f.id === selectedFolderIds[0]);
      const zipFilename =
        selectedFolderIds.length === 1
          ? `${mainFolder?.name || 'Folder'}.zip`
          : 'cec_drive_selected_folders.zip';

      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      showToast(`Downloaded "${zipFilename}"`);
    } catch (error) {
      console.error('Error creating ZIP archive:', error);
      showToast('Failed to generate ZIP archive');
    }
  };

  // Selection handlers
  const handleToggleSelectFolder = (id: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedFolderIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setSelectedFolderIds((prev) => (prev.length === 1 && prev[0] === id ? [] : [id]));
    }
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
    setActiveNav('documents');
  };

  const handleToggleSelectDoc = (id: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedDocIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setSelectedDocIds((prev) => (prev.length === 1 && prev[0] === id ? [] : [id]));
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedDocIds.length === filteredAndSortedDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredAndSortedDocuments.map((d) => d.id));
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, a, [role="button"], [role="checkbox"], .group')) {
      return;
    }
    if (selectedFolderIds.length > 0) {
      setSelectedFolderIds([]);
    }
    if (selectedDocIds.length > 0) {
      setSelectedDocIds([]);
    }
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDownloadDoc = async (doc: DocumentItem) => {
    showToast(`Downloading "${doc.name}"...`);
    const downloadRes = await handleSecureFileDownload(doc, activeUserProfile || currentUser);
    if (downloadRes.success) {
      showToast(`Started download for "${doc.name}"`);
      return;
    }
    // Fallback file generation with appropriate extension matching file type
    let extension = '.pdf';
    let mimeType = 'application/pdf';
    if (doc.type === 'sheet') {
      extension = '.xlsx';
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (doc.type === 'doc') {
      extension = '.docx';
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (doc.type === 'spec') {
      extension = '.pptx';
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    }

    const filename = doc.name.includes('.') ? doc.name : `${doc.name}${extension}`;
    const dummyBlob = new Blob([`Content of ${doc.name}`], { type: mimeType });
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteDoc = async (id: string, skipConfirm = false) => {
    const docToDelete = documents.find((d) => d.id === id);
    if (!docToDelete) return;
    if (!skipConfirm && !confirm(`Are you sure you want to delete file "${docToDelete.name}"? It will be moved to the Admin Recycle Bin.`)) {
      return;
    }
    const now = new Date().toISOString();
    const userName = currentUser.name || currentUser.email || 'User';

    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDeleted: true, deletedAt: now, deletedBy: userName } : d))
    );
    setSelectedDocIds((prev) => prev.filter((item) => item !== id));
    showToast(`Moved "${docToDelete.name}" to Recycle Bin`);

    try {
      await supabase.from('documents').update({ is_deleted: true, deleted_at: now, deleted_by: userName }).eq('id', id);
    } catch (e) {
      // ignore offline fallback
    }

    logActivity({
      userId: currentUser.id || null,
      userName,
      action: 'DELETE',
      fileId: id,
      fileName: docToDelete.name,
      details: `Soft-deleted "${docToDelete.name}" to Recycle Bin`,
    });
  };

  // Restore and Permanent Purge Handlers for Admin Recycle Bin
  const handleRestoreDoc = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isDeleted: false, deletedAt: undefined, deletedBy: undefined } : d))
    );
    showToast(`Restored file "${doc?.name || 'File'}"`);
    try {
      await supabase.from('documents').update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq('id', docId);
    } catch (e) {}
  };

  const handleRestoreFolder = async (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    const idsToRestore = [folderId, ...getAllSubfolderIds(folderId, folders)];
    setFolders((prev) =>
      prev.map((f) => (idsToRestore.includes(f.id) ? { ...f, isDeleted: false, deletedAt: undefined, deletedBy: undefined } : f))
    );
    setDocuments((prev) =>
      prev.map((d) => (d.folderId && idsToRestore.includes(d.folderId) ? { ...d, isDeleted: false, deletedAt: undefined, deletedBy: undefined } : d))
    );
    showToast(`Restored folder "${folder?.name || 'Folder'}"`);
    try {
      await supabase.from('folders').update({ is_deleted: false, deleted_at: null, deleted_by: null }).in('id', idsToRestore);
      await supabase.from('documents').update({ is_deleted: false, deleted_at: null, deleted_by: null }).in('folder_id', idsToRestore);
    } catch (e) {}
  };

  const handlePermanentDeleteDoc = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!confirm(`Are you sure you want to PERMANENTLY delete file "${doc?.name || 'File'}"? This action cannot be undone.`)) {
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showToast(`Permanently deleted "${doc?.name || 'File'}"`);
    try {
      await supabase.from('documents').delete().eq('id', docId);
    } catch (e) {}
  };

  const handlePermanentDeleteFolder = async (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!confirm(`Are you sure you want to PERMANENTLY delete folder "${folder?.name || 'Folder'}" and all its contents? This action cannot be undone.`)) {
      return;
    }
    const idsToPurge = [folderId, ...getAllSubfolderIds(folderId, folders)];
    setFolders((prev) => prev.filter((f) => !idsToPurge.includes(f.id)));
    setDocuments((prev) => prev.filter((d) => !d.folderId || !idsToPurge.includes(d.folderId)));
    showToast(`Permanently deleted folder "${folder?.name || 'Folder'}"`);
    try {
      await supabase.from('folders').delete().in('id', idsToPurge);
      await supabase.from('documents').delete().in('folder_id', idsToPurge);
    } catch (e) {}
  };

  const handleEmptyRecycleBin = async () => {
    const totalCount = deletedDocuments.length + deletedFolders.length;
    if (totalCount === 0) return;
    if (!confirm(`Are you sure you want to PERMANENTLY delete ALL ${totalCount} items in the Recycle Bin? This action cannot be undone.`)) {
      return;
    }
    const docIds = deletedDocuments.map((d) => d.id);
    const folderIds = deletedFolders.map((f) => f.id);

    setDocuments((prev) => prev.filter((d) => !d.isDeleted));
    setFolders((prev) => prev.filter((f) => !f.isDeleted));
    showToast(`Emptied Recycle Bin (Purged ${totalCount} items)`);

    try {
      if (docIds.length > 0) await supabase.from('documents').delete().in('id', docIds);
      if (folderIds.length > 0) await supabase.from('folders').delete().in('id', folderIds);
    } catch (e) {}
  };

  const handleDownloadSelected = async () => {
    if (selectedDocIds.length === 0) return;
    if (selectedDocIds.length === 1) {
      const doc = documents.find((d) => d.id === selectedDocIds[0]);
      if (doc) {
        await handleDownloadDoc(doc);
      }
    } else {
      showToast(`Preparing ZIP archive for ${selectedDocIds.length} file(s)...`);
      try {
        const zip = new JSZip();
        for (const id of selectedDocIds) {
          const doc = documents.find((d) => d.id === id);
          if (!doc) continue;
          const docUrl = (doc as any).url || (doc as any).fileUrl;
          if (docUrl) {
            try {
              const res = await fetch(docUrl);
              const blob = await res.blob();
              zip.file(doc.name, blob);
            } catch (e) {
              zip.file(doc.name, `Content of ${doc.name}`);
            }
          } else {
            zip.file(doc.name, `File: ${doc.name}\nSize: ${doc.size}\nDate: ${doc.dateAdded || 'N/A'}`);
          }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cec_drive_selected_files.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloaded selected files as ZIP archive');
      } catch (err) {
        console.error('Error zipping files:', err);
        showToast('Failed to download files');
      }
    }
  };

  const handleMarkImportant = (id?: string) => {
    if (id) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, tag: d.tag === 'important' ? 'normal' : 'important' } : d))
      );
      showToast('Toggled file tag priority');
    } else {
      setDocuments((prev) =>
        prev.map((d) =>
          selectedDocIds.includes(d.id) ? { ...d, tag: 'important' } : d
        )
      );
      showToast(`Marked ${selectedDocIds.length} documents as Important`);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFolderIds.length > 0) {
      const count = selectedFolderIds.length;
      if (!confirm(`Are you sure you want to delete ${count} selected folder(s)? They will be moved to the Admin Recycle Bin.`)) {
        return;
      }
      const idsToDelete = [...selectedFolderIds];
      for (const id of idsToDelete) {
        await handleDeleteFolder(id, true);
      }
      setSelectedFolderIds([]);
      return;
    }

    if (selectedDocIds.length > 0) {
      const count = selectedDocIds.length;
      if (!confirm(`Are you sure you want to delete ${count} selected file(s)? They will be moved to the Admin Recycle Bin.`)) {
        return;
      }
      const idsToDelete = [...selectedDocIds];
      for (const id of idsToDelete) {
        await handleDeleteDoc(id, true);
      }
      setSelectedDocIds([]);
    }
  };

  const handleAddDocument = async (newDoc: DocumentItem) => {
    setDocuments((prev) => deduplicateDocuments([newDoc, ...prev]));
    showToast(`Document "${newDoc.name}" published`);

    // Sync to Supabase
    try {
      await supabase.from('documents').insert([newDoc]);
    } catch (e) {
      // offline fallback
    }
  };

  const handleToggleStar = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d))
    );
    if (previewDoc && previewDoc.id === id) {
      setPreviewDoc((prev) => (prev ? { ...prev, starred: !prev.starred } : null));
    }
  };

  if (!isAuthenticated) {
    return (
      <LandingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          activeNav={activeNav}
          onSelectNav={handleSelectNav}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          folders={computedFolders}
          pinnedFolderIds={pinnedFolderIds}
          currentFolderId={currentFolderId}
          onNavigateFolder={setCurrentFolderId}
          notifications={notifications}
          deletedCount={deletedDocuments.length + deletedFolders.length}
        />
      </div>

      {/* Mobile Off-Canvas Drawer Container */}
      <div
        className={`fixed inset-0 z-50 md:hidden flex transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Sidebar */}
        <div
          className={`relative z-10 w-64 sm:w-72 h-full bg-white dark:bg-black shadow-2xl transition-transform duration-300 ease-in-out transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            activeNav={activeNav}
            onSelectNav={handleSelectNav}
            collapsed={false}
            onToggleCollapse={() => setMobileMenuOpen(false)}
            theme={theme}
            onToggleTheme={toggleTheme}
            currentUser={currentUser}
            folders={computedFolders}
            pinnedFolderIds={pinnedFolderIds}
            currentFolderId={currentFolderId}
            onNavigateFolder={(id) => {
              setCurrentFolderId(id);
              setNotifications((prev: Record<string, boolean>) => ({ ...prev, folders: false }));
            }}
            notifications={notifications}
            deletedCount={deletedDocuments.length + deletedFolders.length}
          />
        </div>
      </div>

      {/* Main Viewport Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-black focus:outline-none">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-16 border-b border-neutral-100 dark:border-neutral-900/60 bg-white/80 dark:bg-black/80 backdrop-blur-sm shrink-0 min-w-0 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
              aria-label={mobileMenuOpen ? "Close navigation drawer" : "Open navigation drawer"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
              ) : (
                <svg className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </svg>
              )}
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 min-w-0 flex-1 overflow-hidden">
              <FolderIcon className="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0" />
              <button
                onClick={() => {
                  if (currentUser.role === 'admin') setActiveNav('admin-panel');
                  else if (currentUser.role === 'uploader') setActiveNav('lecturer-panel');
                  else setActiveNav('dashboard');
                  setCurrentFolderId(null);
                }}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors font-medium whitespace-nowrap shrink-0"
              >
                CEC Drive
              </button>
              <span className="text-neutral-300 dark:text-neutral-700 shrink-0" aria-hidden="true">
                •
              </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate min-w-0">
                {activeNav === 'admin-panel'
                  ? 'Admin Control Center'
                  : activeNav === 'lecturer-panel'
                  ? 'Lecturer Upload Hub'
                  : activeNav === 'dashboard'
                  ? 'Student Dashboard'
                  : activeNav === 'calendar'
                  ? 'Academic Calendar'
                  : activeNav === 'pinned-folders'
                  ? 'Pinned Folders & Files'
                  : activeNav === 'recent-files'
                  ? 'Recent Files'
                  : activeNav === 'announcements'
                  ? 'Announcements'
                  : activeNav === 'inbox'
                  ? 'Inbox'
                  : activeNav === 'my-tasks'
                  ? 'My Tasks'
                  : currentFolderId
                  ? folders.find((f) => f.id === currentFolderId)?.name
                  : 'File Directory'}
              </span>
            </nav>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Control Panel Role Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold shrink-0">
              {currentUser.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-purple-600 dark:text-purple-400">Admin Mode</span>
                </>
              ) : currentUser.role === 'uploader' ? (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Lecturer Mode</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400">Student Mode</span>
                </>
              )}
            </div>

            {canUserModifyFolder && (
              <button
                onClick={() => setIsNewDocModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline font-semibold">New File</span>
              </button>
            )}

            {/* Top-Right User Account Avatar Menu */}
            <HeaderAccountMenu
              user={activeUserProfile || currentUser}
              userRole={currentUser.role}
              onLogout={handleLogout}
              onOpenSettings={() => setActiveNav('profile' as any)}
              onOpenProfile={() => setActiveNav('profile' as any)}
            />
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <div
          onClick={handleBackgroundClick}
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-5 pb-24 sm:py-7 space-y-6 sm:space-y-8"
        >
          {(activeNav as string) === 'profile' ? (
            <ProfileView
              user={activeUserProfile || currentUser}
              userRole={currentUser.role}
              onLogout={handleLogout}
              onOpenResetPassword={() => setIsResetPasswordModalOpen(true)}
            />
          ) : activeNav === 'admin-panel' ? (
            <AdminPanel
              users={users}
              folders={folders}
              documents={documents}
              onUpdateUserRole={handleUpdateUserRole}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onCreateFolder={handleCreateFolder}
            />
          ) : activeNav === 'lecturer-panel' ? (
            <LecturerPanel
              documents={documents}
              folders={computedFolders}
              currentLecturerName={currentUser.name}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDoc}
              onToggleImportant={handleMarkImportant}
            />
          ) : activeNav === 'dashboard' ? (
            <Dashboard
              onSelectNav={(key) => {
                setActiveNav(key);
                if (key !== 'documents') setCurrentFolderId(null);
              }}
              onPreviewDoc={(doc) => setPreviewDoc(doc)}
              onDownloadDoc={handleDownloadDoc}
              documents={documents}
            />
          ) : activeNav === 'calendar' ? (
            <CalendarView />
          ) : activeNav === 'pinned-folders' ? (
            <div className="space-y-6">
              <FolderToolbar
                currentFolderId={currentFolderId}
                breadcrumbs={[
                  { id: null, name: 'Folders' },
                  { id: 'pinned-folders', name: 'Pinned Folders' },
                ]}
                folders={computedFolders}
                selectedFolderIds={selectedFolderIds}
                selectedDocIds={selectedDocIds}
                viewMode={viewMode}
                sortField={sortField}
                sortOrder={sortOrder}
                searchQuery={searchQuery}
                pinnedFolderIds={pinnedFolderIds}
                onNavigateToFolder={(id) => {
                  if (id === null) {
                    setActiveNav('documents');
                    setCurrentFolderId(null);
                  } else {
                    setCurrentFolderId(id);
                    setActiveNav('documents');
                  }
                }}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onOpenNewFileModal={() => setIsNewDocModalOpen(true)}
                onMoveSelectedDocs={handleMoveSelectedDocsToFolder}
                onDownloadSelectedFolders={handleDownloadSelectedFolders}
                onDownloadSelected={handleDownloadSelected}
                onDeleteSelected={handleDeleteSelected}
                onTogglePinFolder={handleTogglePinFolder}
                onViewModeChange={setViewMode}
                onSortFieldChange={setSortField}
                onSortOrderChange={setSortOrder}
                onSearchChange={setSearchQuery}
                canModify={canUserModifyFolder}
              />
              <PinnedFoldersView
                pinnedFolderIds={pinnedFolderIds}
                folders={computedFolders}
                selectedFolderIds={selectedFolderIds}
                viewMode={viewMode}
                sortField={sortField}
                sortOrder={sortOrder}
                searchQuery={searchQuery}
                onNavigateFolder={(id) => {
                  setCurrentFolderId(id);
                  setActiveNav('documents');
                }}
                onTogglePinFolder={handleTogglePinFolder}
                onToggleSelectFolder={handleToggleSelectFolder}
              />
            </div>
          ) : activeNav === 'recent-files' ? (
            <RecentFilesView
              documents={documents}
              onPreviewDoc={(doc) => setPreviewDoc(doc)}
              onDownloadDoc={handleDownloadDoc}
            />
          ) : activeNav === 'announcements' ? (
            <AnnouncementsView />
          ) : activeNav === 'inbox' ? (
            <Inbox
              onSelectNav={setActiveNav}
              onPreviewDoc={(doc) => setPreviewDoc(doc)}
              onDownloadDoc={handleDownloadDoc}
            />
          ) : activeNav === 'my-tasks' ? (
            <MyTasks onSelectNav={setActiveNav} />
          ) : activeNav === 'recycle-bin' ? (
            <RecycleBinView
              deletedFolders={deletedFolders}
              deletedDocuments={deletedDocuments}
              allFolders={computedFolders}
              onRestoreFolder={handleRestoreFolder}
              onRestoreDoc={handleRestoreDoc}
              onPermanentDeleteFolder={handlePermanentDeleteFolder}
              onPermanentDeleteDoc={handlePermanentDeleteDoc}
              onEmptyRecycleBin={handleEmptyRecycleBin}
            />
          ) : (
            <>
              {/* File Explorer Path & Command Bar */}
              <FolderToolbar
                currentFolderId={currentFolderId}
                breadcrumbs={breadcrumbs}
                folders={computedFolders}
                selectedFolderIds={selectedFolderIds}
                selectedDocIds={selectedDocIds}
                viewMode={viewMode}
                sortField={sortField}
                sortOrder={sortOrder}
                searchQuery={searchQuery}
                pinnedFolderIds={pinnedFolderIds}
                onNavigateToFolder={setCurrentFolderId}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onOpenNewFileModal={() => setIsNewDocModalOpen(true)}
                onMoveSelectedDocs={handleMoveSelectedDocsToFolder}
                onDownloadSelectedFolders={handleDownloadSelectedFolders}
                onDownloadSelected={handleDownloadSelected}
                onDeleteSelected={handleDeleteSelected}
                onTogglePinFolder={handleTogglePinFolder}
                onViewModeChange={setViewMode}
                onSortFieldChange={setSortField}
                onSortOrderChange={setSortOrder}
                onSearchChange={setSearchQuery}
                canModify={canUserModifyFolder}
              />

              {/* Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {currentFolderId
                      ? folders.find((f) => f.id === currentFolderId)?.name
                      : 'File Directory & Resource Folders'}
                  </h1>
                </div>
              </div>

              {/* Section: Subfolders Directory */}
              {activeSubfolders.length > 0 && (
                <section aria-labelledby="subfolders-heading">
                  <div className="flex items-center justify-between mb-3.5">
                    <h2
                      id="subfolders-heading"
                      className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                    >
                      Folders ({activeSubfolders.length})
                    </h2>
                    {selectedFolderIds.length > 0 && (
                      <button
                        onClick={() => setSelectedFolderIds([])}
                        className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      >
                        Clear selection ({selectedFolderIds.length})
                      </button>
                    )}
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                      {activeSubfolders.map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          isSelected={selectedFolderIds.includes(folder.id)}
                          hasActiveSelection={selectedFolderIds.length > 0}
                          onToggleSelect={handleToggleSelectFolder}
                          onClick={handleFolderClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <FolderList
                      folders={activeSubfolders}
                      selectedIds={selectedFolderIds}
                      hasActiveSelection={selectedFolderIds.length > 0}
                      onToggleSelect={handleToggleSelectFolder}
                      onFolderClick={handleFolderClick}
                      onDownloadFolder={(id) => {
                        setSelectedFolderIds([id]);
                        setTimeout(() => {
                          handleDownloadSelectedFolders();
                        }, 50);
                      }}
                      onRenameFolder={(id) => {
                        const folderToRename = folders.find((f) => f.id === id);
                        if (folderToRename) {
                          const newName = prompt('Enter new folder name:', folderToRename.name);
                          if (newName && newName.trim()) {
                            handleRenameFolder(id, newName.trim());
                          }
                        }
                      }}
                      onDeleteFolder={handleDeleteFolder}
                      canModify={canUserModifyFolder}
                    />
                  )}
                </section>
              )}

              {/* Section: Documents Repository */}
              <section aria-label="Documents repository">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Files
                    </span>
                    <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 tabular-nums">
                      ({filteredAndSortedDocuments.length})
                    </span>
                  </div>
                </div>

                {filteredAndSortedDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <FolderIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      No files in this directory folder
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                      {currentUser.role === 'student'
                        ? 'There are currently no files uploaded in this subject folder.'
                        : 'Use the "Add File" button above or drag & drop documents into this folder.'}
                    </p>
                  </div>
                ) : viewMode === 'list' ? (
                  <DocumentTable
                    documents={filteredAndSortedDocuments}
                    selectedIds={selectedDocIds}
                    onToggleSelect={handleToggleSelectDoc}
                    onToggleSelectAll={handleToggleSelectAll}
                    onDocumentClick={(doc) => setPreviewDoc(doc)}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    onDownload={handleDownloadDoc}
                    onDelete={canUserModifyFolder ? handleDeleteDoc : undefined}
                  />
                ) : (
                  <DocumentGrid
                    documents={filteredAndSortedDocuments}
                    selectedIds={selectedDocIds}
                    hasActiveSelection={selectedDocIds.length > 0}
                    onToggleSelect={handleToggleSelectDoc}
                    onDocumentClick={(doc) => setPreviewDoc(doc)}
                    onDownload={handleDownloadDoc}
                    onDelete={canUserModifyFolder ? handleDeleteDoc : undefined}
                  />
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedDocIds.length > 0 ? selectedDocIds.length : selectedFolderIds.length}
        onClearSelection={() => {
          setSelectedDocIds([]);
          setSelectedFolderIds([]);
        }}
        onDownloadSelected={
          selectedFolderIds.length > 0 ? handleDownloadSelectedFolders : handleDownloadSelected
        }
        onMarkImportant={handleMarkImportant}
        onDeleteSelected={
          selectedFolderIds.length > 0
            ? () => {
                if (confirm(`Delete ${selectedFolderIds.length} selected folder(s)?`)) {
                  selectedFolderIds.forEach((id) => handleDeleteFolder(id));
                }
              }
            : handleDeleteSelected
        }
        canDelete={canUserModifyFolder}
      />

      {/* Document Detail Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownloadDoc}
        onToggleStar={handleToggleStar}
        folders={computedFolders}
        onMoveDocToFolder={handleMoveDocToFolder}
        userRole={currentUser?.role}
      />

      {/* Create / Upload New Document Modal */}
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        onAddDocument={handleAddDocument}
        folders={computedFolders}
        defaultFolderId={currentFolderId}
        currentUserProfile={activeUserProfile || currentUser}
      />

      {/* Set New Password Modal (Password Recovery Flow) */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSuccess={handleResetPasswordSuccess}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeNav={activeNav}
        userRole={currentUser.role}
        onSelectNav={(key) => handleSelectNav(key as any)}
      />

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Glitch-Protection Butter-Smooth Splash Loading Overlay */}
      {isInitialLoading && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-neutral-950 transition-opacity duration-300 ease-out ${
            fadeSplashOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <CECDriveLoader />
        </div>
      )}
    </div>
  );
}
