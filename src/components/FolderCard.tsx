import React, { useRef } from 'react';
import { FolderIcon3D } from './FolderIcon3D';
import { FolderItem } from '../types';

interface FolderCardProps {
  folder: FolderItem;
  isSelected?: boolean;
  hasActiveSelection?: boolean;
  onToggleSelect?: (folderId: string, multiSelect?: boolean) => void;
  onClick?: (folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isSelected = false,
  hasActiveSelection = false,
  onToggleSelect,
  onClick,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

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
      className={`relative group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all duration-150 cursor-pointer text-center select-none ${
        isSelected
          ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/60 shadow-xs'
          : 'hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
      }`}
    >
      {/* Folder Icon (Windows File Explorer Style) */}
      <div className="my-1 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
        <FolderIcon3D className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-xs" />
      </div>

      {/* Folder Name Below Icon */}
      <span className="w-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate px-1 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {folder.name}
      </span>
      {folder.fileCount !== undefined && (
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
          {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
        </span>
      )}
    </div>
  );
};
