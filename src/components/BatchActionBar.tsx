import React from 'react';
import { Download, Share2, Star, Trash2, X } from 'lucide-react';

interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDownloadSelected: () => void;
  onMarkImportant: () => void;
  onDeleteSelected: () => void;
  canDelete?: boolean;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onDownloadSelected,
  onMarkImportant,
  onDeleteSelected,
  canDelete = true,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800 border border-neutral-700/60 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 pr-3 border-r border-neutral-700 text-xs font-medium">
        <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">
          {selectedCount}
        </span>
        <span>selected</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onDownloadSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>

        <button
          onClick={onMarkImportant}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Important</span>
        </button>

        {canDelete && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>

      <button
        onClick={onClearSelection}
        className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors ml-1"
        aria-label="Clear selection"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
