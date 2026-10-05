import React from 'react';
import { Pin } from 'lucide-react';
import { FolderItem, ViewMode } from '../types';
import { SortField, SortOrder } from './DocumentTable';
import { FolderCard } from './FolderCard';
import { FolderList } from './FolderList';

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
  onToggleSelectFolder: (folderId: string, multiSelect?: boolean) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDropFiles?: (targetFolderId: string, files: File[]) => void;
  onDropItem?: (targetFolderId: string, itemType: 'document' | 'folder', itemId: string) => void;
  canModify?: boolean;
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
  onRenameFolder,
  onDropFiles,
  onDropItem,
  canModify = true,
}) => {
  // Pinned folder objects (filtering out soft-deleted / moved-to-bin folders)
  let pinnedFolders = folders.filter((f) => pinnedFolderIds.includes(f.id) && !f.isDeleted);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    pinnedFolders = pinnedFolders.filter((f) => (f.name || '').toLowerCase().includes(q));
  }

  pinnedFolders.sort((a, b) => {
    let comparison = (a.name || '').localeCompare(b.name || '');
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const hasActiveSelection = selectedFolderIds.length > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Quick Access Pinned Folders */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
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
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0">
            {pinnedFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                isSelected={selectedFolderIds.includes(folder.id)}
                hasActiveSelection={hasActiveSelection}
                canModify={canModify}
                onToggleSelect={onToggleSelectFolder}
                onClick={onNavigateFolder}
                onRenameFolder={onRenameFolder}
                onDropFiles={onDropFiles}
                onDropItem={onDropItem}
              />
            ))}
          </div>
        ) : (
          <FolderList
            folders={pinnedFolders}
            selectedIds={selectedFolderIds}
            hasActiveSelection={hasActiveSelection}
            onToggleSelect={onToggleSelectFolder}
            onFolderClick={onNavigateFolder}
            onRenameFolder={(id, name) => onRenameFolder?.(id, name || '')}
            onDropItem={onDropItem}
            canModify={canModify}
          />
        )}
      </section>
    </div>
  );
};
