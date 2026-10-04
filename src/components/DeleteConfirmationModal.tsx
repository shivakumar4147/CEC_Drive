import React from 'react';
import {
  Trash2,
  Folder,
  FileText,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
} from 'lucide-react';
import { FolderItem, DocumentItem } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  selectedFolders: FolderItem[];
  selectedDocs: DocumentItem[];
  currentFolderToDelete?: FolderItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  selectedFolders,
  selectedDocs,
  currentFolderToDelete,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  // Determine total items to delete
  const foldersList = currentFolderToDelete
    ? [currentFolderToDelete]
    : selectedFolders;
  const docsList = currentFolderToDelete ? [] : selectedDocs;

  const totalFoldersCount = foldersList.length;
  const totalDocsCount = docsList.length;
  const totalItemsCount = totalFoldersCount + totalDocsCount;

  // Helper for file type icons
  const getFileIcon = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('pdf')) return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
    if (t.includes('sheet') || t.includes('xls') || t.includes('csv'))
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (t.includes('slide') || t.includes('ppt') || t.includes('presentation'))
      return <Presentation className="w-4 h-4 text-amber-500 shrink-0" />;
    if (t.includes('jpg') || t.includes('png') || t.includes('image'))
      return <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />;
    return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
  };

  // Compose subtitle text
  const getSummarySubtitle = () => {
    if (totalFoldersCount > 0 && totalDocsCount > 0) {
      return `You are about to delete ${totalFoldersCount} folder${totalFoldersCount > 1 ? 's' : ''} and ${totalDocsCount} file${totalDocsCount > 1 ? 's' : ''}.`;
    }
    if (totalFoldersCount > 0) {
      return `You are about to delete ${totalFoldersCount} folder${totalFoldersCount > 1 ? 's' : ''}.`;
    }
    return `You are about to delete ${totalDocsCount} file${totalDocsCount > 1 ? 's' : ''}.`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-none text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-none bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                Confirm Deletion
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                {getSummarySubtitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body: Scrollable Item Breakdown List */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Selected Items ({totalItemsCount})
            </label>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-none bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 scrollbar-thin">
              {/* Folders */}
              {foldersList.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {folder.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-none bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 shrink-0">
                    Folder
                  </span>
                </div>
              ))}

              {/* Documents */}
              {docsList.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getFileIcon(doc.type)}
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {doc.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-none bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 shrink-0">
                    {doc.size || 'File'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-none bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Will be moved to Admin Recycle Bin</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
                {totalFoldersCount > 0
                  ? 'Items inside selected folders will also be soft-deleted. Admins can restore items anytime.'
                  : 'Items will remain restorable from the Admin Recycle Bin.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 p-4 px-6 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-none text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-none text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>
              Delete {totalItemsCount > 1 ? `All ${totalItemsCount} Items` : 'Item'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
