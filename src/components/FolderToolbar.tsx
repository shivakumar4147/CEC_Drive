import React, { useState } from 'react';
import {
  FolderPlus,
  FilePlus,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowUpLeft,
  MoveRight,
  Download,
  Plus,
  Scissors,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  RefreshCw,
  Search,
  Laptop,
  Pin,
  FileSpreadsheet,
} from 'lucide-react';
import { FolderItem, ViewMode, UserRole } from '../types';
import { SortField, SortOrder } from './DocumentTable';

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
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  searchQuery: string;
  pinnedFolderIds?: string[];
  userRole?: UserRole;
  isFetchingStudentDetails?: boolean;
  onNavigateToFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenNewFileModal: () => void;
  onMoveSelectedDocs: (targetFolderId: string | null) => void;
  onDownloadSelectedFolders?: () => void;
  onDownloadSelected?: () => void;
  onDeleteSelected?: () => void;
  onTogglePinFolder?: (folderId: string) => void;
  onFetchStudentDetails?: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onSearchChange?: (query: string) => void;
  onDropItem?: (targetFolderId: string | null, itemType: 'document' | 'folder', itemId: string) => void;
  canModify?: boolean;
}

export const FolderToolbar: React.FC<FolderToolbarProps> = ({
  currentFolderId,
  breadcrumbs,
  folders,
  selectedFolderIds,
  selectedDocIds,
  viewMode,
  sortField,
  sortOrder,
  searchQuery,
  pinnedFolderIds = [],
  userRole,
  isFetchingStudentDetails = false,
  onNavigateToFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onOpenNewFileModal,
  onMoveSelectedDocs,
  onDownloadSelectedFolders,
  onDownloadSelected,
  onDeleteSelected,
  onTogglePinFolder,
  onFetchStudentDetails,
  onViewModeChange,
  onSortFieldChange,
  onSortOrderChange,
  onSearchChange,
  onDropItem,
  canModify = true,
}) => {
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [targetRenameFolderId, setTargetRenameFolderId] = useState<string | null>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string | null>(null);

  // Dropdown states
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
        setIsSortMenuOpen(false);
        setIsViewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  // Target Folder to Pin/Unpin (Selected folder OR current directory)
  const targetPinFolderId = selectedFolderIds.length === 1 ? selectedFolderIds[0] : currentFolderId;
  const isPinActive = targetPinFolderId !== null;
  const isTargetPinned = targetPinFolderId ? pinnedFolderIds.includes(targetPinFolderId) : false;

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

  const isRenameActive = currentFolderId !== null || selectedFolderIds.length === 1;

  const handleOpenRenameCurrent = () => {
    if (selectedFolderIds.length === 1) {
      const folderToRename = folders.find((f) => f.id === selectedFolderIds[0]);
      if (folderToRename) {
        setTargetRenameFolderId(folderToRename.id);
        setRenameFolderName(folderToRename.name);
        setIsRenameModalOpen(true);
      }
    } else if (currentFolder) {
      setTargetRenameFolderId(currentFolder.id);
      setRenameFolderName(currentFolder.name);
      setIsRenameModalOpen(true);
    }
  };

  const isDeleteActive = selectedFolderIds.length > 0 || selectedDocIds.length > 0 || currentFolderId !== null;

  const handleDeleteCurrent = () => {
    if (onDeleteSelected) {
      onDeleteSelected();
    } else if (selectedFolderIds.length > 0) {
      selectedFolderIds.forEach((id) => onDeleteFolder(id));
    } else if (currentFolderId) {
      onDeleteFolder(currentFolderId);
      const parentIndex = breadcrumbs.length - 2;
      const parentId = parentIndex >= 0 ? breadcrumbs[parentIndex].id : null;
      onNavigateToFolder(parentId);
    }
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMoveSelectedDocs(targetMoveFolderId);
    setIsMoveModalOpen(false);
  };

  const handleBreadcrumbDrop = (targetFolderId: string | null, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canModify || !onDropItem) return;

    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      let payload: any = null;
      if (jsonStr) {
        payload = JSON.parse(jsonStr);
      } else {
        const plainStr = e.dataTransfer.getData('text/plain');
        if (plainStr.startsWith('doc:')) {
          payload = { itemType: 'document', id: plainStr.replace('doc:', '') };
        } else if (plainStr.startsWith('folder:')) {
          payload = { itemType: 'folder', id: plainStr.replace('folder:', '') };
        }
      }

      if (payload && payload.id) {
        onDropItem(targetFolderId, payload.itemType, payload.id);
      }
    } catch (err) {
      console.warn('Failed to parse breadcrumb drag drop payload:', err);
    }
  };

  return (
    <div ref={menuRef} className="flex flex-col gap-0 transition-all rounded-none bg-neutral-50 dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-[#2d2d2d]">
      {/* Bar 1: Top Address & Breadcrumb Navigation Bar */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-neutral-200/80 dark:border-[#2d2d2d] rounded-none">
        {/* Left: Up, Refresh & Breadcrumbs Path */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            onClick={() => {
              const parentIndex = breadcrumbs.length - 2;
              const parentId = parentIndex >= 0 ? breadcrumbs[parentIndex].id : null;
              onNavigateToFolder(parentId);
            }}
            disabled={!currentFolderId}
            className={`p-1.5 rounded-none transition-colors ${
              currentFolderId
                ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#2d2d2d] cursor-pointer'
                : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40'
            }`}
            title="Up to parent folder"
          >
            <ArrowUpLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigateToFolder(currentFolderId)}
            className="p-1.5 rounded-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer"
            title="Refresh folder content"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Breadcrumbs Path Box */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-xs sm:text-sm flex-1 min-w-0 bg-white dark:bg-[#2d2d2d] px-2.5 py-1 rounded-none border border-neutral-200/60 dark:border-[#383838]">
            <Laptop className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id || 'root'}>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <button
                    onClick={() => onNavigateToFolder(crumb.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => handleBreadcrumbDrop(crumb.id, e)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-none transition-colors whitespace-nowrap ${
                      isLast
                        ? 'font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-[#383838]'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#383838]/60'
                    }`}
                  >
                    <span>{crumb.name}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right: Search Input Box */}
        {onSearchChange && (
          <div className="relative shrink-0 w-36 xs:w-48 sm:w-64 flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-8 pr-3 py-1 h-[30px] text-xs rounded-none bg-white dark:bg-[#2d2d2d] border border-neutral-200/60 dark:border-[#383838] focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-200"
            />
          </div>
        )}
      </div>

      {/* Bar 2: Windows Explorer Command Toolbar Bar */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-none text-xs select-none">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* + New Dropdown */}
          {canModify && (
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setIsNewMenuOpen(!isNewMenuOpen);
                  setIsSortMenuOpen(false);
                  setIsViewMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 h-[32px] rounded-none border border-transparent text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 font-medium transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold">New</span>
                <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
              </button>

              {isNewMenuOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 w-40 p-1 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      onCreateFolder('New folder', currentFolderId);
                      setIsNewMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <FolderPlus className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Folder</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenNewFileModal();
                      setIsNewMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <FilePlus className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>File Upload</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {canModify && <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-800 mx-0.5 shrink-0" />}

          {/* Cut / Move Button */}
          {canModify && (
            <button
              onClick={() => selectedDocIds.length > 0 && setIsMoveModalOpen(true)}
              disabled={selectedDocIds.length === 0}
              className={`flex items-center justify-center gap-1.5 w-[88px] h-[32px] shrink-0 rounded-none border transition-all ${
                selectedDocIds.length > 0
                  ? 'bg-purple-600 hover:bg-purple-700 border-purple-600 text-white font-medium shadow-2xs cursor-pointer'
                  : 'border-transparent text-neutral-400 dark:text-neutral-600 opacity-40 cursor-not-allowed'
              }`}
              title={selectedDocIds.length > 0 ? 'Move selected file(s)' : 'Select file(s) to move'}
            >
              <Scissors className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline font-medium">Move</span>
              {selectedDocIds.length > 0 && <span className="font-mono text-xs">({selectedDocIds.length})</span>}
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={() => {
              if (selectedFolderIds.length > 0) {
                onDownloadSelectedFolders && onDownloadSelectedFolders();
              } else if (selectedDocIds.length > 0) {
                onDownloadSelected && onDownloadSelected();
              }
            }}
            disabled={selectedFolderIds.length === 0 && selectedDocIds.length === 0}
            className={`flex items-center justify-center gap-1.5 w-[120px] h-[32px] shrink-0 rounded-none border transition-all ${
              selectedFolderIds.length > 0 || selectedDocIds.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-medium shadow-2xs cursor-pointer'
                : 'border-transparent text-neutral-400 dark:text-neutral-600 opacity-40 cursor-not-allowed'
            }`}
            title={
              selectedFolderIds.length > 0 || selectedDocIds.length > 0
                ? 'Download selected item(s)'
                : 'Select item(s) to download'
            }
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline font-medium">Download</span>
            {(selectedFolderIds.length > 0 || selectedDocIds.length > 0) && (
              <span className="font-mono text-xs">
                ({selectedFolderIds.length > 0 ? selectedFolderIds.length : selectedDocIds.length})
              </span>
            )}
          </button>

          {/* Fetch Student Details Button (Admin & Lecturer / Uploader only) */}
          {(userRole === 'admin' || userRole === 'uploader') && onFetchStudentDetails && (
            <button
              onClick={onFetchStudentDetails}
              disabled={isFetchingStudentDetails}
              className={`flex items-center justify-center gap-1.5 px-3 h-[32px] shrink-0 rounded-none border transition-all ${
                isFetchingStudentDetails
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 opacity-80 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-medium shadow-2xs cursor-pointer'
              }`}
              title="Fetch and export student details Excel for current folder academic path"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${isFetchingStudentDetails ? 'animate-spin' : ''}`} />
              <span className="font-semibold">{isFetchingStudentDetails ? 'Fetching...' : 'Fetch Student Details'}</span>
            </button>
          )}

          {/* Pin / Quick Access Button */}
          <button
            onClick={() => targetPinFolderId && onTogglePinFolder && onTogglePinFolder(targetPinFolderId)}
            disabled={!isPinActive}
            className={`flex items-center justify-center gap-1.5 w-[92px] h-[32px] shrink-0 rounded-none border transition-all ${
              isPinActive
                ? isTargetPinned
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold cursor-pointer border-amber-300 dark:border-amber-700'
                  : 'border-transparent text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium cursor-pointer'
                : 'border-transparent text-neutral-400 dark:text-neutral-600 opacity-40 cursor-not-allowed'
            }`}
            title={
              isPinActive
                ? isTargetPinned
                  ? 'Unpin folder from Quick Access'
                  : 'Pin folder to Quick Access'
                : 'Select a folder or enter a folder to pin'
            }
          >
            <Pin className={`w-3.5 h-3.5 shrink-0 ${isTargetPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline font-medium">{isTargetPinned ? 'Pinned' : 'Pin'}</span>
          </button>

          {/* Rename Button */}
          {canModify && (
            <button
              onClick={() => isRenameActive && handleOpenRenameCurrent()}
              disabled={!isRenameActive}
              className={`flex items-center justify-center gap-1.5 w-[90px] h-[32px] shrink-0 rounded-none border transition-all ${
                isRenameActive
                  ? 'border-transparent text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium cursor-pointer'
                  : 'border-transparent text-neutral-400 dark:text-neutral-600 opacity-40 cursor-not-allowed'
              }`}
              title={isRenameActive ? 'Rename selected item' : 'Select single item to rename'}
            >
              <Edit2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline font-medium">Rename</span>
            </button>
          )}

          {/* Delete Button */}
          {canModify && (
            <button
              onClick={() => isDeleteActive && handleDeleteCurrent()}
              disabled={!isDeleteActive}
              className={`flex items-center justify-center gap-1.5 w-[86px] h-[32px] shrink-0 rounded-none border transition-all ${
                isDeleteActive
                  ? 'border-transparent text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium cursor-pointer'
                  : 'border-transparent text-neutral-400 dark:text-neutral-600 opacity-40 cursor-not-allowed'
              }`}
              title={isDeleteActive ? 'Delete selected item(s)' : 'Select item(s) to delete'}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline font-medium">Delete</span>
            </button>
          )}
        </div>

        {/* Right Section: Sort ⌄ & View ⌄ Dropdown Menus */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Sort Dropdown Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsSortMenuOpen(!isSortMenuOpen);
                setIsViewMenuOpen(false);
                setIsNewMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 h-[32px] rounded-none border border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">Sort</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-44 p-1 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl animate-in fade-in duration-100 space-y-0.5">
                <button
                  onClick={() => {
                    onSortFieldChange('name');
                    setIsSortMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span>Name</span>
                  {sortField === 'name' && <span className="text-blue-500 font-bold">•</span>}
                </button>
                <button
                  onClick={() => {
                    onSortFieldChange('dateAdded');
                    setIsSortMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span>Date Modified</span>
                  {sortField === 'dateAdded' && <span className="text-blue-500 font-bold">•</span>}
                </button>
                <button
                  onClick={() => {
                    onSortFieldChange('author');
                    setIsSortMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span>Type / Author</span>
                  {sortField === 'author' && <span className="text-blue-500 font-bold">•</span>}
                </button>
                <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
                <button
                  onClick={() => {
                    onSortOrderChange('asc');
                    setIsSortMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span>Ascending</span>
                  {sortOrder === 'asc' && <span className="text-blue-500 font-bold">•</span>}
                </button>
                <button
                  onClick={() => {
                    onSortOrderChange('desc');
                    setIsSortMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span>Descending</span>
                  {sortOrder === 'desc' && <span className="text-blue-500 font-bold">•</span>}
                </button>
              </div>
            )}
          </div>

          {/* View Dropdown Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsViewMenuOpen(!isViewMenuOpen);
                setIsSortMenuOpen(false);
                setIsNewMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 h-[32px] rounded-none border border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">View</span>
              <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
            </button>

            {isViewMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-48 p-1 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl animate-in fade-in duration-100 space-y-0.5">
                <button
                  onClick={() => {
                    onViewModeChange('grid');
                    setIsViewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-neutral-500" />
                    <span>Medium icons (Grid)</span>
                  </div>
                  {viewMode === 'grid' && <span className="text-blue-500 font-bold">•</span>}
                </button>
                <button
                  onClick={() => {
                    onViewModeChange('list');
                    setIsViewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-none text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <ListIcon className="w-4 h-4 text-neutral-500" />
                    <span>List / Details</span>
                  </div>
                  {viewMode === 'list' && <span className="text-blue-500 font-bold">•</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-sm p-6 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create New Folder</h3>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Folder Name
              </label>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Assignments 2026"
                className="w-full px-3 py-2 text-sm rounded-none border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-4 py-2 rounded-none text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="px-4 py-2 rounded-none text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleRenameSubmit}
            className="w-full max-w-sm p-6 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Rename Folder</h3>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                New Name
              </label>
              <input
                type="text"
                autoFocus
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-none border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 rounded-none text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!renameFolderName.trim()}
                className="px-4 py-2 rounded-none text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors"
              >
                Rename
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
            className="w-full max-w-md p-6 rounded-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Move {selectedDocIds.length} File(s)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select target destination folder:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1 py-1 pr-1 border rounded-none border-neutral-200 dark:border-neutral-800 p-2">
              <button
                type="button"
                onClick={() => setTargetMoveFolderId(null)}
                className={`w-full flex items-center gap-2 p-2 rounded-none text-xs font-medium text-left transition-colors ${
                  targetMoveFolderId === null
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Laptop className="w-4 h-4 text-blue-500" />
                <span>Root Directory (Home)</span>
              </button>

              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTargetMoveFolderId(f.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-none text-xs font-medium text-left transition-colors ${
                    targetMoveFolderId === f.id
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <FolderPlus className="w-4 h-4 text-amber-500" />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 rounded-none text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-none text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
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
