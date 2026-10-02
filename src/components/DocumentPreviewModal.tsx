import React from 'react';
import {
  X,
  Download,
  Calendar,
  User,
  HardDrive,
  FileText,
  Star,
  Folder,
  ExternalLink,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentItem, FolderItem } from '../types';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (doc: DocumentItem) => void;
  onToggleStar?: (id: string) => void;
  folders?: FolderItem[];
  onMoveDocToFolder?: (docId: string, folderId: string | null) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  onToggleStar,
  folders = [],
  onMoveDocToFolder,
}) => {
  if (!isOpen || !document) return null;

  const currentFolder = folders.find((f) => f.id === document.folderId);
  const fileUrl = document.fileUrl || (document as any).url;
  const ext = (document.originalFilename || document.name).split('.').pop()?.toLowerCase() || '';

  const isPdf = document.type === 'pdf' || ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || document.mimeType?.startsWith('image/');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3
                id="preview-modal-title"
                className="text-base font-semibold text-neutral-900 dark:text-white line-clamp-1"
              >
                {document.name}
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono uppercase">
                {ext ? `.${ext}` : document.type} • {document.size}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            aria-label="Close document preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Format-Specific Display */}
          {fileUrl && isPdf ? (
            /* PDF Browser View */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  PDF Preview
                </span>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <span>Open PDF in new tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <iframe
                src={fileUrl}
                title={`PDF preview of ${document.name}`}
                className="w-full h-80 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900"
              />
            </div>
          ) : fileUrl && isImage ? (
            /* Image Direct Viewer */
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Image Preview
              </span>
              <div className="p-2 rounded-xl bg-neutral-900/5 dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center min-h-[220px]">
                <img
                  src={fileUrl}
                  alt={document.name}
                  className="max-h-80 max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          ) : (
            /* File Information Card for DOCX/XLSX/PPTX/ZIP */
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    File Information
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Preview not rendered inline for .{ext || 'document'} files. Click Download to open locally.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800">
                  <span className="block text-[11px] text-neutral-400 uppercase font-semibold">
                    Filename
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white truncate block mt-0.5">
                    {document.originalFilename || document.name}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800">
                  <span className="block text-[11px] text-neutral-400 uppercase font-semibold">
                    Type
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-white block mt-0.5 uppercase">
                    {ext || document.type}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#121212] border border-neutral-100 dark:border-neutral-800">
                  <span className="block text-[11px] text-neutral-400 uppercase font-semibold">
                    Size
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-white block mt-0.5">
                    {document.size}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Document Metadata Details */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <User className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>Uploaded By:</span>
              <span className="font-medium text-neutral-900 dark:text-white truncate">
                {document.author.name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>Added:</span>
              <span className="font-medium text-neutral-900 dark:text-white truncate">
                {document.dateAdded}
              </span>
            </div>

            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <HardDrive className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>File Reference ID:</span>
              <span className="font-mono text-neutral-900 dark:text-white truncate">
                {document.id}
              </span>
            </div>

            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  document.tag === 'important' ? 'bg-rose-500' : 'bg-amber-500'
                }`}
              />
              <span>Priority:</span>
              <span className="font-medium capitalize text-neutral-900 dark:text-white">
                {document.tag || 'Normal'}
              </span>
            </div>
          </div>

          {/* Folder Directory Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Folder Directory Location
            </label>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-500 shrink-0" />
              <select
                value={document.folderId || ''}
                onChange={(e) => {
                  const target = e.target.value ? e.target.value : null;
                  if (onMoveDocToFolder) {
                    onMoveDocToFolder(document.id, target);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root / Unassigned</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
            {currentFolder && (
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Currently stored in: <span className="font-semibold">{currentFolder.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-black shrink-0">
          <button
            onClick={() => onToggleStar && onToggleStar(document.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                document.starred
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-neutral-400'
              }`}
            />
            <span>{document.starred ? 'Starred' : 'Add to Starred'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
            >
              Close
            </button>

            {onDownload && (
              <button
                onClick={() => onDownload(document)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
