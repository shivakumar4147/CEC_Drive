import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  FileText,
  Bell,
  Send,
  Download,
  Folder,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  CheckCheck,
} from 'lucide-react';
import { DocumentItem } from '../types';

export type InboxCategory = 'all' | 'direct' | 'files' | 'notices';

export interface InboxItem {
  id: string;
  type: 'direct' | 'file' | 'notice';
  title: string;
  sender: {
    name: string;
    role: string;
    avatarBg: string;
    initial: string;
  };
  timestamp: string;
  rawDate: string;
  unread: boolean;
  preview: string;
  // Extra fields for details
  subjectCode?: string;
  fileDetails?: {
    fileName: string;
    fileSize: string;
    fileType: string;
    folderName: string;
  };
  noticeDetails?: {
    category: string;
    officialTag: string;
    fullContent: string;
    actionLabel?: string;
  };
  chatThread?: {
    id: string;
    senderName: string;
    isStudent: boolean;
    text: string;
    time: string;
  }[];
}

const INITIAL_INBOX_ITEMS: InboxItem[] = [
  {
    id: 'msg-1',
    type: 'direct',
    title: 'DBMS Assignment 2 Clarification',
    sender: {
      name: 'Dr. Ramesh Kumar',
      role: 'DBMS Professor',
      avatarBg: 'bg-blue-600',
      initial: 'R',
    },
    timestamp: '10:45 AM',
    rawDate: '2026-09-30T10:45:00',
    unread: true,
    preview: 'Shiva, please make sure to include ER Diagrams in your submission before Friday.',
    subjectCode: 'CS501',
    chatThread: [
      {
        id: 't-1',
        senderName: 'Shiva',
        isStudent: true,
        text: 'Respected Professor, for Question 3 of Assignment 2, should we use B+ tree or B tree indexing?',
        time: 'Yesterday 4:15 PM',
      },
      {
        id: 't-2',
        senderName: 'Dr. Ramesh Kumar',
        isStudent: false,
        text: 'You should specify B+ tree indexing as discussed in Monday lecture. Also make sure to include ER Diagrams in your submission before Friday.',
        time: 'Today 10:45 AM',
      },
    ],
  },
  {
    id: 'msg-2',
    type: 'file',
    title: 'New CN Unit 3 PPT Slides Uploaded',
    sender: {
      name: 'Prof. Anitha Rao',
      role: 'Computer Networks Lecturer',
      avatarBg: 'bg-emerald-600',
      initial: 'A',
    },
    timestamp: '09:15 AM',
    rawDate: '2026-09-30T09:15:00',
    unread: true,
    preview: 'Uploaded "Unit 3 TCP IP Protocol Suite.pptx" to the Computer Networks folder.',
    subjectCode: 'CS502',
    fileDetails: {
      fileName: 'Unit 3 TCP IP Protocol Suite.pptx',
      fileSize: '18.4 MB',
      fileType: 'presentation',
      folderName: 'Computer Networks',
    },
  },
  {
    id: 'msg-3',
    type: 'notice',
    title: '5th Semester Internal Exam 2 Schedule',
    sender: {
      name: 'Office of Dean Academics',
      role: 'Canara Engineering College',
      avatarBg: 'bg-amber-600',
      initial: 'C',
    },
    timestamp: 'Yesterday',
    rawDate: '2026-09-29T16:00:00',
    unread: false,
    preview: 'The timetable for 5th Sem Mid-Term Exams starting Oct 12, 2026 has been published.',
    noticeDetails: {
      category: 'Exam Notice',
      officialTag: 'OFFICIAL ANNOUNCEMENT',
      fullContent: `Dear Students,\n\nThe 2nd Internal Assessment Examinations for 5th Semester B.E. (Computer Science & Engineering) are scheduled from October 12 to October 16, 2026.\n\nKey Guidelines:\n• Attendance is compulsory for all internal tests.\n• Seating arrangements will be displayed on the department notice board.\n• Hall tickets will be issued starting Oct 8 upon clearing lab records.`,
      actionLabel: 'Download Timetable PDF',
    },
  },
  {
    id: 'msg-4',
    type: 'direct',
    title: 'DAA Recursion Tree Solved Notes',
    sender: {
      name: 'Ananya Hegde',
      role: 'Classmate • CSE 5A',
      avatarBg: 'bg-purple-600',
      initial: 'A',
    },
    timestamp: 'Yesterday',
    rawDate: '2026-09-29T14:20:00',
    unread: false,
    preview: 'Hey Shiva, here are the master theorem and recursion tree notes from yesterday\'s tutorial.',
    subjectCode: 'CS503',
    chatThread: [
      {
        id: 't-3',
        senderName: 'Ananya Hegde',
        isStudent: false,
        text: 'Hey Shiva, here are the master theorem and recursion tree notes from yesterday\'s tutorial class. Let me know if you want to review problem 4 together.',
        time: 'Yesterday 2:20 PM',
      },
    ],
  },
  {
    id: 'msg-5',
    type: 'file',
    title: 'Software Engineering SRS Template Revision',
    sender: {
      name: 'Prof. Suresh Hegde',
      role: 'Software Engineering Faculty',
      avatarBg: 'bg-indigo-600',
      initial: 'S',
    },
    timestamp: 'Sep 28',
    rawDate: '2026-09-28T11:30:00',
    unread: false,
    preview: 'Updated IEEE SRS Document Template v2.0 in the Software Engineering course section.',
    subjectCode: 'CS504',
    fileDetails: {
      fileName: 'IEEE SRS Template v2.0.docx',
      fileSize: '4.2 MB',
      fileType: 'doc',
      folderName: 'Software Engineering',
    },
  },
];

