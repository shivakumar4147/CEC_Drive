import React from 'react';
import { Pin, Folder as FolderIcon, ArrowRight, PinOff } from 'lucide-react';
import { FolderItem, ViewMode } from '../types';
import { SortField, SortOrder } from './DocumentTable';

interface PinnedFoldersViewProps {
  pinnedFolderIds: string[];
  folders: FolderItem[];
  selectedFolderIds: string[];
  viewMode?: ViewMode;
  sortField?: SortField;
  sortOrder?: SortOrder;
  searchQuery?: string;
  onNavigateFolder: (folderId: string) => void;
  onTogglePinFolder: (folderId: string) => void;
  onToggleSelectFolder: (folderId: string, multiSelect: boolean) => void;
}

export const PinnedFoldersView: React.FC<PinnedFoldersViewProps> = ({
  pinnedFolderIds,
  folders,
  selectedFolderIds,
  viewMode = 'grid',
  sortOrder = 'asc',
  searchQuery = '',
  onNavigateFolder,
  onTogglePinFolder,
  onToggleSelectFolder,
}) => {
  // Pinned folder objects
  let pinnedFolders = folders.filter((f) => pinnedFolderIds.includes(f.id));

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    pinnedFolders = pinnedFolders.filter((f) => (f.name || '').toLowerCase().includes(q));
  }

  pinnedFolders.sort((a, b) => {
    let comparison = (a.name || '').localeCompare(b.name || '');
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Quick Access Pinned Folders */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Pinned Folders ({pinnedFolders.length})</span>
          </h2>
        </div>

        {pinnedFolders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/30 border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 w-fit mx-auto mb-2">
              <Pin className="w-6 h-6" />
            </div>
            <p className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">No Pinned Folders</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs mt-1">
              Click the "Pin Folder" button in any folder to pin it here for quick access.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {pinnedFolders.map((folder) => {
              const isSelected = selectedFolderIds.includes(folder.id);
              return (
                <div
                  key={folder.id}
                  onClick={(e) => {
                    const isMulti = e.ctrlKey || e.metaKey;
                    onToggleSelectFolder(folder.id, isMulti);
                  }}
                  onDoubleClick={() => onNavigateFolder(folder.id)}
                  className={`p-4 rounded-xl border transition-all group flex flex-col justify-between cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/80 shadow-xs'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                      <FolderIcon className="w-6 h-6 fill-amber-600/20" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinFolder(folder.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Unpin folder"
                    >
                      <PinOff className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {folder.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      <span>{folder.fileCount} files</span>
                      <span>{folder.totalSize}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xs divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {pinnedFolders.map((folder) => {
              const isSelected = selectedFolderIds.includes(folder.id);
              return (
                <div
                  key={folder.id}
                  onClick={(e) => {
                    const isMulti = e.ctrlKey || e.metaKey;
                    onToggleSelectFolder(folder.id, isMulti);
                  }}
                  onDoubleClick={() => onNavigateFolder(folder.id)}
                  className={`p-3.5 sm:px-4 flex items-center justify-between gap-3 transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/30'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 shrink-0">
                      <FolderIcon className="w-4 h-4 fill-amber-600/20" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {folder.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {folder.fileCount} files • {folder.totalSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinFolder(folder.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Unpin folder"
                    >
                      <PinOff className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight
                      onClick={() => onNavigateFolder(folder.id)}
                      className="w-4 h-4 text-neutral-400 hover:text-amber-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
