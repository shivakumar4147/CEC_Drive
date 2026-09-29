import React from 'react';
import { Check } from 'lucide-react';
import { FolderIcon3D } from './FolderIcon3D';
import { FolderItem } from '../types';

interface FolderCardProps {
  folder: FolderItem;
  isSelected?: boolean;
  onToggleSelect?: (folderId: string) => void;
  onClick?: (folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isSelected = false,
  onToggleSelect,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick && onClick(folder.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(folder.id);
        }
      }}
      className={`relative group flex flex-col items-center justify-between p-6 rounded-2xl border transition-all duration-200 cursor-pointer text-center select-none ${
        isSelected
          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-400 dark:border-blue-600 shadow-sm'
          : 'bg-white dark:bg-[#0a0a0a] border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs'
      }`}
    >
      {/* Top Left Selection Radio/Circle */}
      <div className="w-full flex justify-start items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect && onToggleSelect(folder.id);
          }}
          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500 bg-transparent'
          }`}
          aria-label={`Select folder ${folder.name}`}
          aria-checked={isSelected}
          role="checkbox"
        >
          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </button>
      </div>

      {/* 3D Realistic Royal Blue Folder */}
      <div className="my-3 transition-transform duration-200 group-hover:scale-105">
        <FolderIcon3D className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md" />
      </div>

      {/* Folder Name & Info */}
      <div className="w-full mt-1">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
          {folder.name}
        </h3>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          <span className="font-mono tabular-nums">{folder.fileCount} Files</span>
          <span className="mx-1.5" aria-hidden="true">
            •
          </span>
          <span className="font-mono tabular-nums">{folder.totalSize}</span>
        </p>
      </div>
    </div>
  );
};
