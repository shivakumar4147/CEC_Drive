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
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-800 border border-neutral-700/60 shadow-lg scale-90 sm:scale-100 max-w-[92vw] overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-1.5 pr-2.5 border-r border-neutral-700 text-xs font-medium shrink-0">
        <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px]">
          {selectedCount}
        </span>
        <span className="text-[11px]">selected</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onDownloadSelected}
          className="flex items-center justify-center gap-1.5 px-3 h-[32px] shrink-0 rounded-lg text-xs font-medium border border-transparent hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Download</span>
        </button>

        <button
          onClick={onMarkImportant}
          className="flex items-center justify-center gap-1.5 px-3 h-[32px] shrink-0 rounded-lg text-xs font-medium border border-transparent hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Important</span>
        </button>

        {canDelete && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center justify-center gap-1.5 px-3 h-[32px] shrink-0 rounded-lg text-xs font-medium text-rose-400 border border-transparent hover:bg-rose-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Delete</span>
          </button>
        )}
      </div>

      <button
        onClick={onClearSelection}
        className="w-8 h-8 flex items-center justify-center shrink-0 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors ml-1 border border-transparent"
        aria-label="Clear selection"
        title="Clear selection"
      >
        <X className="w-4 h-4 shrink-0" />
      </button>
    </div>
  );
};
