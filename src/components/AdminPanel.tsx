import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  HardDrive,
  FolderTree,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  Send,
  Sparkles,
} from 'lucide-react';
import { UserRole, UserProfile, FolderItem, DocumentItem } from '../types';

interface AdminPanelProps {
  users: UserProfile[];
  folders: FolderItem[];
  documents: DocumentItem[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (user: Omit<UserProfile, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  folders,
  documents,
  onUpdateUserRole,
  onAddUser,
  onDeleteUser,
  onCreateFolder,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'structure' | 'broadcast'>('overview');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('uploader');
  const [newUserDept, setNewUserDept] = useState('CSE');
  const [newUserSec, setNewUserSec] = useState('Section A');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('All Students');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // New folder state
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    onAddUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
      section: newUserSec,
      initial: newUserName.charAt(0).toUpperCase(),
      bgColor: newUserRole === 'admin' ? 'bg-purple-600' : newUserRole === 'uploader' ? 'bg-amber-600' : 'bg-blue-600',
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastTitle('');
      setBroadcastBody('');
      setBroadcastSent(false);
    }, 3000);
  };

  // Compute Total Storage MB
  const totalStorageMB = documents.reduce((sum, d) => {
    const val = parseFloat(d.size.replace(/[^0-9.]/g, '')) || 0;
    return sum + val;
  }, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Panel Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 text-white p-6 sm:p-8 border border-neutral-800 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              CEC Drive System Administration
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Centralized platform management: Oversee system storage, user role permissions, department & section folder structures, and broadcast academic notices.
            </p>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User / Lecturer</span>
          </button>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 sm:gap-6 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'System Overview', icon: <HardDrive className="w-4 h-4" /> },
          { id: 'users', label: 'User Directory & Roles', icon: <Users className="w-4 h-4" /> },
          { id: 'structure', label: 'Folder & Section Setup', icon: <FolderTree className="w-4 h-4" /> },
          { id: 'broadcast', label: 'Academic Broadcasts', icon: <Send className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">System Storage Used</span>
                <HardDrive className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {totalStorageMB.toFixed(1)} MB
              </p>
              <span className="text-[11px] text-neutral-400">Quota: Unlimited Cloud Storage</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">Total System Users</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {users.length} Users
              </p>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span>{users.filter((u) => u.role === 'student').length} Students</span> •
                <span>{users.filter((u) => u.role === 'uploader').length} Lecturers</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">Academic Folders</span>
                <FolderTree className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {folders.length} Directories
              </p>
              <span className="text-[11px] text-neutral-400">Year → Sem → Dept → Section</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">Total Uploaded Notes</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {documents.length} Files
              </p>
              <span className="text-[11px] text-neutral-400">PDFs, PPTs, XLSX & Docs</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Registered Users & Permission Delegation ({users.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
                  <th className="px-6 py-3 font-bold uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider">Role / Control Panel</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider">Department / Section</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${u.bgColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                          {u.initial}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-neutral-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="student">Student (User)</option>
                        <option value="uploader">Uploader (Lecturer)</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400 font-medium">
                      {u.department ? `${u.department} • ${u.section || 'All Sections'}` : 'System Wide'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FOLDER & SECTION SETUP */}
      {activeTab === 'structure' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-purple-500" />
              <span>Create New Academic Folder / Section</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder Name (e.g. Section D, ECE Dept)"
                className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={newFolderParentId || ''}
                onChange={(e) => setNewFolderParentId(e.target.value ? e.target.value : null)}
                className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Root Directory (Top Level)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (newFolderName.trim()) {
                    onCreateFolder(newFolderName.trim(), newFolderParentId);
                    setNewFolderName('');
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Folder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 max-w-2xl">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-500" />
            <span>Academic Announcement Broadcast</span>
          </h3>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Target Audience</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
              >
                <option value="All Students">All Students & Lecturers</option>
                <option value="CSE Section A">CSE • Section A</option>
                <option value="CSE Section B">CSE • Section B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Notice Title</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Mid-Semester Exam Time Table Released"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Notice Content</label>
              <textarea
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                rows={4}
                placeholder="Write the full announcement details here..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>

            {broadcastSent && (
              <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Notice broadcasted successfully!
              </p>
            )}
          </form>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">Add New User / Lecturer</h3>
            <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Prof. Ananya Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ananya@cec.edu.in"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-500 mb-1">Role / Access</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="uploader">Uploader (Lecturer)</option>
                  <option value="student">Student</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-500 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-500 mb-1">Section</label>
                  <input
                    type="text"
                    value={newUserSec}
                    onChange={(e) => setNewUserSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
