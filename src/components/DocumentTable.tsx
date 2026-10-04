import React from 'react';
import {
  Check,
  Minus,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import { DocumentItem } from '../types';

export type SortField = 'name' | 'dateAdded' | 'author';
export type SortOrder = 'asc' | 'desc';

interface DocumentTableProps {
  documents: DocumentItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDocumentClick: (doc: DocumentItem) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  onDownload?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

interface DocumentTableRowProps {
  doc: DocumentItem;
  isSelected: boolean;
  hasActiveSelection: boolean;
  onToggleSelect: (id: string, multiSelect?: boolean) => void;
  onDocumentClick: (doc: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

const DocumentTableRow: React.FC<DocumentTableRowProps> = ({
  doc,
  isSelected,
  hasActiveSelection,
  onToggleSelect,
  onDocumentClick,
  onDownload,
  onDelete,
}) => {
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = React.useRef(false);

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
      // PC View: 1-click selects file & enables options bar, Ctrl/Cmd + Click for multi-select
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
          onDocumentClick(doc);
        } else if (e.key === ' ') {
          e.preventDefault();
          const isMulti = e.ctrlKey || e.metaKey;
          onToggleSelect(doc.id, isMulti);
        }
      }}
      className={`group transition-colors duration-150 cursor-pointer select-none ${
        isSelected
          ? 'bg-blue-100/70 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
          : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20'
      }`}
    >
      {/* Row Checkbox */}
      <td
        className="py-3.5 pl-4 pr-3"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(doc.id);
        }}
      >
        <button
          type="button"
          className={`w-4 h-4 rounded-none flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isSelected
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
              : 'border border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 bg-transparent'
          }`}
          aria-label={`Select ${doc.name}`}
          aria-checked={isSelected}
          role="checkbox"
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </td>

      {/* File Name */}
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-2.5 max-w-sm sm:max-w-md">
          <span className="text-sm font-medium text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {doc.name}
          </span>
        </div>
      </td>

      {/* Date Added */}
      <td className="py-3.5 px-3 hidden sm:table-cell text-xs text-neutral-500 dark:text-neutral-400 font-normal font-mono">
        {doc.dateAdded}
      </td>

      {/* Added By: Colored Avatar + Name */}
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-5 h-5 rounded-none flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${
              doc.author?.bgColor || 'bg-blue-600'
            }`}
            aria-hidden="true"
          >
            {doc.author?.initial || 'U'}
          </div>
          <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium truncate">
            {doc.author?.name || 'Uploader'}
          </span>
        </div>
      </td>

      {/* Hover Quick Actions */}
      <td
        className="py-3.5 pr-4 pl-2 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDocumentClick(doc)}
            className="w-7 h-7 flex items-center justify-center shrink-0 border border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-none hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
            title="Preview"
            aria-label="Preview document"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
          </button>
          {onDownload && (
            <button
              onClick={() => onDownload(doc)}
              className="w-7 h-7 flex items-center justify-center shrink-0 border border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-none hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Download"
              aria-label="Download document"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(doc.id)}
              className="w-7 h-7 flex items-center justify-center shrink-0 border border-transparent text-neutral-400 hover:text-rose-600 rounded-none hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Delete"
              aria-label="Delete document"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDocumentClick,
  sortField,
  sortOrder,
  onSortChange,
  onDownload,
  onDelete,
}) => {
  const allSelected = documents.length > 0 && selectedIds.length === documents.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const hasActiveSelection = selectedIds.length > 0;

  return (
    <div className="w-full overflow-x-auto" role="region" aria-label="Documents List">
      <table className="w-full text-left border-collapse" role="table">
        <thead>
          <tr className="border-b border-neutral-200/80 dark:border-neutral-900 text-xs font-medium text-neutral-400 dark:text-neutral-500">
            {/* Master Checkbox */}
            <th className="py-3.5 pl-4 pr-3 w-10" scope="col">
              <button
                type="button"
                onClick={onToggleSelectAll}
                className={`w-4 h-4 rounded-none flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  allSelected || someSelected
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 bg-transparent'
                }`}
                aria-label={allSelected ? 'Deselect all files' : 'Select all files'}
              >
                {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
                {someSelected && <Minus className="w-3 h-3 stroke-[3]" />}
              </button>
            </th>

            {/* File Name Header */}
            <th className="py-3.5 px-3 text-left font-normal" scope="col">
              <button
                type="button"
                onClick={() => onSortChange('name')}
                className="group inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                <span>File name</span>
                <span className="text-neutral-400 dark:text-neutral-500">
                  {sortField === 'name' ? (
                    sortOrder === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  )}
                </span>
              </button>
            </th>

            {/* Date Added Header */}
            <th className="py-3.5 px-3 text-left font-normal hidden sm:table-cell" scope="col">
              <button
                type="button"
                onClick={() => onSortChange('dateAdded')}
                className="group inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                <span>Date added</span>
                <span className="text-neutral-400 dark:text-neutral-500">
                  {sortField === 'dateAdded' ? (
                    sortOrder === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  )}
                </span>
              </button>
            </th>

            {/* Added By Header */}
            <th className="py-3.5 px-3 text-left font-normal" scope="col">
              <button
                type="button"
                onClick={() => onSortChange('author')}
                className="group inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                <span>Added by</span>
                <span className="text-neutral-400 dark:text-neutral-500">
                  {sortField === 'author' ? (
                    sortOrder === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  )}
                </span>
              </button>
            </th>

            {/* Action Menu Header */}
            <th className="py-3.5 pr-4 pl-2 text-right font-normal w-12" scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100/80 dark:divide-neutral-900/60">
          {documents.map((doc) => (
            <DocumentTableRow
              key={doc.id}
              doc={doc}
              isSelected={selectedIds.includes(doc.id)}
              hasActiveSelection={hasActiveSelection}
              onToggleSelect={onToggleSelect}
              onDocumentClick={onDocumentClick}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>

      {documents.length === 0 && (
        <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No documents found matching this filter</p>
        </div>
      )}
    </div>
  );
};
