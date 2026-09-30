import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder as FolderIcon,
  Search,
  Plus,
  Menu,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  UserCheck,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inbox } from './components/Inbox';
import { MyTasks } from './components/MyTasks';
import { AdminPanel } from './components/AdminPanel';
import { LecturerPanel } from './components/LecturerPanel';
import { FolderCard } from './components/FolderCard';
import { FolderToolbar } from './components/FolderToolbar';
import { DocumentTable, SortField, SortOrder } from './components/DocumentTable';
import { DocumentGrid } from './components/DocumentGrid';
import { BatchActionBar } from './components/BatchActionBar';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { NewDocumentModal } from './components/NewDocumentModal';
import { supabase } from './lib/supabase';
import {
  DocumentItem,
  FolderItem,
  ViewMode,
  ThemeMode,
  ActiveNavKey,
  UserRole,
  UserProfile,
} from './types';

// Complete Academic Directory Hierarchy:
// Year (2026-2027) -> Semester (1st to 8th) -> Department (CSE, ECE, ME, AI&DS) -> Section (Sec A, Sec B) -> Subject Notes -> Files
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
      root.style.backgroundColor = '#000000';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#ffffff';
    }
    localStorage.setItem('synapse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');

  const currentUser = useMemo(() => {
    const found = users.find((u) => u.role === currentRole);
    return found || users[0];
  }, [users, currentRole]);

  const [activeNav, setActiveNav] = useState<ActiveNavKey>('documents');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe Supabase Data Fetching with complete schema mapping
  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        const { data: remoteDocs, error: docErr } = await supabase.from('documents').select('*');
        if (!docErr && remoteDocs && Array.isArray(remoteDocs) && remoteDocs.length > 0) {
          const mappedDocs: DocumentItem[] = remoteDocs.map((r: any) => {
            const authorName = r.author_name || r.authorName || r.author?.name || 'Prof. Sharma';
            const authorInitial = r.author_initial || r.authorInitial || r.author?.initial || authorName.charAt(0) || 'S';
            const authorBg = r.author_bg_color || r.authorBgColor || r.author?.bgColor || 'bg-purple-600';

            return {
              id: String(r.id),
              name: r.name || 'Untitled Document',
              dateAdded: r.date_added || r.dateAdded || 'Today',
              rawDate: r.raw_date || r.rawDate || new Date().toISOString().split('T')[0],
              author: {
                name: authorName,
                initial: authorInitial,
                bgColor: authorBg,
              },
              folderId: r.folder_id ?? r.folderId ?? null,
              size: r.size || '1.0 MB',
              type: r.type || 'pdf',
              tag: r.tag || 'normal',
              starred: Boolean(r.starred),
            };
          });
          setDocuments(mappedDocs);
        }

        const { data: remoteFolders, error: folderErr } = await supabase.from('folders').select('*');
        if (!folderErr && remoteFolders && Array.isArray(remoteFolders) && remoteFolders.length > 0) {
          const mappedFolders: FolderItem[] = remoteFolders.map((r: any) => ({
            id: String(r.id),
            name: r.name || 'Folder',
            parentId: r.parent_id ?? r.parentId ?? null,
            fileCount: r.file_count ?? r.fileCount ?? 0,
            totalSize: r.total_size || r.totalSize || '0 MB',
          }));
          setFolders(mappedFolders);
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

  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      setActiveNav('admin-panel');
    } else if (newRole === 'uploader') {
      setActiveNav('lecturer-panel');
    } else {
      setActiveNav('dashboard');
    }
    showToast(`Switched view to ${newRole.toUpperCase()} Control Panel`);
  };

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

  // Safe helper to recursively get all subfolder IDs under a folder
  const getAllSubfolderIds = (folderId: string, allFolders: FolderItem[]): string[] => {
    if (!folderId || !Array.isArray(allFolders)) return [];
    const directChildren = allFolders.filter((f) => f && f.parentId === folderId);
    let ids = directChildren.map((f) => f.id);
    directChildren.forEach((child) => {
      if (child && child.id) {
        ids = [...ids, ...getAllSubfolderIds(child.id, allFolders)];
      }
    });
    return ids;
  };

  // Safe Computation of Folders with Aggregated File Counts & Sizes
  const computedFolders = useMemo(() => {
    if (!Array.isArray(folders)) return [];
    return folders.map((folder) => {
      if (!folder) return folder;
      const allNestedFolderIds = [folder.id, ...getAllSubfolderIds(folder.id, folders)];
      const folderDocs = documents.filter((d) => d && d.folderId && allNestedFolderIds.includes(d.folderId));
      const count = folderDocs.length;

      let totalMB = 0;
      folderDocs.forEach((d) => {
        const val = parseFloat(String(d?.size || '0').replace(/[^0-9.]/g, '')) || 0;
        totalMB += val;
      });

      return {
        ...folder,
        fileCount: count,
        totalSize: `${totalMB.toFixed(1)} MB`,
      };
    });
  }, [folders, documents]);

  // Safe Computation of Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Folders' }];
    if (!currentFolderId || !Array.isArray(folders)) return crumbs;

    let currId: string | null = currentFolderId;
    const pathStack: { id: string; name: string }[] = [];
    const visited = new Set<string>();

    while (currId && !visited.has(currId)) {
      visited.add(currId);
      const found = folders.find((f) => f && f.id === currId);
      if (found) {
        pathStack.unshift({ id: found.id, name: found.name || 'Folder' });
        currId = found.parentId || null;
      } else {
        break;
      }
    }

    return [...crumbs, ...pathStack];
  }, [currentFolderId, folders]);

  // Direct Subfolders of current active directory location
  const activeSubfolders = useMemo(() => {
    if (!Array.isArray(computedFolders)) return [];
    return computedFolders.filter((f) => f && f.parentId === currentFolderId);
  }, [computedFolders, currentFolderId]);

  // Documents in current active directory location or filtered view
  const filteredAndSortedDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    let result = [...documents];

    if (activeNav === 'tag-important') {
      result = result.filter((d) => d && d.tag === 'important');
    } else if (activeNav === 'tag-normal') {
      result = result.filter((d) => d && d.tag === 'normal');
    } else if (activeNav === 'documents') {
      result = result.filter((d) => d && (d.folderId || null) === currentFolderId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          (d.name || '').toLowerCase().includes(q) ||
          (d.author?.name || '').toLowerCase().includes(q) ||
          (d.dateAdded || '').toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'dateAdded') {
        comparison = (a.rawDate || '').localeCompare(b.rawDate || '');
      } else if (sortField === 'author') {
        comparison = (a.author?.name || '').localeCompare(b.author?.name || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [documents, activeNav, currentFolderId, searchQuery, sortField, sortOrder]);

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

    try {
      await supabase.from('folders').insert([newFolder]);
    } catch (e) {
      // offline fallback
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

  const handleToggleSelectFolder = (id: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
    setActiveNav('documents');
  };

  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedDocIds.length === filteredAndSortedDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredAndSortedDocuments.map((d) => d.id));
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

  const handleDownloadDoc = (doc: DocumentItem) => {
    showToast(`Downloading "${doc.name}"...`);
  };

  const handleDeleteDoc = (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocIds((prev) => prev.filter((item) => item !== id));
    showToast(`Moved "${docToDelete?.name || 'File'}" to trash`);
  };

  const handleDownloadSelected = () => {
    showToast(`Downloading ${selectedDocIds.length} files as ZIP archive...`);
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          activeNav={activeNav}
          onSelectNav={(key) => {
            setActiveNav(key);
            if (key !== 'documents') {
              setCurrentFolderId(null);
            }
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          folders={computedFolders}
          currentFolderId={currentFolderId}
          onNavigateFolder={(id) => {
            setCurrentFolderId(id);
            setActiveNav('documents');
          }}
          counts={{
            dashboard: 48,
            calendar: 12,
            inbox: 127,
            myTasks: 21,
            folders: folders.length + documents.length,
            important: documents.filter((d) => d && d.tag === 'important').length,
            normal: documents.filter((d) => d && d.tag === 'normal').length,
          }}
        />
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 h-full bg-white dark:bg-black shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              activeNav={activeNav}
              onSelectNav={(key) => {
                setActiveNav(key);
                if (key !== 'documents') {
                  setCurrentFolderId(null);
                }
                setMobileMenuOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              theme={theme}
              onToggleTheme={toggleTheme}
              currentUser={currentUser}
              onSwitchRole={handleSwitchRole}
              folders={computedFolders}
              currentFolderId={currentFolderId}
              onNavigateFolder={(id) => {
                setCurrentFolderId(id);
                setActiveNav('documents');
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Viewport Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-black focus:outline-none">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3.5 border-b border-neutral-100 dark:border-neutral-900/80 bg-white/80 dark:bg-black/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              <FolderIcon className="w-4 h-4 text-blue-500 fill-blue-500/20" />
              <button
                onClick={() => {
                  setActiveNav('documents');
                  setCurrentFolderId(null);
                }}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors font-medium"
              >
                CEC Drive
              </button>
              <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">
                •
              </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[140px] sm:max-w-none">
                {activeNav === 'admin-panel'
                  ? 'Admin Control Center'
                  : activeNav === 'lecturer-panel'
                  ? 'Lecturer Upload Hub'
                  : activeNav === 'dashboard'
                  ? 'Student Dashboard'
                  : activeNav === 'inbox'
                  ? 'Inbox'
                  : activeNav === 'my-tasks'
                  ? 'My Tasks'
                  : currentFolderId
                  ? folders.find((f) => f.id === currentFolderId)?.name || 'Folder'
                  : 'File Explorer'}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold">
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

            <div className="relative hidden sm:block w-44 md:w-56 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="document-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files & folders..."
                className="w-full pl-9 pr-10 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <button
              onClick={() => setIsNewDocModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline font-semibold">New File</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8">
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
              {/* File Explorer Path & Actions Bar */}
              <FolderToolbar
                currentFolderId={currentFolderId}
                breadcrumbs={breadcrumbs}
                folders={computedFolders}
                selectedFolderIds={selectedFolderIds}
                selectedDocIds={selectedDocIds}
                onNavigateToFolder={(id) => {
                  setCurrentFolderId(id);
                  setActiveNav('documents');
                }}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onOpenNewFileModal={() => setIsNewDocModalOpen(true)}
                onMoveSelectedDocs={handleMoveSelectedDocsToFolder}
              />

              {/* Title Row with Segmented View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {currentFolderId
                      ? folders.find((f) => f.id === currentFolderId)?.name || 'Folder Directory'
                      : 'File Directory & Resource Folders'}
                  </h1>
                </div>

                <div
                  role="radiogroup"
                  aria-label="View layout switch"
                  className="inline-flex items-center p-1 rounded-xl bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 select-none self-start sm:self-auto"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={viewMode === 'list'}
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-black text-neutral-900 dark:text-white shadow-xs font-semibold'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <span>List View</span>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={viewMode === 'grid'}
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-black text-neutral-900 dark:text-white shadow-xs font-semibold'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
                    }`}
                  >
                    <span>Grid View</span>
                  </button>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeSubfolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        isSelected={selectedFolderIds.includes(folder.id)}
                        onToggleSelect={handleToggleSelectFolder}
                        onClick={handleFolderClick}
                      />
                    ))}
                  </div>
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
                      Use the "New File" button above or drag & drop documents into this folder.
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
                    onDelete={handleDeleteDoc}
                  />
                ) : (
                  <DocumentGrid
                    documents={filteredAndSortedDocuments}
                    selectedIds={selectedDocIds}
                    onToggleSelect={handleToggleSelectDoc}
                    onDocumentClick={(doc) => setPreviewDoc(doc)}
                    onDownload={handleDownloadDoc}
                    onDelete={handleDeleteDoc}
                  />
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedDocIds.length}
        onClearSelection={() => setSelectedDocIds([])}
        onDownloadSelected={handleDownloadSelected}
        onMarkImportant={handleMarkImportant}
        onDeleteSelected={handleDeleteSelected}
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