interface InboxProps {
  onSelectNav?: (key: any) => void;
  onPreviewDoc?: (doc: DocumentItem) => void;
  onDownloadDoc?: (doc: DocumentItem) => void;
}

export const Inbox: React.FC<InboxProps> = ({
  onSelectNav,
  onDownloadDoc,
}) => {
  const [activeCategory, setActiveCategory] = useState<InboxCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inboxItems, setInboxItems] = useState<InboxItem[]>(INITIAL_INBOX_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string>('msg-1');
  const [replyText, setReplyText] = useState('');
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Filter items
  const filteredItems = inboxItems.filter((item) => {
    if (activeCategory === 'direct' && item.type !== 'direct') return false;
    if (activeCategory === 'files' && item.type !== 'file') return false;
    if (activeCategory === 'notices' && item.type !== 'notice') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.sender.name.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedItem = inboxItems.find((i) => i.id === selectedItemId) || inboxItems[0];

  const handleSelectItem = (item: InboxItem) => {
    setSelectedItemId(item.id);
    setShowMobileDetail(true);
    // Mark as read
    if (item.unread) {
      setInboxItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i))
      );
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedItem || selectedItem.type !== 'direct') return;

    const newMsg = {
      id: `t-${Date.now()}`,
      senderName: 'Shiva',
      isStudent: true,
      text: replyText.trim(),
      time: 'Just now',
    };

    setInboxItems((prev) =>
      prev.map((item) => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            preview: `You: ${replyText.trim()}`,
            timestamp: 'Just now',
            chatThread: [...(item.chatThread || []), newMsg],
          };
        }
        return item;
      })
    );

    setReplyText('');
  };

  const unreadCount = inboxItems.filter((i) => i.unread).length;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-900">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Inbox
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white shadow-xs">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Personal academic communications, lecturer messages, and official department notices
          </p>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>All</span>
            <span className="opacity-70 font-mono text-[11px]">{inboxItems.length}</span>
          </button>

          <button
            onClick={() => setActiveCategory('direct')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'direct'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages</span>
          </button>

          <button
            onClick={() => setActiveCategory('files')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'files'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>File Alerts</span>
          </button>

          <button
            onClick={() => setActiveCategory('notices')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'notices'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Notices</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split View Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Column: Messages List (Visible on desktop or when mobile detail is closed) */}
        <div
          className={`md:col-span-5 lg:col-span-4 flex flex-col space-y-3 ${
            showMobileDetail ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages & alerts..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* List Stream */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-neutral-100 dark:divide-neutral-900">
            {filteredItems.map((item) => {
              const isSelected = item.id === selectedItemId;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectItem(item);
                  }}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-400 dark:border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-[#0a0a0a] border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      {/* Sender Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${item.sender.avatarBg}`}
                      >
                        {item.sender.initial}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                          {item.sender.name}
                        </h4>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {item.sender.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        {item.timestamp}
                      </span>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="mt-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.type === 'direct' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          DM
                        </span>
                      )}
                      {item.type === 'file' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          File Alert
                        </span>
                      )}
                      {item.type === 'notice' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                          Notice
                        </span>
                      )}
                      {item.subjectCode && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {item.subjectCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {item.preview}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No messages found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Detail View Pane (Direct Chat / File Alert / Academic Notice) */}
        <div
          className={`md:col-span-7 lg:col-span-8 flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden ${
            showMobileDetail ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedItem ? (
            <div className="flex flex-col h-full">
              {/* Top Header of Detail Pane */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/30">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowMobileDetail(false)}
                    className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${selectedItem.sender.avatarBg}`}
                  >
                    {selectedItem.sender.initial}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {selectedItem.sender.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {selectedItem.sender.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItem.subjectCode && (
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {selectedItem.subjectCode}
                    </span>
                  )}
                  <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    {selectedItem.timestamp}
                  </span>
                </div>
              </div>

              {/* Main Detail Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Received on {new Date(selectedItem.rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* TYPE 1: Direct Messages Thread */}
                {selectedItem.type === 'direct' && selectedItem.chatThread && (
                  <div className="space-y-4">
                    {selectedItem.chatThread.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex flex-col max-w-[85%] ${
                          chat.isStudent ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                            {chat.senderName}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {chat.time}
                          </span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            chat.isStudent
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded-bl-xs border border-neutral-200/60 dark:border-neutral-800/60'
                          }`}
                        >
                          {chat.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TYPE 2: File Upload Notification */}
                {selectedItem.type === 'file' && selectedItem.fileDetails && (
                  <div className="space-y-5">
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {selectedItem.preview}
                    </p>

                    <div className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                            {selectedItem.fileDetails.fileName}
                          </h4>
                          <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                            {selectedItem.fileDetails.fileSize} • Folder: {selectedItem.fileDetails.folderName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onDownloadDoc && (
                          <button
                            onClick={() =>
                              onDownloadDoc({
                                id: selectedItem.id,
                                name: selectedItem.fileDetails!.fileName,
                                dateAdded: selectedItem.timestamp,
                                rawDate: selectedItem.rawDate,
                                author: {
                                  name: selectedItem.sender.name,
                                  initial: selectedItem.sender.initial,
                                  bgColor: selectedItem.sender.avatarBg,
                                },
                                folderId: 'folder-1',
                                size: selectedItem.fileDetails!.fileSize,
                                type: 'pdf',
                                tag: 'important',
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download File</span>
                          </button>
                        )}
                        {onSelectNav && (
                          <button
                            onClick={() => onSelectNav('documents')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
                          >
                            <Folder className="w-3.5 h-3.5" />
                            <span>View Folder</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TYPE 3: Academic Notice */}
                {selectedItem.type === 'notice' && selectedItem.noticeDetails && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {selectedItem.noticeDetails.officialTag}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Category: {selectedItem.noticeDetails.category}
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed font-sans">
                      {selectedItem.noticeDetails.fullContent}
                    </div>

                    {selectedItem.noticeDetails.actionLabel && (
                      <button
                        onClick={() => alert(`Downloading official notice PDF for ${selectedItem.title}...`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
                      >
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>{selectedItem.noticeDetails.actionLabel}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Reply Composer (For Direct Messages) */}
              {selectedItem.type === 'direct' && (
                <form
                  onSubmit={handleSendReply}
                  className="p-4 border-t border-neutral-100 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selectedItem.sender.name}...`}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shrink-0"
                    aria-label="Send reply"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 dark:text-neutral-500">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Select a message or alert to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
