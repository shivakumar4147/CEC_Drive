import React from 'react';
import { Clock, FileText, Download, Eye, Tag } from 'lucide-react';
import { DocumentItem } from '../types';

interface RecentFilesViewProps {
  documents: DocumentItem[];
  onPreviewDoc: (doc: DocumentItem) => void;
  onDownloadDoc: (doc: DocumentItem) => void;
}

export const RecentFilesView: React.FC<RecentFilesViewProps> = ({
  documents,
  onPreviewDoc,
  onDownloadDoc,
}) => {
  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
          <Clock className="w-4 h-4 text-emerald-200" />
          <span>Timeline View</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Recent Files</h1>
        <p className="text-xs text-emerald-100">
          All recently uploaded lecture notes, problem sets, and presentations sorted by publication date.
        </p>
      </div>

      {/* Recent Documents List */}
      <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs divide-y divide-neutral-100 dark:divide-neutral-800/80">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {doc.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {doc.author?.name || 'Academic Staff'}
                  </span>
                  <span>•</span>
                  <span>{doc.dateAdded}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">{doc.size}</span>
                  {doc.tag && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        doc.tag === 'important'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}
                    >
                      {doc.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => onPreviewDoc(doc)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => onDownloadDoc(doc)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
