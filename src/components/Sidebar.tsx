import React, { useState } from 'react';
import {
  LayoutGrid,
  Calendar,
  Inbox,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderOpen,
  PanelLeftClose,
  Sun,
  Moon,
  UserCircle,
} from 'lucide-react';
import { SynapseLogo } from './SynapseLogo';
import { ActiveNavKey, ThemeMode, FolderItem } from '../types';

interface SidebarProps {
  activeNav: ActiveNavKey;
  onSelectNav: (key: ActiveNavKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  folders?: FolderItem[];
  currentFolderId?: string | null;
  onNavigateFolder?: (folderId: string | null) => void;
  counts?: {
    dashboard?: number;
    calendar?: number;
    inbox?: number;
    myTasks?: number;
    folders?: number;
    important?: number;
    normal?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
  folders = [],
  currentFolderId = null,
  onNavigateFolder,
  counts = {
    dashboard: 48,
    calendar: 12,
    inbox: 127,
    myTasks: 21,
    folders: 12,
    important: 12,
    normal: 47,
  },
}) => {
  const [foldersExpanded, setFoldersExpanded] = useState(true);

  // Top-level folders (parentId === null)
  const rootFolders = folders.filter((f) => f.parentId === null);

  const handleSelectSidebarFolder = (folderId: string | null) => {
    onSelectNav('documents');
    if (onNavigateFolder) {
      onNavigateFolder(folderId);
    }
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-white dark:bg-black border-r border-neutral-200/90 dark:border-neutral-900 transition-all duration-300 ease-in-out select-none shrink-0 overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Sidebar navigation"
    >
      {/* Top Header: Logo + Collapse Button */}
      <div className="flex items-center h-16 px-5 border-b border-neutral-100 dark:border-neutral-900/60 relative group shrink-0">
        <div className="flex items-center justify-between w-[216px] shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-3 cursor-pointer focus:outline-none"
            aria-label={collapsed ? 'Open sidebar' : 'CEC Drive logo'}
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
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Content */}
      <nav
        className="flex-1 px-0 py-2 space-y-3 overflow-y-auto overflow-x-hidden focus:outline-none scrollbar-none"
        tabIndex={-1}
      >
        {/* Section 1: Main Academic & Student Hub */}
        <div className="px-0">
          <div className="space-y-0.5">
            <NavItem
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Dashboard"
              count={counts.dashboard}
              active={activeNav === 'dashboard'}
              collapsed={collapsed}
              onClick={() => onSelectNav('dashboard')}
            />

            <NavItem
              icon={<Calendar className="w-4 h-4" />}
              label="Calendar"
              count={counts.calendar}
              active={activeNav === 'calendar'}
              collapsed={collapsed}
              onClick={() => onSelectNav('calendar')}
            />

            <NavItem
              icon={<Inbox className="w-4 h-4" />}
              label="Inbox"
              count={counts.inbox}
              active={activeNav === 'inbox'}
              collapsed={collapsed}
              onClick={() => onSelectNav('inbox')}
            />

            <NavItem
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="My Tasks"
              count={counts.myTasks}
              active={activeNav === 'my-tasks'}
              collapsed={collapsed}
              onClick={() => onSelectNav('my-tasks')}
            />
          </div>
        </div>

        {/* Section 2 Divider */}
        <div className="h-px bg-neutral-200/60 dark:bg-neutral-800/60 my-1 mx-5" />

        {/* Section 2: Folders Tree */}
        <div className="px-0">
          <div className="space-y-0.5">
            <CollapsibleHeader
              icon={
                foldersExpanded ? (
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                ) : (
                  <FolderIcon className="w-4 h-4 text-blue-500" />
                )
              }
              label="Folders (Root)"
              count={folders.length}
              expanded={foldersExpanded}
              collapsed={collapsed}
              onToggle={() => setFoldersExpanded(!foldersExpanded)}
              onClickLabel={() => {
                setFoldersExpanded(true);
                handleSelectSidebarFolder(null);
              }}
              active={activeNav === 'documents' && currentFolderId === null}
            />

            {/* Recursive Interactive Folder Directory Tree */}
            {foldersExpanded && !collapsed && (
              <div className="my-1 space-y-0.5 pr-2">
                {rootFolders.map((folder) => (
                  <SidebarFolderTreeNode
                    key={folder.id}
                    folder={folder}
                    allFolders={folders}
                    currentFolderId={currentFolderId}
                    onSelectFolder={(id) => handleSelectSidebarFolder(id)}
                    level={0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3 Divider */}
        <div className="h-px bg-neutral-200/60 dark:bg-neutral-800/60 my-1 mx-5" />

        {/* Section 3: Tags */}
        <div className="px-0">
          <div className="space-y-0.5">
            <NavItem
              icon={<span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />}
              label="Important"
              count={counts.important}
              active={activeNav === 'tag-important'}
              collapsed={collapsed}
              onClick={() => onSelectNav('tag-important')}
            />

            <NavItem
              icon={<span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />}
              label="Normal"
              count={counts.normal}
              active={activeNav === 'tag-normal'}
              collapsed={collapsed}
              onClick={() => onSelectNav('tag-normal')}
            />
          </div>
        </div>
      </nav>

      {/* Bottom Footer: Dark Mode Toggle & User Account Profile */}
      <div className="py-2 border-t border-neutral-100 dark:border-neutral-900/80 bg-neutral-50/50 dark:bg-black space-y-0.5 shrink-0">
        {/* Dark/Light Mode Toggle */}
        <div className="relative group">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center px-5 py-2 rounded-xl text-sm font-medium transition-all hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'full black'} mode`}
          >
            <div className="flex items-center justify-between w-[216px] shrink-0">
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

        {/* User Identity / Account Profile */}
        <div className="relative group">
          <button
            type="button"
            className="w-full flex items-center px-5 py-2 rounded-xl text-sm font-medium transition-all hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Account Profile"
          >
            <div className="flex items-center justify-between w-[216px] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:scale-110">
                  <UserCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </span>
                {!collapsed && (
                  <div className="min-w-0 flex-1 truncate text-left">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate whitespace-nowrap">
                      Shiva Student
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate whitespace-nowrap">
                      CSE • 5th Sem
                    </p>
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
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
  const subfolders = allFolders.filter((f) => f.parentId === folder.id);
  const [expanded, setExpanded] = useState(level === 0); // Expand top level by default
  const isSelected = currentFolderId === folder.id;

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
        className={`w-full flex items-center justify-between py-1.5 pr-2.5 text-xs font-medium rounded-xl transition-all ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800 shadow-xs'
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
        {folder.fileCount > 0 && (
          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tabular-nums shrink-0 ml-1">
            {folder.fileCount}
          </span>
        )}
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

/* Subcomponent: Standard Nav Item */
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  count,
  active,
  collapsed,
  onClick,
}) => {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center px-5 py-2 rounded-xl text-sm font-medium transition-all ${
          active
            ? 'bg-neutral-100 dark:bg-neutral-900 text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <div className="flex items-center justify-between w-[216px] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${
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

          {!collapsed && typeof count === 'number' && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono tabular-nums shrink-0 ml-2 group-hover:text-blue-500 transition-colors">
              {count}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

/* Subcomponent: Collapsible Category Header with Chevron */
interface CollapsibleHeaderProps {
  icon: React.ReactNode;
  label: string;
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
  count,
  expanded,
  collapsed,
  onToggle,
  onClickLabel,
  active,
}) => {
  return (
    <div className="relative group">
      <div
        className={`w-full flex items-center px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
          active
            ? 'bg-neutral-100/60 dark:bg-neutral-900/60 text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <div className="flex items-center justify-between w-[216px] shrink-0">
          <button
            type="button"
            onClick={onClickLabel}
            className="flex items-center gap-3 truncate text-left focus-visible:outline-none min-w-0"
          >
            <span
              className={`w-6 h-6 flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${
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
          </button>

          {!collapsed && (
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {typeof count === 'number' && (
                <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono tabular-nums group-hover:text-blue-500 transition-colors">
                  {count}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="p-0.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              >
                {expanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
