import React, { useState, useEffect } from 'react';
import { Megaphone, Bell, Calendar, User, Tag, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface AnnouncementItem {
  id: string | number;
  title: string;
  category: string;
  author: string;
  date: string;
  content: string;
  urgent: boolean;
  badgeBg: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 1,
    title: 'Department Technical Symposium "TECHNOVA 2026" Registrations Open',
    category: 'Department Event',
    author: 'CSE HOD Office',
    date: 'Sep 29, 2026',
    content:
      'All 3rd and 4th year CSE students are invited to submit project abstracts for TECHNOVA 2026. Categories include AI/ML, Cloud Systems, and Web Technologies. Cash prizes worth ₹50,000 to be won!',
    urgent: true,
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
  },
  {
    id: 2,
    title: 'Special Guest Lecture on Cloud Architecture & Kubernetes',
    category: 'Guest Seminar',
    author: 'Placement & Training Cell',
    date: 'Sep 28, 2026',
    content:
      'Industry expert Mr. Ananth Pai from AWS Bangalore will be conducting a hands-on technical session on Kubernetes cluster orchestration this Friday at Seminar Hall 1.',
    urgent: false,
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
  },
  {
    id: 3,
    title: 'Internal Assessment Test 2 Schedule Released',
    category: 'Exam Notice',
    author: 'Academic Office',
    date: 'Sep 25, 2026',
    content:
      'The detailed timetable for 5th Semester IA-2 examinations has been published. Exams commence from October 5th. Hall tickets can be collected from class advisors.',
    urgent: true,
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
  },
];

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const fetched: AnnouncementItem[] = data.map((ann: any) => ({
            id: ann.id,
            title: ann.title,
            category: ann.category || 'General Notice',
            author: ann.created_by || 'CEC Administration',
            date: ann.created_at ? new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
            content: ann.content || '',
            urgent: Boolean(ann.urgent || ann.is_urgent),
            badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900',
          }));
          setAnnouncements(fetched);
        }
      } catch (err) {
        console.warn('Announcements live fetch notice:', err);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-lg space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-200">
          <Megaphone className="w-4 h-4 text-purple-200" />
          <span>Notice Board</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Department Announcements</h1>
        <p className="text-xs text-purple-100">
          Official circulars, exam schedules, workshop invitations, and placement notices from CEC.
        </p>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-purple-500/80 dark:hover:border-purple-500/80 shadow-xs hover:shadow-md transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${ann.badgeBg}`}>
                  {ann.category}
                </span>
                {ann.urgent && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                    <Sparkles className="w-3 h-3" /> Urgent
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {ann.date}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">{ann.title}</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                {ann.content}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-purple-500" /> Posted by {ann.author}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
