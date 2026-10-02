import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  Search,
  Folder as FolderIcon,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { DocumentItem, FolderItem } from '../types';

interface RecycleBinViewProps {
  deletedFolders: FolderItem[];
  deletedDocuments: DocumentItem[];
  allFolders: FolderItem[];
  onRestoreFolder: (folderId: string) => void;
  onRestoreDoc: (docId: string) => void;
  onPermanentDeleteFolder: (folderId: string) => void;
  onPermanentDeleteDoc: (docId: string) => void;
  onEmptyRecycleBin: () => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  deletedFolders,
  deletedDocuments,
  allFolders,
  onRestoreFolder,
  onRestoreDoc,
  onPermanentDeleteFolder,
  onPermanentDeleteDoc,
  onEmptyRecycleBin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFolders = deletedFolders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDocs = deletedDocuments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = deletedFolders.length + deletedDocuments.length;

  const getParentFolderName = (parentId?: string | null) => {
    if (!parentId) return 'Root Directory';
    const parent = allFolders.find((f) => f.id === parentId);
    return parent ? parent.name : 'Unknown Folder';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/5 to-transparent border border-rose-500/20 dark:border-rose-500/30 backdrop-blur-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Admin Recycle Bin
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-mono">
                {totalCount} item{totalCount === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Items deleted by Lecturers or Admins are kept here. Only Admins can restore or permanently delete items.
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <button
            onClick={onEmptyRecycleBin}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-xs transition-all shadow-md cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {/* Toolbar & Search */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deleted files and folders..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-neutral-900 dark:text-white"
          />
        </div>
      </div>

      {/* Main Table */}
      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mb-3">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            Recycle Bin is Empty
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
            No files or folders have been soft-deleted. Deleted items from lecturers will appear here for admin review.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-black shadow-xs">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-900 text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/80 dark:bg-neutral-900/50">
                <th className="py-3.5 pl-4 pr-3">Name</th>
                <th className="py-3.5 px-3">Original Location</th>
                <th className="py-3.5 px-3">Deleted By</th>
                <th className="py-3.5 px-3">Date Deleted</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900 text-xs">
              {/* Deleted Folders */}
              {filteredFolders.map((folder) => (
                <tr
                  key={`folder-${folder.id}`}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors group"
                >
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <FolderIcon className="w-4 h-4 fill-amber-500/20" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {folder.name}
                        </p>
                        <span className="text-[10px] text-neutral-400 uppercase font-mono">Folder</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-500 dark:text-neutral-400">
                    {getParentFolderName(folder.parentId)}
                  </td>
                  <td className="py-3 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                    {folder.deletedBy || 'System / Admin'}
                  </td>
                  <td className="py-3 px-3 text-neutral-400 font-mono">
                    {folder.deletedAt ? new Date(folder.deletedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRestoreFolder(folder.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold transition-colors cursor-pointer"
                        title="Restore Folder"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => onPermanentDeleteFolder(folder.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Deleted Documents */}
              {filteredDocs.map((doc) => (
                <tr
                  key={`doc-${doc.id}`}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors group"
                >
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {doc.name}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-mono uppercase">
                          {doc.type} • {doc.size}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-500 dark:text-neutral-400">
                    {getParentFolderName(doc.folderId)}
                  </td>
                  <td className="py-3 px-3 font-medium text-neutral-700 dark:text-neutral-300">
                    {doc.deletedBy || 'System / Admin'}
                  </td>
                  <td className="py-3 px-3 text-neutral-400 font-mono">
                    {doc.deletedAt ? new Date(doc.deletedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRestoreDoc(doc.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold transition-colors cursor-pointer"
                        title="Restore File"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => onPermanentDeleteDoc(doc.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
