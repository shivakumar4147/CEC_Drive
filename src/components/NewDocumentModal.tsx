import React, { useState } from 'react';
import { X, Upload, Check, Folder } from 'lucide-react';
import { DocumentItem, FolderItem } from '../types';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: DocumentItem) => void;
  folders?: FolderItem[];
  defaultFolderId?: string | null;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
  folders = [],
  defaultFolderId = null,
}) => {
  const [name, setName] = useState('');
  const [authorName, setAuthorName] = useState('Shiva Student');
  const [type, setType] = useState<DocumentItem['type']>('pdf');
  const [tag, setTag] = useState<'important' | 'normal'>('normal');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(defaultFolderId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = authorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 1) || 'S';

    const colors = [
      'bg-purple-600',
      'bg-rose-500',
      'bg-fuchsia-600',
      'bg-sky-500',
      'bg-indigo-600',
      'bg-emerald-600',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: name.trim(),
      dateAdded: dateFormatted,
      rawDate: now.toISOString(),
      author: {
        name: authorName,
        initial: initials,
        bgColor: randomColor,
      },
      folderId: selectedFolderId,
      size: `${(Math.random() * 8 + 1.2).toFixed(1)} MB`,
      type,
      tag,
    };

    onAddDocument(newDoc);
    setName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-document-modal-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="new-document-modal-title"
                className="text-base font-semibold text-neutral-900 dark:text-white"
              >
                Add New Document
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Upload or create a document in this workspace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Document Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DBMS Unit 2 Complete Notes PDF"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Destination Folder Directory
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <select
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value ? e.target.value : null)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root / Unassigned</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Author / Uploader
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Format
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentItem['type'])}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF Document</option>
                <option value="doc">Word / Spec</option>
                <option value="sheet">Spreadsheet</option>
                <option value="presentation">Presentation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Tag / Priority
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as 'important' | 'normal')}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Create Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
