import React, { useRef, useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Presentation,
  Image as ImageIcon,
  UploadCloud,
} from 'lucide-react';
import { DocumentItem, UploadingDocItem } from '../types';
import { formatFileSize } from '../lib/formatUtils';

interface DocumentGridProps {
  documents: DocumentItem[];
  uploadingDocs?: UploadingDocItem[];
  selectedIds: string[];
  hasActiveSelection?: boolean;
  canModify?: boolean;
  onToggleSelect: (id: string, multiSelect?: boolean) => void;
  onDocumentClick: (doc: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
  onRenameDoc?: (id: string, newName: string) => void;
}

const getFileIcon = (type: string, name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (type === 'pdf' || ext === 'pdf') {
    return (
      <div className="relative flex flex-col items-center justify-center text-rose-500 dark:text-rose-400 py-1">
        <FileText className="w-10 h-10 stroke-[1.5]" />
        <span className="text-[9px] font-bold font-mono uppercase tracking-tight -mt-2 bg-neutral-100 dark:bg-neutral-800 text-rose-600 dark:text-rose-400 border border-neutral-200 dark:border-neutral-700 px-1 py-0.25">
          PDF
        </span>
      </div>
    );
  }
  if (type === 'sheet' || ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
    return (
      <div className="relative flex flex-col items-center justify-center text-emerald-500 dark:text-emerald-400 py-1">
        <FileSpreadsheet className="w-10 h-10 stroke-[1.5]" />
        <span className="text-[9px] font-bold font-mono uppercase tracking-tight -mt-2 bg-neutral-100 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 border border-neutral-200 dark:border-neutral-700 px-1 py-0.25">
          XLS
        </span>
      </div>
    );
  }
  if (type === 'spec' || ext === 'ppt' || ext === 'pptx' || ext === 'presentation') {
    return (
      <div className="relative flex flex-col items-center justify-center text-amber-500 dark:text-amber-400 py-1">
        <Presentation className="w-10 h-10 stroke-[1.5]" />
        <span className="text-[9px] font-bold font-mono uppercase tracking-tight -mt-2 bg-neutral-100 dark:bg-neutral-800 text-amber-600 dark:text-amber-400 border border-neutral-200 dark:border-neutral-700 px-1 py-0.25">
          PPT
        </span>
      </div>
    );
  }
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'svg') {
    return (
      <div className="relative flex flex-col items-center justify-center text-purple-500 dark:text-purple-400 py-1">
        <ImageIcon className="w-10 h-10 stroke-[1.5]" />
        <span className="text-[9px] font-bold font-mono uppercase tracking-tight -mt-2 bg-neutral-100 dark:bg-neutral-800 text-purple-600 dark:text-purple-400 border border-neutral-200 dark:border-neutral-700 px-1 py-0.25">
          IMG
        </span>
      </div>
    );
  }
  if (type === 'doc' || ext === 'doc' || ext === 'docx') {
    return (
      <div className="relative flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 py-1">
        <FileText className="w-10 h-10 stroke-[1.5]" />
        <span className="text-[9px] font-bold font-mono uppercase tracking-tight -mt-2 bg-neutral-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 border border-neutral-200 dark:border-neutral-700 px-1 py-0.25">
          DOC
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 py-1">
      <FileCode className="w-10 h-10 stroke-[1.5]" />
      <span className="text-[9px] font-bold font-mono uppercase tracking-tight -mt-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1 py-0.25">
        FILE
      </span>
    </div>
  );
};

const UploadingDocGridCard: React.FC<{ item: UploadingDocItem }> = ({ item }) => {
  return (
    <div className="relative group flex flex-col items-center justify-between h-[112px] p-2.5 sm:p-3 rounded-none border border-blue-500 bg-white dark:bg-neutral-900 text-center select-none overflow-hidden transition-colors duration-150 shadow-xs">
      {/* Horizontal Background Overlay Progress Fill */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-blue-500/25 dark:bg-blue-500/35 transition-all duration-150 ease-linear pointer-events-none"
        style={{ width: `${Math.max(2, Math.min(100, item.progress))}%` }}
      />

      {/* File Type Icon */}
      <div className="relative z-10 my-0.5 flex items-center justify-center">
        {getFileIcon(item.type, item.name)}
      </div>

      {/* File Name */}
      <div className="relative z-10 w-full h-6 flex items-center justify-center my-0.5">
        <span
          className="w-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate px-1"
          title={item.name}
        >
          {item.name}
        </span>
      </div>

      {/* File Size */}
      <span className="relative z-10 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
        {formatFileSize(item.size)}
      </span>
    </div>
  );
};

const DocumentGridItem: React.FC<{
  doc: DocumentItem;
  isSelected: boolean;
  hasActiveSelection: boolean;
  canModify?: boolean;
  onToggleSelect: (id: string, multiSelect?: boolean) => void;
  onDocumentClick: (doc: DocumentItem) => void;
  onRenameDoc?: (id: string, newName: string) => void;
}> = ({
  doc,
  isSelected,
  hasActiveSelection,
  canModify = true,
  onToggleSelect,
  onDocumentClick,
  onRenameDoc,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Inline Rename State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(doc.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditName(doc.name);
  }, [doc.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const fullName = editName;
      const lastDotIndex = fullName.lastIndexOf('.');
      if (lastDotIndex > 0) {
        inputRef.current.setSelectionRange(0, lastDotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSaveRename = () => {
    setIsEditing(false);
    const trimmed = editName.trim();
    if (trimmed && trimmed !== doc.name && onRenameDoc && canModify) {
      onRenameDoc(doc.id, trimmed);
    } else {
      setEditName(doc.name);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    if (isSelected && !isEditing && canModify) {
      e.stopPropagation();
      setIsEditing(true);
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
      // PC View: 1-click selects file & enables options, Ctrl/Cmd + Click toggles multi-select
      const isMulti = e.ctrlKey || e.metaKey;
      onToggleSelect(doc.id, isMulti);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      e.stopPropagation();
      onDocumentClick(doc);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!canModify) return;
    const payload = JSON.stringify({ itemType: 'document', id: doc.id });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.setData('text/plain', `doc:${doc.id}`);
    e.dataTransfer.effectAllowed = 'move';
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
          onDocumentClick(doc);
        } else if (e.key === ' ') {
          e.preventDefault();
          const isMulti = e.ctrlKey || e.metaKey;
          onToggleSelect(doc.id, isMulti);
        }
      }}
      className={`relative group flex flex-col items-center justify-between min-h-[120px] max-h-[132px] p-2 sm:p-2.5 rounded-none border transition-colors duration-150 cursor-pointer text-center select-none ${
        isSelected
          ? 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 border-blue-500 shadow-xs'
          : 'bg-transparent border-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:border-neutral-200/80 dark:hover:border-neutral-800 text-neutral-800 dark:text-neutral-200'
      }`}
    >
      {/* File Type Icon (Compact Explorer Style) */}
      <div className="my-0.5 flex items-center justify-center">
        {getFileIcon(doc.type, doc.name)}
      </div>

      {/* File Name Below Icon (Inline edit input when active) */}
      <div className="w-full min-h-[28px] max-h-[36px] flex items-center justify-center my-0.5 px-0.5">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditName(doc.name);
              }
            }}
            onBlur={handleSaveRename}
            className="w-full h-7 text-xs font-semibold text-center bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-blue-500 rounded-none px-1 outline-none z-10 box-border leading-none"
          />
        ) : (
          <span
            onClick={handleNameClick}
            className="w-full line-clamp-2 break-all sm:break-words text-xs font-semibold text-neutral-800 dark:text-neutral-200 text-center leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            title={isSelected && canModify ? 'Click text to rename' : doc.name}
          >
            {doc.name}
          </span>
        )}
      </div>

      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
        {formatFileSize(doc.size)}
      </span>
    </div>
  );
};

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  uploadingDocs = [],
  selectedIds,
  hasActiveSelection = false,
  canModify = true,
  onToggleSelect,
  onDocumentClick,
  onRenameDoc,
}) => {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0">
      {uploadingDocs.map((item) => (
        <UploadingDocGridCard key={item.id} item={item} />
      ))}
      {documents.map((doc) => (
        <DocumentGridItem
          key={doc.id}
          doc={doc}
          isSelected={selectedIds.includes(doc.id)}
          hasActiveSelection={hasActiveSelection}
          canModify={canModify}
          onToggleSelect={onToggleSelect}
          onDocumentClick={onDocumentClick}
          onRenameDoc={onRenameDoc}
        />
      ))}
    </div>
  );
};
