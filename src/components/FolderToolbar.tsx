import React, { useState } from 'react';
import {
  FolderPlus,
  FilePlus,
  ChevronRight,
  Folder,
  Edit2,
  Trash2,
  ArrowUpLeft,
  MoveRight,
  FolderOpen,
} from 'lucide-react';
import { FolderItem } from '../types';

interface BreadcrumbPathItem {
  id: string | null; // null represents Root
  name: string;
}

interface FolderToolbarProps {
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbPathItem[];
  folders: FolderItem[];
  selectedFolderIds: string[];
  selectedDocIds: string[];
  onNavigateToFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenNewFileModal: () => void;
  onMoveSelectedDocs: (targetFolderId: string | null) => void;
}

export const FolderToolbar: React.FC<FolderToolbarProps> = ({
  currentFolderId,
  breadcrumbs,
  folders,
  selectedFolderIds,
  selectedDocIds,
  onNavigateToFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onOpenNewFileModal,
  onMoveSelectedDocs,
}) => {
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [targetRenameFolderId, setTargetRenameFolderId] = useState<string | null>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string | null>(null);

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setIsNewFolderModalOpen(false);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRenameFolderId && renameFolderName.trim()) {
      onRenameFolder(targetRenameFolderId, renameFolderName.trim());
      setRenameFolderName('');
      setTargetRenameFolderId(null);
      setIsRenameModalOpen(false);
    }
  };

  const handleOpenRenameCurrent = () => {
    if (currentFolder) {
      setTargetRenameFolderId(currentFolder.id);
      setRenameFolderName(currentFolder.name);
      setIsRenameModalOpen(true);
    } else if (selectedFolderIds.length === 1) {
      const folderToRename = folders.find((f) => f.id === selectedFolderIds[0]);
      if (folderToRename) {
        setTargetRenameFolderId(folderToRename.id);
        setRenameFolderName(folderToRename.name);
        setIsRenameModalOpen(true);
      }
    }
  };

  const handleDeleteCurrent = () => {
    if (currentFolderId) {
      if (confirm(`Are you sure you want to delete folder "${currentFolder?.name}"?`)) {
        onDeleteFolder(currentFolderId);
        // Navigate up
        const parentIndex = breadcrumbs.length - 2;
        const parentId = parentIndex >= 0 ? breadcrumbs[parentIndex].id : null;
        onNavigateToFolder(parentId);
      }
    } else if (selectedFolderIds.length > 0) {
      if (confirm(`Delete ${selectedFolderIds.length} selected folder(s)?`)) {
        selectedFolderIds.forEach((id) => onDeleteFolder(id));
      }
    }
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMoveSelectedDocs(targetMoveFolderId);
    setIsMoveModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur-sm shadow-xs transition-all">
      {/* Top Row: Navigation Breadcrumbs & Parent Jump Button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs sm:text-sm">
          {currentFolderId && (
            <button
              onClick={() => {
                const parentIndex = breadcrumbs.length - 2;
                const parentId = parentIndex >= 0 ? breadcrumbs[parentIndex].id : null;
                onNavigateToFolder(parentId);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors mr-1"
              title="Go up one folder"
            >
              <ArrowUpLeft className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Up</span>
            </button>
          )}

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id || 'root'}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
                <button
                  onClick={() => onNavigateToFolder(crumb.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    isLast
                      ? 'font-bold text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <Folder className={`w-3.5 h-3.5 ${isLast ? 'text-blue-500 fill-blue-500/20' : 'text-neutral-400'}`} />
                  <span>{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Explorer Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* New Folder Button */}
          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 shadow-xs transition-all"
            title="Create subfolder here"
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span className="hidden xs:inline">New Folder</span>
          </button>

          {/* New File Button */}
          <button
            onClick={onOpenNewFileModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
            title="Add new file to this folder"
          >
            <FilePlus className="w-4 h-4" />
            <span className="hidden xs:inline">Add File</span>
          </button>

          {/* Move Files Button (Visible when files selected) */}
          {selectedDocIds.length > 0 && (
            <button
              onClick={() => setIsMoveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all animate-in fade-in duration-150"
              title="Move selected files to another folder"
            >
              <MoveRight className="w-4 h-4" />
              <span>Move ({selectedDocIds.length})</span>
            </button>
          )}

          {/* Rename Active/Selected Folder */}
          {(currentFolderId || selectedFolderIds.length === 1) && (
            <button
              onClick={handleOpenRenameCurrent}
              className="p-1.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
              title="Rename folder"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Delete Active/Selected Folder */}
          {(currentFolderId || selectedFolderIds.length > 0) && (
            <button
              onClick={handleDeleteCurrent}
              className="p-1.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Delete folder"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Create New Folder
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Location:{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {currentFolder ? currentFolder.name : 'Root Directory'}
              </span>
            </p>
            <input
              type="text"
              required
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder Name (e.g., Computer Networks, Notes)"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Folder Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleRenameSubmit}
            className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Rename Folder
              </h3>
            </div>
            <input
              type="text"
              required
              autoFocus
              value={renameFolderName}
              onChange={(e) => setRenameFolderName(e.target.value)}
              placeholder="New Folder Name"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Move Files Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleMoveSubmit}
            className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <MoveRight className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Move {selectedDocIds.length} Selected File(s)
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select destination folder directory:
            </p>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 bg-neutral-50/50 dark:bg-neutral-950/40">
              {/* Option for Root Directory */}
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  targetMoveFolderId === null
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold border border-blue-300 dark:border-blue-700'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="destinationFolder"
                  checked={targetMoveFolderId === null}
                  onChange={() => setTargetMoveFolderId(null)}
                  className="sr-only"
                />
                <FolderOpen className="w-4 h-4 text-blue-500" />
                <span>Root Directory (Unassigned)</span>
              </label>

              {/* All Available Folders */}
              {folders.map((f) => (
                <label
                  key={f.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    targetMoveFolderId === f.id
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold border border-blue-300 dark:border-blue-700'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="destinationFolder"
                      checked={targetMoveFolderId === f.id}
                      onChange={() => setTargetMoveFolderId(f.id)}
                      className="sr-only"
                    />
                    <Folder className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                    <span>{f.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">{f.fileCount} files</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
              >
                Move Files
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
