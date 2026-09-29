import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Check,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentGridProps {
  documents: DocumentItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onDocumentClick: (doc: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
  onDelete?: (id: string) => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  selectedIds,
  onToggleSelect,
  onDocumentClick,
  onDownload,
  onDelete,
}) => {
  const getFileIcon = (type: DocumentItem['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'sheet':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case 'spec':
        return <FileCode className="w-8 h-8 text-blue-500" />;
      default:
        return <File className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
      {documents.map((doc) => {
        const isSelected = selectedIds.includes(doc.id);

        return (
          <div
            key={doc.id}
            role="button"
            tabIndex={0}
            onClick={() => onDocumentClick(doc)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDocumentClick(doc);
              }
            }}
            className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-neutral-50 dark:bg-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#0a0a0a] border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs'
            }`}
          >
            {/* Top row: Checkbox + file badge */}
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(doc.id);
                }}
                className={`w-4 h-4 rounded-[5px] flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'border border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 bg-transparent'
                }`}
                aria-label={`Select ${doc.name}`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <span className="text-[11px] font-mono uppercase text-neutral-400 dark:text-neutral-500">
                {doc.type}
              </span>
            </div>

            {/* Center File Preview / Icon */}
            <div className="my-6 flex flex-col items-center justify-center py-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/60 group-hover:scale-[1.02] transition-transform">
              {getFileIcon(doc.type)}
              <span className="mt-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500 tabular-nums">
                {doc.size}
              </span>
            </div>

            {/* Bottom Info: Title & Author */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {doc.name}
              </h4>
              <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                {doc.dateAdded}
              </p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-900/80">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${doc.author.bgColor}`}
                  >
                    {doc.author.initial}
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                    {doc.author.name}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onDocumentClick(doc)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {onDownload && (
                    <button
                      onClick={() => onDownload(doc)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
