import React from 'react';
import {
  BookOpen,
  FileText,
  Download,
  Share2,
  Clock,
  Bell,
  Calendar as CalendarIcon,
  CheckSquare,
  Activity,
  ArrowRight,
  Eye,
  FileCode,
  FileSpreadsheet,
  Presentation,
  Folder,
  Sparkles,
  User,
  GraduationCap,
  Megaphone,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DashboardProps {
  onSelectNav: (key: any) => void;
  onPreviewDoc: (doc: DocumentItem) => void;
  onDownloadDoc: (doc: DocumentItem) => void;
  documents: DocumentItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectNav,
  onPreviewDoc,
  onDownloadDoc,
  documents,
}) => {
  // Current Date context
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Subjects data
  const subjects = [
    {
      id: 'dbms',
      code: 'CS501',
      name: 'Database Management Systems',
      short: 'DBMS',
      lecturer: 'Dr. Ramesh Kumar',
      fileCount: 24,
      color: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'cn',
      code: 'CS502',
      name: 'Computer Networks',
      short: 'CN',
      lecturer: 'Prof. Anitha Rao',
      fileCount: 18,
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'daa',
      code: 'CS503',
      name: 'Design & Analysis of Algorithms',
      short: 'DAA',
      lecturer: 'Prof. Suresh Hegde',
      fileCount: 31,
      color: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'se',
      code: 'CS504',
      name: 'Software Engineering',
      short: 'SE',
      lecturer: 'Prof. Meera Nair',
      fileCount: 15,
      color: 'from-purple-600 to-violet-600',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'webtech',
      code: 'CS505',
      name: 'Web Technology & Frameworks',
      short: 'Web Tech',
      lecturer: 'Dr. Vinayaka B',
      fileCount: 29,
      color: 'from-rose-600 to-pink-600',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
  ];

  // Mock Academic Recent Files
  const academicFiles = [
    {
      id: 'file-1',
      name: 'DBMS_Unit_3_Normalization_Notes.pdf',
      subject: 'DBMS',
      type: 'pdf',
      size: '4.2 MB',
      uploader: 'Dr. Ramesh Kumar',
      date: 'Today, 09:30 AM',
      icon: <FileText className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'file-2',
      name: 'Computer_Networks_Lab_Manual_v2.pdf',
      subject: 'Computer Networks',
      type: 'pdf',
      size: '8.1 MB',
      uploader: 'Prof. Anitha Rao',
      date: 'Yesterday, 04:15 PM',
      icon: <FileText className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'file-3',
      name: 'DAA_Dynamic_Programming_Question_Bank.docx',
      subject: 'DAA',
      type: 'doc',
      size: '1.8 MB',
      uploader: 'Prof. Suresh Hegde',
      date: '28 Sep 2026',
      icon: <FileCode className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'file-4',
      name: 'Web_Tech_React_Hooks_Lecture_Slides.pptx',
      subject: 'Web Tech',
      type: 'presentation',
      size: '12.4 MB',
      uploader: 'Dr. Vinayaka B',
      date: '27 Sep 2026',
      icon: <Presentation className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'file-5',
      name: 'Software_Engineering_Agile_Scrum_Sheet.xlsx',
      subject: 'Software Eng',
      type: 'sheet',
      size: '2.5 MB',
      uploader: 'Prof. Meera Nair',
      date: '25 Sep 2026',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-500" />,
    },
  ];

  // Latest Updates
  const latestUpdates = [
    {
      id: 1,
      title: 'New DBMS normalization notes uploaded',
      subtitle: 'Dr. Ramesh Kumar posted Unit 3 PDF in DBMS folder',
      time: '2 hours ago',
      type: 'file',
      tag: 'DBMS',
    },
    {
      id: 2,
      title: 'CN Unit 3 TCP/IP slides added',
      subtitle: 'Prof. Anitha Rao uploaded 45 slides presentation',
      time: '5 hours ago',
      type: 'slides',
      tag: 'CN',
    },
    {
      id: 3,
      title: 'DAA Internal Exam 2 Portion Announcement',
      subtitle: 'Chapters 4 & 5 included. Exam scheduled for next Monday',
      time: 'Yesterday',
      type: 'announcement',
      tag: 'Exam',
    },
  ];

  // Upcoming Calendar Preview
  const upcomingEvents = [
    {
      id: 1,
      title: 'DAA Internal Test 2',
      date: 'Oct 05, 2026',
      time: '10:00 AM - 11:30 AM',
      type: 'Exam',
      color: 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
    },
    {
      id: 2,
      title: 'CN Packet Tracer Assignment Submission',
      date: 'Oct 08, 2026',
      time: '11:59 PM Deadline',
      type: 'Assignment',
      color: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      id: 3,
      title: 'DBMS SQL Viva & Lab Exam',
      date: 'Oct 12, 2026',
      time: '02:00 PM - 05:00 PM',
      type: 'Lab Viva',
      color: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    },
  ];

  // Pending Tasks
  const pendingTasks = [
    { id: 1, title: 'Complete Web Tech React Counter assignment', subject: 'Web Tech', status: 'Pending' },
    { id: 2, title: 'Review CN TCP 3-way handshake diagram', subject: 'CN', status: 'In Progress' },
    { id: 3, title: 'Solve DAA 0/1 Knapsack problem set', subject: 'DAA', status: 'Pending' },
  ];

  // Recent Activity Log
  const recentActivities = [
    { id: 1, action: 'Viewed', item: 'DBMS Unit 3 Notes', time: '10 mins ago' },
    { id: 2, action: 'Downloaded', item: 'CN Lab Manual v2', time: '1 hour ago' },
    { id: 3, action: 'Opened', item: 'Web Tech Slides', time: '3 hours ago' },
  ];

  // Announcements
  const classAnnouncements = [
    {
      id: 1,
      title: 'Department Tech Symposium Registrations Open',
      date: 'Sep 29',
      author: 'CSE HOD Office',
    },
    {
      id: 2,
      title: 'Special Guest Lecture on Cloud Architecture this Friday',
      date: 'Sep 28',
      author: 'Placement Cell',
    },
  ];

  return (
    <div className="space-y-7 pb-10">
      {/* 1. Welcome / Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-72 h-72" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>CEC Drive • Student Portal</span>
              <span>•</span>
              <span>{dateFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, Shiva 👋
            </h1>
            <p className="text-sm text-blue-100 font-medium flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold">
                CSE
              </span>
              <span>3rd Year</span>
              <span>•</span>
              <span>5th Semester</span>
              <span>•</span>
              <span className="text-blue-200">Canara Engineering College</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectNav('documents')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Folder className="w-4 h-4" />
              <span>Browse All Folders</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Access Row */}
      <section aria-label="Quick Access Shortcuts">
        <h2 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onSelectNav('documents')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500/80 hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                My Subjects
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                5 Active Courses
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectNav('documents')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Recent Files
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Updated today
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectNav('documents')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500/80 hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 transition-colors">
                Downloads
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                12 Offline PDFs
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectNav('channels')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500/80 hover:shadow-md transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Shared with Me
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Lecturer Uploads
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Main Grid Layout (Left: Subjects & Recent Files | Right: Updates & Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-7">
          {/* My Subjects Grid */}
          <section aria-labelledby="subjects-heading">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 id="subjects-heading" className="text-base font-bold text-neutral-900 dark:text-white">
                  My Subjects
                </h2>
              </div>
              <button
                onClick={() => onSelectNav('documents')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all folders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {subjects.map((subj) => (
                <div
                  key={subj.id}
                  onClick={() => onSelectNav('documents')}
                  className="group relative p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500/80 dark:hover:border-blue-500/80 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${subj.badgeBg}`}>
                      {subj.code}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                      {subj.fileCount} files
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {subj.name}
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-neutral-400" />
                    <span>{subj.lecturer}</span>
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                    <span>Notes • Slides • Question Banks</span>
                    <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Open <ChevronRightIcon />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Files Table */}
          <section aria-labelledby="recent-files-heading">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 id="recent-files-heading" className="text-base font-bold text-neutral-900 dark:text-white">
                  Recent Files
                </h2>
              </div>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                Uploaded by Lecturers
              </span>
            </div>

            <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {academicFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 group-hover:scale-105 transition-transform">
                        {file.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {file.subject}
                          </span>
                          <span>•</span>
                          <span>{file.uploader}</span>
                          <span>•</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 mr-2">
                        {file.size}
                      </span>
                      <button
                        onClick={() =>
                          onPreviewDoc({
                            id: file.id,
                            name: file.name,
                            dateAdded: file.date,
                            rawDate: '2026-09-29',
                            author: { name: file.uploader, initial: 'L', bgColor: 'bg-blue-600' },
                            folderId: 'folder-1',
                            size: file.size,
                            type: file.type as any,
                            tag: 'normal',
                          })
                        }
                        className="p-1.5 text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Preview File"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onDownloadDoc({
                            id: file.id,
                            name: file.name,
                            dateAdded: file.date,
                            rawDate: '2026-09-29',
                            author: { name: file.uploader, initial: 'L', bgColor: 'bg-blue-600' },
                            folderId: 'folder-1',
                            size: file.size,
                            type: file.type as any,
                            tag: 'normal',
                          })
                        }
                        className="p-1.5 text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right 1 Column (Side Widgets) */}
        <div className="space-y-6">
          {/* Latest Academic Updates */}
          <section aria-labelledby="updates-heading">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h2 id="updates-heading" className="text-sm font-bold text-neutral-900 dark:text-white">
                  Latest Updates
                </h2>
              </div>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>

            <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 space-y-3 shadow-xs">
              {latestUpdates.map((update) => (
                <div
                  key={update.id}
                  className="p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-l-2 border-l-blue-500 pl-3"
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                    <span className="text-blue-600 dark:text-blue-400">{update.tag}</span>
                    <span>{update.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">
                    {update.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {update.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events / Calendar Preview */}
          <section aria-labelledby="upcoming-heading">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 id="upcoming-heading" className="text-sm font-bold text-neutral-900 dark:text-white">
                  Upcoming Preview
                </h2>
              </div>
              <button
                onClick={() => onSelectNav('calendar')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Calendar &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3 rounded-xl border-l-4 ${evt.color} border border-neutral-200/60 dark:border-neutral-800/60`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-neutral-900 dark:text-white">{evt.title}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-black/80 text-[10px] text-neutral-600 dark:text-neutral-300 font-mono">
                      {evt.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    <span>{evt.date}</span>
                    <span>{evt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pending Tasks Widget */}
          <section aria-labelledby="tasks-heading">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 id="tasks-heading" className="text-sm font-bold text-neutral-900 dark:text-white">
                  Pending Tasks
                </h2>
              </div>
              <button
                onClick={() => onSelectNav('my-tasks')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All &rarr;
              </button>
            </div>

            <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 space-y-2 shadow-xs">
              {pendingTasks.map((t) => (
                <div key={t.id} className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-neutral-300 dark:text-neutral-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {t.title}
                    </p>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      {t.subject}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section aria-labelledby="activity-heading">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <h2 id="activity-heading" className="text-sm font-bold text-neutral-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 space-y-2.5 text-xs shadow-xs">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="font-semibold text-neutral-900 dark:text-white">{act.action}</span>
                    <span className="truncate">{act.item}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-2 font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* College Channels / Announcements */}
          <section aria-labelledby="announcements-heading">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-500" />
                <h2 id="announcements-heading" className="text-sm font-bold text-neutral-900 dark:text-white">
                  Announcements
                </h2>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/60 dark:border-indigo-900/50 p-3.5 space-y-2.5">
              {classAnnouncements.map((ann) => (
                <div key={ann.id} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span>{ann.author}</span>
                    <span>{ann.date}</span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {ann.title}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
