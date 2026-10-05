import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Download,
  Share2,
  Clock,
  ArrowRight,
  Folder,
  Sparkles,
  User,
  GraduationCap,
  Activity,
  UploadCloud,
  Trash2,
  Edit,
  MoveRight,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { fetchRecentActivities, ActivityLogEntry } from '../lib/activity';

interface DashboardProps {
  onSelectNav: (key: any) => void;
  onDownloadDoc?: (doc: DocumentItem) => void;
  documents?: DocumentItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectNav }) => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      setLoadingActivities(true);
      const logData = await fetchRecentActivities(10);
      setActivities(logData);
      setLoadingActivities(false);
    }
    loadActivities();
  }, []);

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const subjects = [
    {
      id: 'dbms',
      code: 'CS501',
      name: 'Database Management Systems',
      short: 'DBMS',
      lecturer: 'Dr. Ramesh Kumar',
      fileCount: 24,
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'cn',
      code: 'CS502',
      name: 'Computer Networks',
      short: 'CN',
      lecturer: 'Prof. Anitha Rao',
      fileCount: 18,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'daa',
      code: 'CS503',
      name: 'Design & Analysis of Algorithms',
      short: 'DAA',
      lecturer: 'Prof. Suresh Hegde',
      fileCount: 31,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'se',
      code: 'CS504',
      name: 'Software Engineering',
      short: 'SE',
      lecturer: 'Prof. Meera Nair',
      fileCount: 15,
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'webtech',
      code: 'CS505',
      name: 'Web Technology & Frameworks',
      short: 'Web Tech',
      lecturer: 'Dr. Vinayaka B',
      fileCount: 29,
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
  ];

  const renderActionIcon = (action: string) => {
    switch (action) {
      case 'UPLOAD':
        return <UploadCloud className="w-4 h-4 text-emerald-500" />;
      case 'DOWNLOAD':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'MOVE':
        return <MoveRight className="w-4 h-4 text-purple-500" />;
      case 'RENAME':
        return <Edit className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-72 h-72" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>CEC Drive • Student Dashboard</span>
              <span>•</span>
              <span>{dateFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, Student 👋
            </h1>
            <p className="text-sm text-blue-100 font-medium flex items-center gap-2 flex-wrap">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Folder className="w-4 h-4" />
              <span>Browse All Folders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Row */}
      <section aria-label="Quick Access Shortcuts">
        <h2 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onSelectNav('documents')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500/80 hover:shadow-md transition-all text-left group cursor-pointer"
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
            onClick={() => onSelectNav('recent-files')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Recent Files
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Updated materials
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectNav('pinned-folders')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500/80 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 transition-colors">
                Pinned Items
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Starred notes & files
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectNav('announcements')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500/80 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Announcements
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                Lecturer notices
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Real-time Activity Feed Section */}
      <section aria-labelledby="activity-heading">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 id="activity-heading" className="text-base font-bold text-neutral-900 dark:text-white">
              Recent System Activity
            </h2>
          </div>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            Live Supabase Logs
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          {loadingActivities ? (
            <div className="py-6 text-center text-xs text-neutral-400 font-mono">
              Loading recent activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400">
              No activity logs recorded yet. Upload or download files to generate logs.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {activities.map((item, idx) => (
                <div key={item.id || idx} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 shrink-0">
                      {renderActionIcon(item.action)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">
                        <span className="text-blue-600 dark:text-blue-400">{item.metadata?.userName || 'User'}</span>{' '}
                        <span className="font-normal text-neutral-600 dark:text-neutral-300">
                          {item.action.toLowerCase()}ed
                        </span>{' '}
                        <span className="font-semibold">{item.metadata?.fileName || item.metadata?.folderName || 'an item'}</span>
                      </p>
                      {item.metadata?.details && (
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                          {item.metadata.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-mono shrink-0">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all folders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj) => (
            <div
              key={subj.id}
              onClick={() => onSelectNav('documents')}
              className="group relative p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500/80 dark:hover:border-blue-500/80 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${subj.badgeBg}`}>
                    {subj.code}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    {subj.fileCount} files
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {subj.name}
                </h3>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-neutral-400" />
                  <span>{subj.lecturer}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                <span>Notes • Slides • Question Banks</span>
                <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-semibold">
                  Open &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
