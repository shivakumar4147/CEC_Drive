import React, { useRef, useState, useEffect } from 'react';
import { FolderIcon3D } from './FolderIcon3D';
import { FolderItem } from '../types';

interface FolderCardProps {
  folder: FolderItem;
  isSelected?: boolean;
  hasActiveSelection?: boolean;
  autoFocusEdit?: boolean;
  canModify?: boolean;
  onToggleSelect?: (folderId: string, multiSelect?: boolean) => void;
  onClick?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDropFiles?: (targetFolderId: string, files: File[]) => void;
  onDropItem?: (targetFolderId: string, itemType: 'document' | 'folder', itemId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isSelected = false,
  hasActiveSelection = false,
  autoFocusEdit = false,
  canModify = true,
  onToggleSelect,
  onClick,
  onRenameFolder,
  onDropFiles,
  onDropItem,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Inline Rename state
  const [isEditing, setIsEditing] = useState(autoFocusEdit && canModify);
  const [editName, setEditName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag over drop state
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setEditName(folder.name);
  }, [folder.name]);

  useEffect(() => {
    if (autoFocusEdit && canModify) {
      setIsEditing(true);
    }
  }, [autoFocusEdit, canModify]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveRename = () => {
    setIsEditing(false);
    const trimmed = editName.trim();
    if (onRenameFolder && canModify) {
      if (trimmed) {
        onRenameFolder(folder.id, trimmed);
      } else {
        onRenameFolder(folder.id, 'New folder');
      }
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    if (isSelected && !isEditing && canModify) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  // Drag & Drop handlers for folder card
  const handleDragStart = (e: React.DragEvent) => {
    if (!canModify) return;
    const payload = JSON.stringify({ itemType: 'folder', id: folder.id });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.setData('text/plain', `folder:${folder.id}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canModify) return;
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canModify) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canModify) return;
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onDropFiles) {
      const fileList = Array.from(e.dataTransfer.files);
      onDropFiles(folder.id, fileList);
      return;
    }

    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      let payload: any = null;
      if (jsonStr) {
        payload = JSON.parse(jsonStr);
      } else {
        const plainStr = e.dataTransfer.getData('text/plain');
        if (plainStr.startsWith('doc:')) {
          payload = { itemType: 'document', id: plainStr.replace('doc:', '') };
        } else if (plainStr.startsWith('folder:')) {
          payload = { itemType: 'folder', id: plainStr.replace('folder:', '') };
        }
      }

      if (payload && payload.id && onDropItem) {
        if (payload.itemType === 'folder' && payload.id === folder.id) return;
        onDropItem(folder.id, payload.itemType, payload.id);
      }
    } catch (err) {
      console.warn('Failed to parse drag drop payload:', err);
    }
  };

  // Mobile Long-Press Gesture Handlers (500ms touch hold)
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
          // ignore vibration restriction
        }
      }
      onToggleSelect && onToggleSelect(folder.id, true);
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
        onToggleSelect && onToggleSelect(folder.id, true);
      } else {
        onClick && onClick(folder.id);
      }
    } else {
      // PC View: Click to select single, Ctrl + Click for multi-select
      const isMulti = e.ctrlKey || e.metaKey;
      onToggleSelect && onToggleSelect(folder.id, isMulti);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      onClick && onClick(folder.id);
    }
  };

  return (
    <div
      draggable={canModify}
      onDragStart={handleDragStart}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEndOrCancel}
      onTouchMove={handleTouchEndOrCancel}
      onTouchCancel={handleTouchEndOrCancel}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onClick && onClick(folder.id);
        } else if (e.key === ' ') {
          e.preventDefault();
          const isMulti = e.ctrlKey || e.metaKey;
          onToggleSelect && onToggleSelect(folder.id, isMulti);
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group flex flex-col items-center justify-between min-h-[120px] max-h-[132px] p-2 sm:p-2.5 rounded-none border transition-colors duration-150 cursor-pointer text-center select-none ${
        isDragOver
          ? 'bg-blue-100/90 dark:bg-blue-900/80 border-2 border-blue-500 shadow-lg z-20'
          : isSelected
          ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 border-blue-500 shadow-xs'
          : 'bg-transparent border-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:border-neutral-200/80 dark:hover:border-neutral-800 text-neutral-800 dark:text-neutral-200'
      }`}
    >
      {/* Folder Icon (Windows File Explorer Style) */}
      <div className="my-0.5 flex items-center justify-center">
        <FolderIcon3D className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-xs" />
      </div>

      {/* Folder Name Below Icon (Inline Edit Input when active) */}
      <div className="w-full min-h-[28px] max-h-[36px] flex items-center justify-center my-0.5 px-0.5">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSaveRename();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(false);
                setEditName(folder.name);
              }
            }}
            onBlur={handleSaveRename}
            className="w-full h-7 text-xs font-semibold text-center bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-blue-500 rounded-none px-1 outline-none z-10 box-border leading-none"
          />
        ) : (
          <span
            onClick={handleNameClick}
            className="w-full line-clamp-2 break-all sm:break-words text-xs font-semibold text-neutral-800 dark:text-neutral-200 text-center leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            title={isSelected ? 'Click text to rename' : folder.name}
          >
            {folder.name}
          </span>
        )}
      </div>

      {folder.fileCount !== undefined ? (
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
          {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
        </span>
      ) : (
        <span className="h-3" />
      )}
    </div>
  );
};
