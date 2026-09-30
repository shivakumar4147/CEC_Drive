import React, { useRef } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Presentation,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentGridProps {
  documents: DocumentItem[];
  selectedIds: string[];
  hasActiveSelection?: boolean;
  onToggleSelect: (id: string, multiSelect?: boolean) => void;
  onDocumentClick: (doc: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

const DocumentGridItem: React.FC<{
  doc: DocumentItem;
  isSelected: boolean;
  hasActiveSelection: boolean;
  onToggleSelect: (id: string, multiSelect?: boolean) => void;
  onDocumentClick: (doc: DocumentItem) => void;
}> = ({
  doc,
  isSelected,
  hasActiveSelection,
  onToggleSelect,
  onDocumentClick,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const getFileIcon = (type: DocumentItem['type'], name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';

    if (type === 'pdf' || ext === 'pdf') {
      return (
        <div className="w-12 h-10 sm:w-14 sm:h-12 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex flex-col items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs">
          <FileText className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          <span className="text-[9px] font-extrabold font-mono uppercase tracking-tighter mt-0.5">
            PDF
          </span>
        </div>
      );
    }
    if (type === 'sheet' || ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return (
        <div className="w-12 h-10 sm:w-14 sm:h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          <span className="text-[9px] font-extrabold font-mono uppercase tracking-tighter mt-0.5">
            XLS
          </span>
        </div>
      );
    }
    if (type === 'spec' || ext === 'ppt' || ext === 'pptx' || ext === 'presentation') {
      return (
        <div className="w-12 h-10 sm:w-14 sm:h-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
          <Presentation className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          <span className="text-[9px] font-extrabold font-mono uppercase tracking-tighter mt-0.5">
            PPT
          </span>
        </div>
      );
    }
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'svg') {
      return (
        <div className="w-12 h-10 sm:w-14 sm:h-12 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 flex flex-col items-center justify-center text-purple-600 dark:text-purple-400 shadow-2xs">
          <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          <span className="text-[9px] font-extrabold font-mono uppercase tracking-tighter mt-0.5">
            IMG
          </span>
        </div>
      );
    }
    if (type === 'doc' || ext === 'doc' || ext === 'docx') {
      return (
        <div className="w-12 h-10 sm:w-14 sm:h-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
          <FileText className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          <span className="text-[9px] font-extrabold font-mono uppercase tracking-tighter mt-0.5">
            DOC
          </span>
        </div>
      );
    }

    return (
      <div className="w-12 h-10 sm:w-14 sm:h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
        <FileCode className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
        <span className="text-[9px] font-extrabold font-mono uppercase tracking-tighter mt-0.5">
          FILE
        </span>
      </div>
    );
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
      onToggleSelect(doc.id, true);
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
        onToggleSelect(doc.id, true);
      } else {
        onDocumentClick(doc);
      }
    } else {
      // PC View: Click to select single, Ctrl + Click for multi-select
      const isMulti = e.ctrlKey || e.metaKey;
      onToggleSelect(doc.id, isMulti);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      onDocumentClick(doc);
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
          onDocumentClick(doc);
        } else if (e.key === ' ') {
          e.preventDefault();
          const isMulti = e.ctrlKey || e.metaKey;
          onToggleSelect(doc.id, isMulti);
        }
      }}
      className={`relative group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all duration-150 cursor-pointer text-center select-none ${
        isSelected
          ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/60 shadow-xs'
          : 'hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-800/60'
      }`}
    >
      {/* File Type Icon (Compact Explorer Style) */}
      <div className="my-1 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
        {getFileIcon(doc.type, doc.name)}
      </div>

      {/* File Name Below Icon */}
      <span className="w-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate px-1 mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {doc.name}
      </span>
      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
        {doc.size}
      </span>
    </div>
  );
};

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  selectedIds,
  hasActiveSelection = false,
  onToggleSelect,
  onDocumentClick,
}) => {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
      {documents.map((doc) => (
        <DocumentGridItem
          key={doc.id}
          doc={doc}
          isSelected={selectedIds.includes(doc.id)}
          hasActiveSelection={hasActiveSelection}
          onToggleSelect={onToggleSelect}
          onDocumentClick={onDocumentClick}
        />
      ))}
    </div>
  );
};
