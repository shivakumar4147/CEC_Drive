import React, { useState } from 'react';
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
    subtasks: [
      { id: 'sub-1', text: 'Draw ER diagram entity sets', completed: true },
      { id: 'sub-2', text: 'Define cardinality ratios & participation', completed: false },
      { id: 'sub-3', text: 'Convert diagram to relational SQL table schema', completed: false },
    ],
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
    subtasks: [
      { id: 'sub-4', text: 'Capture SYN and SYN-ACK packets in Wireshark', completed: true },
      { id: 'sub-5', text: 'Write observations in lab record book', completed: false },
    ],
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
    subtasks: [
      { id: 'sub-6', text: 'Review Master Theorem Cases 1, 2, 3', completed: true },
      { id: 'sub-7', text: 'Solve 10 algorithm complexity problems', completed: false },
    ],
  },
  {
    id: 'task-4',
    title: 'Draft Software Engineering SRS Document Section 3',
    description: 'Specify functional & non-functional requirements according to IEEE 830 standard.',
    subjectCode: 'CS504',
    subjectName: 'Software Engineering',
    dueDate: 'Oct 8, 2026',
    priority: 'medium',
    status: 'in_progress',
  },
  {
    id: 'task-5',
    title: 'Review React State Management & Custom Hooks',
    description: 'Practice building custom custom custom hooks for async API fetching.',
    subjectCode: 'CS505',
    subjectName: 'Web Technology',
    dueDate: 'Oct 10, 2026',
    priority: 'low',
    status: 'completed',
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

  // Handlers
  const handleToggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatusType =
            t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          // Auto check parent task status if all subtasks complete
          const allDone = updatedSubtasks.every((s) => s.completed);
          return {
            ...t,
            subtasks: updatedSubtasks,
            status: allDone ? 'completed' : t.status,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subjectMap: Record<string, string> = {
      CS501: 'Database Management Systems',
      CS502: 'Computer Networks',
      CS503: 'Design & Analysis of Algorithms',
      CS504: 'Software Engineering',
      CS505: 'Web Technology',
    };

    const newTask: PersonalTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subjectCode: newSubject,
      subjectName: subjectMap[newSubject] || 'Academic Task',
      dueDate: 'Today',
      priority: newPriority,
      status: 'pending',
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
  };

  // Stats calculation
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Banner & Personal Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900/90 dark:border dark:border-neutral-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Personal Task Hub
            </span>
            <span className="text-xs font-mono text-neutral-400">5th Semester</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            My Tasks Checklist
          </h1>
          <p className="text-xs text-neutral-400">
            Track your personal assignments, lab records, and exam preparation goals
          </p>
        </div>

        {/* Progress Pill Bar */}
        <div className="flex items-center gap-6 bg-neutral-800/80 px-5 py-3 rounded-2xl border border-neutral-700/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              Completed
            </span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {completedCount} <span className="text-xs text-neutral-400">/ {tasks.length}</span>
            </span>
          </div>
          <div className="w-px h-8 bg-neutral-700" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              Progress Rate
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-bold text-blue-400">
                {progressPercent}%
              </span>
              <div className="w-16 h-2 rounded-full bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Inline Task Bar */}
      <form
        onSubmit={handleAddTask}
        className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#0a0a0a] shadow-xs flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="flex-1 flex items-center gap-2.5 w-full">
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new personal academic task (e.g. Write CN Lab 5 Record)..."
            className="w-full text-xs bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="CS501">DBMS (CS501)</option>
            <option value="CS502">CN (CS502)</option>
            <option value="CS503">DAA (CS503)</option>
            <option value="CS504">SE (CS504)</option>
            <option value="CS505">Web (CS505)</option>
          </select>

          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="high">🔥 High</option>
            <option value="medium">⚡ Medium</option>
            <option value="low">🌱 Low</option>
          </select>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-all shrink-0"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Filters Bar: Status Tabs, Search, Subject & Priority Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'pending'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'in_progress'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'completed'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search & Subject Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            <option value="CS501">DBMS (CS501)</option>
            <option value="CS502">CN (CS502)</option>
            <option value="CS503">DAA (CS503)</option>
            <option value="CS504">SE (CS504)</option>
            <option value="CS505">Web Tech (CS505)</option>
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed';

          return (
            <div
              key={task.id}
              className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-neutral-50/60 dark:bg-neutral-950/40 border-neutral-200/60 dark:border-neutral-900 opacity-75'
                  : 'bg-white dark:bg-[#0a0a0a] border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-500 bg-transparent'
                    }`}
                    aria-label={`Mark task "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {task.subjectCode}
                      </span>

                      {/* Priority Tag */}
                      {task.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          🔥 High Priority
                        </span>
                      )}
                      {task.priority === 'medium' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                          ⚡ Medium Priority
                        </span>
                      )}
                      {task.priority === 'low' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          🌱 Low Priority
                        </span>
                      )}

                      {/* Status Tag */}
                      {task.status === 'in_progress' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                          In Progress
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold text-neutral-900 dark:text-white leading-snug transition-all ${
                        isDone ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Subtasks checklist inside card */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-900 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                          <span>Subtasks Breakdown</span>
                          <span>
                            {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length} Completed
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {task.subtasks.map((sub) => (
                            <div
                              key={sub.id}
                              onClick={() => handleToggleSubtask(task.id, sub.id)}
                              className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                  sub.completed
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-neutral-300 dark:border-neutral-700'
                                }`}
                              >
                                {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className={sub.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                                {sub.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Metadata & Delete Action */}
                <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{task.dueDate}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Delete task ${task.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No personal tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};
