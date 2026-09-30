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
import { Sidebar } from './components/Sidebar';
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
import { BatchActionBar } from './components/BatchActionBar';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { NewDocumentModal } from './components/NewDocumentModal';
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

  // Landing page / authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cec_drive_authenticated');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const meta = session.user.user_metadata;
        if (meta?.role) {
          setCurrentRole(meta.role);
          setUsers((prev) =>
            prev.map((u) =>
              u.role === meta.role
                ? {
                    ...u,
                    name: meta.name || u.name,
                    department: meta.department || u.department,
                  }
                : u
            )
          );
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const meta = session.user.user_metadata;
        if (meta?.role) {
          setCurrentRole(meta.role);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (role?: UserRole, userDetails?: Partial<UserProfile>) => {
    if (role) {
      setCurrentRole(role);
    }
    if (userDetails && role) {
      setUsers((prev) =>
        prev.map((u) => (u.role === role ? { ...u, ...userDetails } : u))
      );
    }
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cec_drive_authenticated', 'true');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase sign out error:', err);
    }
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cec_drive_authenticated', 'false');
    }
  };

  const currentUser = useMemo(() => {
    const found = users.find((u) => u.role === currentRole);
    return found || users[0];
  }, [users, currentRole]);

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

  // User & Role Scoped Pinned Folders (Root folders remain shared, pinned folders are per-user)
  const getUserPinStorageKey = (role: UserRole, userId: string) =>
    `cec_drive_pinned_folders_${role}_${userId || 'default'}`;

  const getRoleDefaultPins = (role: UserRole): string[] => {
    if (role === 'student') return ['sec-cse-a', 'folder-dbms'];
    if (role === 'uploader') return ['dept-cse', 'folder-cn'];
    return ['dept-cse', 'dept-ise'];
  };

  const [pinnedFolderIds, setPinnedFolderIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getUserPinStorageKey(currentRole, currentUser?.id || 'student');
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return getRoleDefaultPins(currentRole);
  });

  // Sync pinned folders when active user role or identity changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getUserPinStorageKey(currentRole, currentUser?.id || 'default');
        const saved = localStorage.getItem(key);
        if (saved) {
          setPinnedFolderIds(JSON.parse(saved));
        } else {
          setPinnedFolderIds(getRoleDefaultPins(currentRole));
        }
      } catch (e) {
        setPinnedFolderIds(getRoleDefaultPins(currentRole));
      }
    }
  }, [currentRole, currentUser?.id]);

  // Persist pinned folder updates for current user role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getUserPinStorageKey(currentRole, currentUser?.id || 'default');
        localStorage.setItem(key, JSON.stringify(pinnedFolderIds));
      } catch (e) {
        // ignore
      }
    }
  }, [pinnedFolderIds, currentRole, currentUser?.id]);

  const handleTogglePinFolder = (folderId: string) => {
    setPinnedFolderIds((prev) => {
      const exists = prev.includes(folderId);
      const updated = exists ? prev.filter((id) => id !== folderId) : [...prev, folderId];
      const folderName = folders.find((f) => f.id === folderId)?.name || 'Folder';
      showToast(exists ? `Unpinned "${folderName}"` : `Pinned "${folderName}" to Quick Access`);
      return updated;
    });
  };

  // View mode: 'list' or 'grid' (grid is default)
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Data states
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
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
      setNotifications((prev) => ({ ...prev, calendar: false }));
    } else if (key === 'pinned-folders') {
      setNotifications((prev) => ({ ...prev, pinned: false }));
    } else if (key === 'recent-files') {
      setNotifications((prev) => ({ ...prev, recent: false }));
    } else if (key === 'announcements') {
      setNotifications((prev) => ({ ...prev, announcements: false }));
    } else if (key === 'documents') {
      setNotifications((prev) => ({ ...prev, folders: false }));
    } else if (key === 'dashboard' || key === 'admin-panel' || key === 'lecturer-panel') {
      setNotifications((prev) => ({ ...prev, dashboard: false }));
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
          }));
          setDocuments(normalizedDocs);
        }

        const { data: remoteFolders, error: folderErr } = await supabase.from('folders').select('*');
        if (!folderErr && remoteFolders && remoteFolders.length > 0) {
          const normalizedFolders: FolderItem[] = remoteFolders.map((f: any) => ({
            id: f.id,
            name: f.name,
            parentId: f.parentId !== undefined ? f.parentId : (f.parent_id !== undefined ? f.parent_id : null),
            fileCount: f.fileCount ?? f.file_count ?? 0,
            totalSize: f.totalSize ?? f.total_size ?? '0 MB',
          }));
          setFolders(normalizedFolders);
        }
      } catch (err) {
        console.log('Supabase sync notice: using initial dataset');
      }
    }
    fetchSupabaseData();
  }, []);

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
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    showToast('User role updated');
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

  // Active Subfolders (Filtered by search & sorted)
  const activeSubfolders = useMemo(() => {
    let list = [...computedFolders];

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

  // Documents in current active directory location or filtered view
  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

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

    // Sync to Supabase
    try {
      await supabase.from('folders').insert([newFolder]);
    } catch (e) {
      // ignore offline fallback
    }
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
    );
    showToast(`Renamed folder to "${newName}"`);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folderToDelete = folders.find((f) => f.id === folderId);
    const idsToRemove = [folderId, ...getAllSubfolderIds(folderId, folders)];
    setFolders((prev) => prev.filter((f) => !idsToRemove.includes(f.id)));
    setDocuments((prev) =>
      prev.map((d) => (d.folderId && idsToRemove.includes(d.folderId) ? { ...d, folderId: null } : d))
    );
    setSelectedFolderIds((prev) => prev.filter((id) => !idsToRemove.includes(id)));
    showToast(`Deleted folder "${folderToDelete?.name || 'Folder'}"`);
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
    const docUrl = (doc as any).url || (doc as any).fileUrl;
    if (docUrl) {
      try {
        const res = await fetch(docUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      } catch (e) {
        console.error('Fetch download failed:', e);
      }
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

  const handleDeleteDoc = (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocIds((prev) => prev.filter((item) => item !== id));
    showToast(`Moved "${docToDelete?.name || 'File'}" to trash`);
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

  const handleDeleteSelected = () => {
    const count = selectedDocIds.length;
    setDocuments((prev) => prev.filter((d) => !selectedDocIds.includes(d.id)));
    setSelectedDocIds([]);
    showToast(`Deleted ${count} documents`);
  };

  const handleAddDocument = async (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
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
              setNotifications((prev) => ({ ...prev, folders: false }));
            }}
            notifications={notifications}
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

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer shrink-0"
              title="Log Out to Landing Page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline font-semibold">Log Out</span>
            </button>

            {(currentUser.role === 'admin' || currentUser.role === 'uploader') && (
              <button
                onClick={() => setIsNewDocModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline font-semibold">New File</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <div
          onClick={handleBackgroundClick}
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8"
        >
          {activeNav === 'admin-panel' ? (
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
                onTogglePinFolder={handleTogglePinFolder}
                onViewModeChange={setViewMode}
                onSortFieldChange={setSortField}
                onSortOrderChange={setSortOrder}
                onSearchChange={setSearchQuery}
                canModify={currentUser.role === 'admin' || currentUser.role === 'uploader'}
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
                onTogglePinFolder={handleTogglePinFolder}
                onViewModeChange={setViewMode}
                onSortFieldChange={setSortField}
                onSortOrderChange={setSortOrder}
                onSearchChange={setSearchQuery}
                canModify={currentUser.role === 'admin' || currentUser.role === 'uploader'}
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
                      canModify={currentUser.role === 'admin' || currentUser.role === 'uploader'}
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
                    onDelete={currentUser.role === 'admin' || currentUser.role === 'uploader' ? handleDeleteDoc : undefined}
                  />
                ) : (
                  <DocumentGrid
                    documents={filteredAndSortedDocuments}
                    selectedIds={selectedDocIds}
                    hasActiveSelection={selectedDocIds.length > 0}
                    onToggleSelect={handleToggleSelectDoc}
                    onDocumentClick={(doc) => setPreviewDoc(doc)}
                    onDownload={handleDownloadDoc}
                    onDelete={currentUser.role === 'admin' || currentUser.role === 'uploader' ? handleDeleteDoc : undefined}
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
        canDelete={currentUser.role === 'admin' || currentUser.role === 'uploader'}
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
      />

      {/* Create / Upload New Document Modal */}
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        onAddDocument={handleAddDocument}
        folders={computedFolders}
        defaultFolderId={currentFolderId}
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
    </div>
  );
}
