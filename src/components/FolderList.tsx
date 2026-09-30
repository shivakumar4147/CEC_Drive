import React, { useRef } from 'react';
import { FolderIcon3D } from './FolderIcon3D';
import { FolderItem } from '../types';
import { Download, Edit2, Trash2 } from 'lucide-react';

interface FolderListProps {
  folders: FolderItem[];
  selectedIds: string[];
  hasActiveSelection?: boolean;
  onToggleSelect: (id: string, multiSelect?: boolean) => void;
  onFolderClick: (folderId: string) => void;
  onDownloadFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  canModify?: boolean;
}

const FolderListItem: React.FC<{
  folder: FolderItem;
  isSelected: boolean;
  hasActiveSelection: boolean;
  onToggleSelect: (id: string, multiSelect?: boolean) => void;
  onFolderClick: (folderId: string) => void;
  onDownloadFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  canModify?: boolean;
}> = ({
  folder,
  isSelected,
  hasActiveSelection,
  onToggleSelect,
  onFolderClick,
  onDownloadFolder,
  onRenameFolder,
  onDeleteFolder,
  canModify = true,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const handleTouchStart = () => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch (e) {
          // ignore vibration
        }
      }
      onToggleSelect(folder.id, true);
    }, 500);
  };

  const handleTouchEndOrCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      if (isLongPressTriggeredRef.current) {
        isLongPressTriggeredRef.current = false;
        return;
      }
      if (hasActiveSelection || isSelected) {
        onToggleSelect(folder.id, true);
      } else {
        onFolderClick(folder.id);
      }
    } else {
      const isMulti = e.ctrlKey || e.metaKey;
      onToggleSelect(folder.id, isMulti);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      onFolderClick(folder.id);
    }
  };

  return (
    <tr
      role="row"
      aria-selected={isSelected}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEndOrCancel}
      onTouchMove={handleTouchEndOrCancel}
      onTouchCancel={handleTouchEndOrCancel}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onFolderClick(folder.id);
        } else if (e.key === ' ') {
          e.preventDefault();
          const isMulti = e.ctrlKey || e.metaKey;
          onToggleSelect(folder.id, isMulti);
        }
      }}
      className={`group transition-colors duration-150 cursor-pointer select-none ${
        isSelected
          ? 'bg-blue-100/70 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
      }`}
    >
      {/* Folder Name & Icon */}
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <FolderIcon3D className="w-8 h-6.5 shrink-0 drop-shadow-2xs" />
          <span className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {folder.name}
          </span>
        </div>
      </td>

      {/* Items Count */}
      <td className="py-3 px-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
        {folder.fileCount !== undefined
          ? `${folder.fileCount} ${folder.fileCount === 1 ? 'file' : 'files'}`
          : '0 files'}
      </td>

      {/* Total Size */}
      <td className="py-3 px-3 text-xs text-neutral-400 dark:text-neutral-500 font-mono hidden sm:table-cell">
        {folder.totalSize || '0 KB'}
      </td>

      {/* Hover Quick Actions */}
      <td
        className="py-3 pr-4 pl-2 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDownloadFolder && (
            <button
              onClick={() => onDownloadFolder(folder.id)}
              className="p-1.5 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Download Folder ZIP"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {canModify && onRenameFolder && (
            <button
              onClick={() => onRenameFolder(folder.id)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Rename folder"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canModify && onDeleteFolder && (
            <button
              onClick={() => onDeleteFolder(folder.id)}
              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Delete folder"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  selectedIds,
  hasActiveSelection = false,
  onToggleSelect,
  onFolderClick,
  onDownloadFolder,
  onRenameFolder,
  onDeleteFolder,
  canModify = true,
}) => {
  if (folders.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-black">
      <table className="w-full text-left border-collapse" role="table">
        <thead>
          <tr className="border-b border-neutral-200/80 dark:border-neutral-900 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <th className="py-3 pl-4 pr-3" scope="col">
              Folder Name
            </th>
            <th className="py-3 px-3" scope="col">
              Files
            </th>
            <th className="py-3 px-3 hidden sm:table-cell" scope="col">
              Size
            </th>
            <th className="py-3 pr-4 pl-2 text-right w-16" scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100/80 dark:divide-neutral-900/60">
          {folders.map((folder) => (
            <FolderListItem
              key={folder.id}
              folder={folder}
              isSelected={selectedIds.includes(folder.id)}
              hasActiveSelection={hasActiveSelection}
              onToggleSelect={onToggleSelect}
              onFolderClick={onFolderClick}
              onDownloadFolder={onDownloadFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              canModify={canModify}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
