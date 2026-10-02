import React, { useState } from 'react';
import {
  LayoutGrid,
  Calendar,
  Pin,
  Clock,
  Megaphone,
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderOpen,
  PanelLeftClose,
  X,
  Sun,
  Moon,
  ShieldCheck,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { SynapseLogo } from './SynapseLogo';
import { ActiveNavKey, ThemeMode, FolderItem, UserRole, UserProfile } from '../types';

interface SidebarProps {
  activeNav: ActiveNavKey;
  onSelectNav: (key: ActiveNavKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser: UserProfile;
  onSwitchRole?: (newRole: UserRole) => void;
  folders?: FolderItem[];
  pinnedFolderIds?: string[];
  currentFolderId?: string | null;
  onNavigateFolder?: (folderId: string | null) => void;
  notifications?: {
    dashboard?: boolean;
    calendar?: boolean;
    pinned?: boolean;
    recent?: boolean;
    announcements?: boolean;
    folders?: boolean;
    important?: boolean;
    normal?: boolean;
  };
  deletedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
  currentUser,
  folders = [],
  pinnedFolderIds = [],
  currentFolderId = null,
  onNavigateFolder,
  notifications = {
    dashboard: false,
    calendar: true,
    pinned: true,
    recent: true,
    announcements: true,
    folders: true,
    important: false,
    normal: false,
  },
  deletedCount = 0,
}) => {
  const [foldersExpanded, setFoldersExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cec_drive_root_folders_expanded');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cec_drive_root_folders_expanded', String(foldersExpanded));
    }
  }, [foldersExpanded]);
  const [pinnedExpanded, setPinnedExpanded] = useState(true);

  // Auto-expand Root Folder category whenever active folder changes
  React.useEffect(() => {
    if (currentFolderId) {
      setFoldersExpanded(true);
    }
  }, [currentFolderId]);

  // Top-level folders (parentId === null) that are NOT soft-deleted
  const rootFolders = folders.filter((f) => {
    const isDel = f.isDeleted || (f as any).is_deleted;
    if (isDel) return false;
    const pId = f.parentId !== undefined ? f.parentId : (f as any).parent_id;
    return pId === null || pId === undefined;
  });

  const handleSelectSidebarFolder = (folderId: string | null) => {
    onSelectNav('documents');
    if (onNavigateFolder) {
      onNavigateFolder(folderId);
    }
  };

  // Single Dashboard label & icon based on current role
  const dashboardConfig =
    currentUser.role === 'admin'
      ? {
          label: 'Admin Dashboard',
          icon: <ShieldCheck className="w-4 h-4 text-purple-500" />,
          targetKey: 'admin-panel' as ActiveNavKey,
        }
      : currentUser.role === 'uploader'
      ? {
          label: 'Lecturer Hub',
          icon: <UploadCloud className="w-4 h-4 text-amber-500" />,
          targetKey: 'lecturer-panel' as ActiveNavKey,
        }
      : {
          label: 'Student Dashboard',
          icon: <LayoutGrid className="w-4 h-4 text-blue-500" />,
          targetKey: 'dashboard' as ActiveNavKey,
        };

  return (
    <aside
      className={`relative flex flex-col h-full bg-white dark:bg-black border-r border-neutral-200/90 dark:border-neutral-900 transition-all duration-300 ease-in-out select-none shrink-0 overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Sidebar navigation"
    >
      {/* Header: Logo + Collapse Button */}
      <div
        className={`flex items-center h-16 border-b border-neutral-100 dark:border-neutral-900/60 relative group shrink-0 ${
          collapsed ? 'px-0 justify-center' : 'px-5'
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center w-auto' : 'justify-between w-[216px]'
          } shrink-0`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-3 cursor-pointer focus:outline-none"
            aria-label={collapsed ? 'Open sidebar' : 'CEC Drive logo'}
            title={collapsed ? 'Expand sidebar' : undefined}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
              <SynapseLogo showText={false} />
            </div>
            {!collapsed && (
              <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate whitespace-nowrap">
                CEC Drive
              </span>
            )}
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0 cursor-pointer"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <X className="w-5 h-5 md:hidden" />
              <PanelLeftClose className="w-5 h-5 hidden md:block" />
            </button>
          )}
        </div>
      </div>

      {/* Nav list */}
      <nav
        className="flex-1 px-0 py-2 space-y-3 overflow-y-auto overflow-x-hidden focus:outline-none scrollbar-none"
        tabIndex={-1}
      >
        {/* Role-Based Dashboard */}
        <div className="px-0">
          <div className="space-y-0.5">
            <NavItem
              icon={dashboardConfig.icon}
              label={dashboardConfig.label}
              hasNotification={notifications.dashboard}
              active={activeNav === dashboardConfig.targetKey}
              collapsed={collapsed}
              onClick={() => onSelectNav(dashboardConfig.targetKey)}
            />
          </div>
        </div>

        <div className={`h-px bg-neutral-200/60 dark:bg-neutral-800/60 my-1 ${collapsed ? 'mx-2' : 'mx-5'}`} />

        {/* Core Navigation Items */}
        <div className="px-0">
          <div className="space-y-0.5">
            <NavItem
              icon={<Calendar className="w-4 h-4 text-indigo-500" />}
              label="Calendar"
              hasNotification={notifications.calendar}
              notificationColor="bg-rose-500"
              active={activeNav === 'calendar'}
              collapsed={collapsed}
              onClick={() => onSelectNav('calendar')}
            />

            <div>
              <CollapsibleHeader
                icon={<Pin className="w-4 h-4 text-amber-500 fill-amber-500/20" />}
                label="Pinned Folder"
                count={pinnedFolderIds.length}
                expanded={pinnedExpanded}
                collapsed={collapsed}
                onToggle={() => setPinnedExpanded(!pinnedExpanded)}
                onClickLabel={() => onSelectNav('pinned-folders')}
                active={activeNav === 'pinned-folders'}
              />

              {/* Sub-list of quick access pinned folders in sidebar */}
              {!collapsed && pinnedExpanded && pinnedFolderIds.length > 0 && (
                <div className="ml-7 my-1 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 pl-2">
                  {pinnedFolderIds.slice(0, 10).map((id) => {
                    const f = folders.find((item) => item.id === id);
                    if (!f) return null;
                    const isFolderActive = activeNav === 'documents' && currentFolderId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleSelectSidebarFolder(f.id)}
                        className={`w-full flex items-center justify-between gap-2 px-2 py-1 text-xs rounded-md truncate transition-colors text-left ${
                          isFolderActive
                            ? 'font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                        }`}
                        title={f.name}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <FolderIcon className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <NavItem
              icon={<Clock className="w-4 h-4 text-emerald-500" />}
              label="Recent Files"
              hasNotification={notifications.recent}
              notificationColor="bg-rose-500"
              active={activeNav === 'recent-files'}
              collapsed={collapsed}
              onClick={() => onSelectNav('recent-files')}
            />

            <NavItem
              icon={<Megaphone className="w-4 h-4 text-rose-500" />}
              label="Announcements"
              hasNotification={notifications.announcements}
              notificationColor="bg-rose-500"
              active={activeNav === 'announcements'}
              collapsed={collapsed}
              onClick={() => onSelectNav('announcements')}
            />

            {/* Admin-Only Recycle Bin (Trash System) */}
            {currentUser.role === 'admin' && (
              <NavItem
                icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                label="Recycle Bin"
                hasNotification={deletedCount > 0}
                notificationColor="bg-rose-500"
                active={activeNav === 'recycle-bin'}
                collapsed={collapsed}
                onClick={() => onSelectNav('recycle-bin')}
              />
            )}
          </div>
        </div>

        <div className={`h-px bg-neutral-200/60 dark:bg-neutral-800/60 my-1 ${collapsed ? 'mx-2' : 'mx-5'}`} />

        {/* Root Folder Dropdown Tree */}
        <div className="px-0">
          <CollapsibleHeader
            icon={
              foldersExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500 fill-blue-500/20" />
              ) : (
                <FolderIcon className="w-4 h-4 text-blue-500 fill-blue-500/20" />
              )
            }
            label="Root Folders"
            hasNotification={notifications.folders}
            expanded={foldersExpanded}
            collapsed={collapsed}
            onToggle={() => setFoldersExpanded(!foldersExpanded)}
            onClickLabel={() => handleSelectSidebarFolder(null)}
            active={activeNav === 'documents'}
          />

          {!collapsed && foldersExpanded && (
            <div className="mt-1 space-y-0.5">
              {rootFolders.map((folder) => (
                <SidebarFolderTreeNode
                  key={folder.id}
                  folder={folder}
                  allFolders={folders}
                  currentFolderId={currentFolderId}
                  onSelectFolder={handleSelectSidebarFolder}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer: Theme Toggle & User Account */}
      <div className="py-2 border-t border-neutral-100 dark:border-neutral-900/80 bg-neutral-50/50 dark:bg-black space-y-1 shrink-0">
        <div className="relative group px-2">
          <button
            type="button"
            onClick={onToggleTheme}
            title={collapsed ? (theme === 'dark' ? 'Full Black (OLED)' : 'Light Theme') : undefined}
            className={`w-full flex items-center py-2 rounded-xl text-sm font-medium transition-all hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer ${
              collapsed ? 'justify-center px-0' : 'px-3'
            }`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'full black'} mode`}
          >
            <div
              className={`flex items-center ${
                collapsed ? 'justify-center w-auto' : 'justify-between w-full'
              } shrink-0`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:text-amber-500 dark:group-hover:text-amber-400">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </span>
                {!collapsed && (
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate whitespace-nowrap">
                    {theme === 'dark' ? 'Full Black (OLED)' : 'Light Theme'}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Account Profile Card */}
        <div className="relative group px-2">
          <div
            title={collapsed ? currentUser.name : undefined}
            className={`w-full flex items-center py-2 rounded-xl text-sm font-medium transition-all text-neutral-600 dark:text-neutral-400 ${
              collapsed ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <div
              className={`flex items-center ${
                collapsed ? 'justify-center w-auto' : 'justify-between w-full'
              } shrink-0`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 rounded-full ${currentUser.bgColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                >
                  {currentUser.initial}
                </span>
                {!collapsed && (
                  <div className="min-w-0 flex-1 truncate text-left">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate whitespace-nowrap">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate whitespace-nowrap capitalize">
                      {currentUser.role === 'uploader'
                        ? 'Lecturer • Uploader'
                        : currentUser.role === 'admin'
                        ? 'System Administrator'
                        : `${currentUser.department || 'CSE'} • ${currentUser.section || 'Sec A'}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Helper function to check if a node is an ancestor of the currently active folder
const isAncestorOfFolder = (nodeId: string, targetId: string | null, allFolders: FolderItem[]): boolean => {
  if (!targetId) return false;
  let curr = allFolders.find((f) => f.id === targetId);
  while (curr) {
    const parentId = curr.parentId !== undefined ? curr.parentId : (curr as any).parent_id;
    if (parentId === nodeId) return true;
    curr = allFolders.find((f) => f.id === parentId);
  }
  return false;
};

/* Subcomponent: Recursive Folder Tree Node */
interface SidebarFolderTreeNodeProps {
  folder: FolderItem;
  allFolders: FolderItem[];
  currentFolderId: string | null;
  onSelectFolder: (id: string) => void;
  level?: number;
}

const SidebarFolderTreeNode: React.FC<SidebarFolderTreeNodeProps> = ({
  folder,
  allFolders,
  currentFolderId,
  onSelectFolder,
  level = 0,
}) => {
  const subfolders = allFolders.filter((f) => {
    const isDel = f.isDeleted || (f as any).is_deleted;
    if (isDel) return false;
    const pId = f.parentId !== undefined ? f.parentId : (f as any).parent_id;
    return pId === folder.id;
  });

  const isSelected = currentFolderId === folder.id;
  const isChildSelected = React.useMemo(() => {
    return isAncestorOfFolder(folder.id, currentFolderId, allFolders);
  }, [folder.id, currentFolderId, allFolders]);

  const [expanded, setExpanded] = useState(() => {
    if (isSelected || isChildSelected) return true;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`cec_drive_folder_expanded_${folder.id}`);
        if (saved !== null) return saved === 'true';
      } catch (e) {}
    }
    return false; // Default closed
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cec_drive_folder_expanded_${folder.id}`, String(expanded));
      } catch (e) {}
    }
  }, [expanded, folder.id]);

  // Automatically expand when this folder or subfolder becomes active
  React.useEffect(() => {
    if (isSelected || isChildSelected) {
      setExpanded(true);
    }
  }, [isSelected, isChildSelected]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
    onSelectFolder(folder.id);
  };

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={handleClick}
        style={{ paddingLeft: `${level * 10 + 16}px` }}
        className={`w-full flex items-center justify-between py-1.5 pr-2.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate min-w-0">
          {subfolders.length > 0 ? (
            expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            )
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <FolderIcon
            className={`w-3.5 h-3.5 shrink-0 ${
              isSelected ? 'text-blue-600 fill-blue-600/20' : 'text-neutral-400 dark:text-neutral-500'
            }`}
          />
          <span className="truncate whitespace-nowrap">{folder.name}</span>
        </div>
      </button>

      {expanded && subfolders.length > 0 && (
        <div className="space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 ml-4">
          {subfolders.map((child) => (
            <SidebarFolderTreeNode
              key={child.id}
              folder={child}
              allFolders={allFolders}
              currentFolderId={currentFolderId}
              onSelectFolder={onSelectFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* Subcomponent: Standard Nav Item with Notification Dot */
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  hasNotification?: boolean;
  notificationColor?: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  hasNotification,
  notificationColor = 'bg-blue-500',
  active,
  collapsed,
  onClick,
}) => {
  return (
    <div className="relative group px-2">
      <button
        type="button"
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`w-full flex items-center py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          collapsed ? 'justify-center px-0' : 'px-3'
        } ${
          active
            ? 'bg-neutral-100 dark:bg-neutral-900 text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center w-auto' : 'justify-between w-full'
          } shrink-0`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-6 h-6 flex items-center justify-center shrink-0 transition-colors relative ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-neutral-400 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
            >
              {icon}
            </span>
            {!collapsed && (
              <span className="truncate whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {label}
              </span>
            )}
          </div>

          {!collapsed && hasNotification && (
            <span className="relative flex h-2 w-2 shrink-0 ml-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${notificationColor} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${notificationColor}`} />
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

/* Subcomponent: Collapsible Category Header */
interface CollapsibleHeaderProps {
  icon: React.ReactNode;
  label: string;
  hasNotification?: boolean;
  count?: number;
  expanded: boolean;
  collapsed?: boolean;
  onToggle: () => void;
  onClickLabel: () => void;
  active?: boolean;
}

const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  icon,
  label,
  hasNotification,
  count,
  expanded,
  collapsed,
  onToggle,
  onClickLabel,
  active,
}) => {
  const handleClick = () => {
    onClickLabel();
    onToggle();
  };

  return (
    <div className="relative group px-2">
      <button
        type="button"
        onClick={handleClick}
        title={collapsed ? label : undefined}
        className={`w-full flex items-center py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left focus-visible:outline-none ${
          collapsed ? 'justify-center px-0' : 'px-3'
        } ${
          active
            ? 'bg-neutral-100/60 dark:bg-neutral-900/60 text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center w-auto' : 'justify-between w-full'
          } shrink-0`}
        >
          <div className="flex items-center gap-3 truncate min-w-0">
            <span
              className={`w-6 h-6 flex items-center justify-center shrink-0 transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-neutral-400 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
            >
              {icon}
            </span>
            {!collapsed && (
              <span className="truncate whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {label}
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {count !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono">
                  {count}
                </span>
              )}
              {hasNotification && count === undefined && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-transform" />
              )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
