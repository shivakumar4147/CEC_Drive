import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  Check,
  Trash2,
  Tag,
  BookOpen,
  Sparkles,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatusType = 'pending' | 'in_progress' | 'completed';

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  subjectCode: string;
  subjectName: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatusType;
  subtasks?: { id: string; text: string; completed: boolean }[];
}

const INITIAL_TASKS: PersonalTask[] = [
  {
    id: 'task-1',
    title: 'Submit DBMS ER-Diagram Assignment 2',
    description: 'Draw conceptual ER schema with entity sets, attributes, primary keys, and cardinalities.',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    dueDate: 'Today, 5:00 PM',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'task-2',
    title: 'Complete CN Wireshark Packet Capture Lab 4 Record',
    description: 'Analyze TCP 3-way handshake packets and document sequence/ack numbers.',
    subjectCode: 'CS502',
    subjectName: 'Computer Networks',
    dueDate: 'Tomorrow',
    priority: 'high',
    status: 'in_progress',
  },
  {
    id: 'task-3',
    title: 'Revise Master Theorem & Divide and Conquer for DAA Exam 2',
    description: 'Solve past 3 years GATE questions on recurrence relations.',
    subjectCode: 'CS503',
    subjectName: 'Design & Analysis of Algorithms',
    dueDate: 'Oct 5, 2026',
    priority: 'medium',
    status: 'pending',
  },
];

interface MyTasksProps {
  onSelectNav?: (key: any) => void;
}

export const MyTasks: React.FC<MyTasksProps> = () => {
  const [tasks, setTasks] = useState<PersonalTask[]>(INITIAL_TASKS);
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatusType>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Inline Add State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('CS501');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  // Fetch tasks from Supabase
  useEffect(() => {
    async function loadTasks() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const dbTasks: PersonalTask[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            subjectCode: t.category || 'CS501',
            subjectName: t.category || 'Academic Task',
            dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : 'Upcoming',
            priority: (t.priority?.toLowerCase() as TaskPriority) || 'medium',
            status: (t.status as TaskStatusType) || 'pending',
          }));
          setTasks(dbTasks);
        }
      } catch (err) {
        console.warn('Live tasks loading notice:', err);
      }
    }
    loadTasks();
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (selectedSubject !== 'all' && t.subjectCode !== selectedSubject) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.subjectName.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handlers with DB Sync
  const handleToggleTaskStatus = async (id: string) => {
    let nextStatus: TaskStatusType = 'completed';

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );

    try {
      await supabase.from('tasks').update({ status: nextStatus }).eq('id', id);
    } catch (err) {
      console.warn('Task status update warning:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await supabase.from('tasks').delete().eq('id', id);
    } catch (err) {
      console.warn('Task deletion warning:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subjectMap: Record<string, string> = {
      CS501: 'Database Management Systems',
      CS502: 'Computer Networks',
      CS503: 'Design & Analysis of Algorithms',
      CS504: 'Software Engineering',
      CS505: 'Web Technology',
    };

    const tempId = `task-${Date.now()}`;
    const newTask: PersonalTask = {
      id: tempId,
      title: newTitle.trim(),
      subjectCode: newSubject,
      subjectName: subjectMap[newSubject] || 'Academic Task',
      dueDate: 'Today',
      priority: newPriority,
      status: 'pending',
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('tasks').insert({
          user_id: user.id,
          title: newTask.title,
          category: newSubject,
          priority: newPriority,
          status: 'pending',
        });
      }
    } catch (err) {
      console.warn('Task creation warning:', err);
    }
  };

  // Stats calculation
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Task Manager</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Academic Tasks & Assignments</h1>
          <p className="text-xs text-emerald-200">
            Keep track of assignment submissions, lab records, and exam revision topics.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold">
          <div className="text-center">
            <span className="block text-lg font-black text-amber-300 leading-none">{pendingCount}</span>
            <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Pending</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="text-center">
            <span className="block text-lg font-black text-cyan-300 leading-none">{inProgressCount}</span>
            <span className="text-[10px] text-emerald-200 uppercase tracking-wider">In Progress</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="text-center">
            <span className="block text-lg font-black text-emerald-300 leading-none">{completedCount}</span>
            <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Done</span>
          </div>
        </div>
      </div>

      {/* Quick Task Creation Form */}
      <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Plus className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Add new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
        </div>

        <select
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none dark:text-white font-medium"
        >
          <option value="CS501">CS501 DBMS</option>
          <option value="CS502">CS502 CN</option>
          <option value="CS503">CS503 DAA</option>
          <option value="CS504">CS504 SE</option>
          <option value="CS505">CS505 Web Tech</option>
        </select>

        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
          className="w-full sm:w-auto px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none dark:text-white font-medium"
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </form>

      {/* Task Item List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-500">No tasks found matching your filter.</p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl bg-white dark:bg-neutral-900 border transition-all flex items-start justify-between gap-3 ${
                t.status === 'completed'
                  ? 'border-neutral-200 dark:border-neutral-800 opacity-65'
                  : 'border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleTaskStatus(t.id)}
                  className="mt-0.5 text-neutral-400 hover:text-emerald-500 focus:outline-none cursor-pointer"
                >
                  {t.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1">
                  <h3
                    className={`text-sm font-bold text-neutral-900 dark:text-white ${
                      t.status === 'completed' ? 'line-through text-neutral-500 dark:text-neutral-500' : ''
                    }`}
                  >
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1 text-[10px] font-medium text-neutral-400">
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-mono text-neutral-600 dark:text-neutral-300">
                      {t.subjectCode}
                    </span>
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteTask(t.id)}
                className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                aria-label="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
