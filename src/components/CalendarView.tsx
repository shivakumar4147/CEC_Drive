import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, AlertCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const events = [
    {
      id: 1,
      title: 'DAA Internal Assessment Test 2',
      subject: 'Design & Analysis of Algorithms',
      code: 'CS503',
      date: 'Oct 05, 2026',
      time: '10:00 AM - 11:30 AM',
      location: 'LH-302, Academic Block A',
      type: 'Exam',
      color: 'bg-rose-500',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
    },
    {
      id: 2,
      title: 'CN Packet Tracer Assignment Submission Deadline',
      subject: 'Computer Networks',
      code: 'CS502',
      date: 'Oct 08, 2026',
      time: '11:59 PM Deadline',
      location: 'CEC Drive Portal Upload',
      type: 'Assignment',
      color: 'bg-blue-500',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
    },
    {
      id: 3,
      title: 'DBMS SQL Viva & Practical Examination',
      subject: 'Database Management Systems',
      code: 'CS501',
      date: 'Oct 12, 2026',
      time: '02:00 PM - 05:00 PM',
      location: 'Advanced Computing Lab 2',
      type: 'Lab Viva',
      color: 'bg-amber-500',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
    },
    {
      id: 4,
      title: 'Web Tech React Hooks Live Workshop',
      subject: 'Web Technology & Frameworks',
      code: 'CS505',
      date: 'Oct 15, 2026',
      time: '11:00 AM - 01:00 PM',
      location: 'Seminar Hall B',
      type: 'Workshop',
      color: 'bg-purple-500',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <span>Academic Schedule • 5th Semester</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Academic Calendar & Deadlines</h1>
          <p className="text-xs text-blue-200">
            Track all upcoming internal exams, assignment deadlines, lab vivas, and departmental events.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl text-xs font-semibold">
          <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3">October 2026</span>
          <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500/80 dark:hover:border-blue-500/80 shadow-xs hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${evt.badgeBg}`}>
                {evt.type}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                {evt.date}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">{evt.title}</h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{evt.subject} ({evt.code})</span>
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 grid grid-cols-2 gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{evt.time}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{evt.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
