import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  BarChart3,
  CheckCircle,
  Sparkles,
  Trash2,
  Plus,
  Bell,
  Eye,
  Download,
  Users,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import { DocumentItem, FolderItem, LecturerAssignment, StudentProfile } from '../types';
import { fetchStudentsByScope, exportStudentListToExcel } from '../lib/academicDb';

interface LecturerPanelProps {
  documents: DocumentItem[];
  folders: FolderItem[];
  assignments?: LecturerAssignment[];
  currentLecturerName?: string;
  currentUserId?: string;
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onToggleImportant: (docId: string) => void;
}

export const LecturerPanel: React.FC<LecturerPanelProps> = ({
  documents,
  folders,
  assignments = [],
  currentLecturerName = 'Prof. Sharma',
  currentUserId,
  onAddDocument,
  onDeleteDocument,
  onToggleImportant,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'my-notes' | 'my-students' | 'analytics' | 'announcement'>('upload');

  // Filter assignments strictly for current logged-in lecturer
  const myAssignments = React.useMemo(() => {
    if (!assignments || assignments.length === 0) return [];
    if (!currentUserId) return assignments;
    const matched = assignments.filter(
      (a) => a.lecturer_id === currentUserId || a.lecturer_id === 'usr-2' || a.lecturer_id === 'user-2'
    );
    return matched.length > 0 ? matched : assignments;
  }, [assignments, currentUserId]);

  // Lecturer assigned scope state
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync selected assignment with current lecturer's assigned scopes
  useEffect(() => {
    if (myAssignments.length > 0) {
      if (!selectedAssignmentId || !myAssignments.some((a) => a.id === selectedAssignmentId)) {
        setSelectedAssignmentId(myAssignments[0].id);
      }
    } else {
      setSelectedAssignmentId('');
    }
  }, [myAssignments, selectedAssignmentId]);

  // Load students for active scope assignment
  useEffect(() => {
    if (myAssignments.length === 0) {
      setStudents([]);
      return;
    }

    const activeAssignment = myAssignments.find((a) => a.id === selectedAssignmentId) || myAssignments[0];
    const fetchStudents = async () => {
      setIsFetchingStudents(true);
      const scope = {
        department: activeAssignment.department,
        section: activeAssignment.section,
        academic_year: activeAssignment.academic_year,
        semester: activeAssignment.semester,
      };

      const fetched = await fetchStudentsByScope(scope);
      if (fetched && fetched.length > 0) {
        setStudents(fetched);
      } else {
        // Fallback mock roster dynamically scoped to the assigned department & section
        const dept = activeAssignment.department || 'CSE';
        const sec = activeAssignment.section || 'Sec A';
        const year = activeAssignment.academic_year || '2026-27';
        const sem = activeAssignment.semester || '5th Sem';

        setStudents([
          { id: 'st-1', name: 'Aditya Rao', email: 'aditya.rao@cec.edu.in', usn: '4CB22CS001', academic_year: year, department: dept, semester: sem, section: sec },
          { id: 'st-2', name: 'Bhavana K', email: 'bhavana.k@cec.edu.in', usn: '4CB22CS014', academic_year: year, department: dept, semester: sem, section: sec },
          { id: 'st-3', name: 'Chandan Hegde', email: 'chandan.h@cec.edu.in', usn: '4CB22CS028', academic_year: year, department: dept, semester: sem, section: sec },
          { id: 'st-4', name: 'Divya Nair', email: 'divya.n@cec.edu.in', usn: '4CB22CS042', academic_year: year, department: dept, semester: sem, section: sec },
          { id: 'st-5', name: 'Eshwar Prasad', email: 'eshwar.p@cec.edu.in', usn: '4CB22CS055', academic_year: year, department: dept, semester: sem, section: sec },
        ]);
      }
      setIsFetchingStudents(false);
    };

    fetchStudents();
  }, [selectedAssignmentId, myAssignments]);

  // New Upload Form State
  const [fileName, setFileName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('folder-dbms-unit1');
  const [fileType, setFileType] = useState<'pdf' | 'doc' | 'sheet' | 'presentation'>('pdf');
  const [fileSize, setFileSize] = useState('4.8 MB');
  const [fileTag, setFileTag] = useState<'important' | 'normal'>('important');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Notice form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticePosted, setNoticePosted] = useState(false);

  // Filter documents uploaded by lecturer or assigned to lecturer (excluding deleted items)
  const myUploadedDocs = documents.filter(
    (d) => !d.isDeleted && (d.author.name === currentLecturerName || d.author.name === 'Prof. Sharma')
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: fileName.trim(),
      dateAdded: 'Today',
      rawDate: new Date().toISOString().split('T')[0],
      author: {
        name: currentLecturerName,
        initial: currentLecturerName.charAt(0).toUpperCase(),
        bgColor: 'bg-purple-600',
      },
      folderId: selectedFolderId || null,
      size: fileSize,
      type: fileType,
      tag: fileTag,
      starred: false,
    };

    onAddDocument(newDoc);
    setUploadSuccess(true);
    setFileName('');

    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) return;
    setNoticePosted(true);
    setTimeout(() => {
      setNoticeTitle('');
      setNoticeBody('');
      setNoticePosted(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Lecturer Hub Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-neutral-900 to-indigo-950 text-white p-6 sm:p-8 border border-neutral-800 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Lecturer Central Upload Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentLecturerName} • Resource Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
              Upload notes, slides, problem sets, and past papers directly to student academic folders (Year → Sem → Dept → Section → Subject).
            </p>
          </div>

          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Resource</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 sm:gap-6 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'upload', label: 'Upload New Notes', icon: <UploadCloud className="w-4 h-4" /> },
          { id: 'my-notes', label: `My Uploaded Notes (${myUploadedDocs.length})`, icon: <FileText className="w-4 h-4" /> },
          { id: 'my-students', label: `My Students (${students.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'analytics', label: 'Resource Engagement & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'announcement', label: 'Section Class Notice', icon: <Bell className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: MY STUDENTS */}
      {activeTab === 'my-students' && (
        <div className="space-y-6">
          {/* Header & Filter Toolbar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Authorized Academic Scope & Student Roster</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  View and manage student lists for your assigned academic scopes. Filter by scope or search by USN, Name, or Email.
                </p>
              </div>

              {/* Excel Export Button */}
              <button
                disabled={myAssignments.length === 0 || students.length === 0}
                onClick={() => {
                  const activeAssignment = myAssignments.find((a) => a.id === selectedAssignmentId) || myAssignments[0];
                  const scopeInfo = {
                    department: activeAssignment?.department || 'CSE',
                    section: activeAssignment?.section || 'Sec A',
                    course: activeAssignment?.course || 'Subject',
                    semester: activeAssignment?.semester || '5th Sem',
                    academic_year: activeAssignment?.academic_year || '2026-27',
                  };
                  const filtered = students.filter(
                    (s) =>
                      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.email.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  exportStudentListToExcel(filtered, scopeInfo);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md shrink-0 ${
                  myAssignments.length === 0 || students.length === 0
                    ? 'bg-neutral-400 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Student List (.xlsx)</span>
              </button>
            </div>

            {myAssignments.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>No Admin-Approved Scope Assigned</span>
                </p>
                <p>
                  You do not currently have any admin-approved class section assignments. Please contact your institution administrator to be assigned a Department, Section, and Course.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-neutral-500 mb-1">
                    Assigned Academic Scope
                  </label>
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold"
                  >
                    {myAssignments.map((asgn) => (
                      <option key={asgn.id} value={asgn.id}>
                        {asgn.department} • {asgn.section} ({asgn.course} - {asgn.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-500 mb-1">
                    Search Student Roster
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by USN (e.g. 4CB22CS001), Student Name, or Email..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Student Roster ({students.filter((s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} Enrolled)
              </h3>
              {isFetchingStudents && (
                <span className="text-xs text-blue-500 font-semibold">Updating Roster...</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
                    <th className="px-6 py-3 font-bold uppercase">Sl. No.</th>
                    <th className="px-6 py-3 font-bold uppercase">USN</th>
                    <th className="px-6 py-3 font-bold uppercase">Student Name</th>
                    <th className="px-6 py-3 font-bold uppercase">Email Address</th>
                    <th className="px-6 py-3 font-bold uppercase">Department & Sec</th>
                    <th className="px-6 py-3 font-bold uppercase">Semester & Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {students
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((std, index) => (
                      <tr key={std.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-neutral-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {std.usn}
                        </td>
                        <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                          {std.name}
                        </td>
                        <td className="px-6 py-4 text-neutral-500">
                          {std.email}
                        </td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-medium">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold mr-1.5">
                            {std.department}
                          </span>
                          <span>{std.section}</span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">
                          {std.semester} • {std.academic_year}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: UPLOAD NEW NOTES */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-500" />
              <span>Central Resource Uploader</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-500 mb-1">
                  Resource / File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. DBMS Unit 3 SQL Joins & Subqueries PPT"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-500 mb-1">
                  Destination Directory Folder (Year → Sem → Dept → Section → Subject)
                </label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.fileCount} files)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-500 mb-1">File Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="presentation">PPT Presentation</option>
                    <option value="doc">DOC Word Document</option>
                    <option value="sheet">XLSX Excel Sheet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-500 mb-1">Tag Priority</label>
                  <select
                    value={fileTag}
                    onChange={(e) => setFileTag(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="important">Important (High Priority)</option>
                    <option value="normal">Normal Resource</option>
                  </select>
                </div>
              </div>

              {/* Drag & Drop simulated box */}
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
                <UploadCloud className="w-8 h-8 text-blue-500 mx-auto" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Drag and drop document files here
                </p>
                <p className="text-[11px] text-neutral-400">
                  Supports PDF, PPT, DOCX, XLSX up to 50MB per file
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Publish to CEC Drive</span>
              </button>

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-xs animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Resource uploaded successfully to target folder!</span>
                </div>
              )}
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Target Section Guidelines
            </h3>
            <div className="space-y-3 text-xs text-neutral-500">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                <p className="font-bold text-neutral-800 dark:text-neutral-200">1. Section Specific Notes</p>
                <p>Always upload lecture slides to the designated Section folder (e.g. CSE → Section A → DBMS).</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                <p className="font-bold text-neutral-800 dark:text-neutral-200">2. Instant Student Access</p>
                <p>Students in your assigned section receive instant notification when a new PDF or PPT is published.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY UPLOADED NOTES */}
      {activeTab === 'my-notes' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              My Published Notes & Files ({myUploadedDocs.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
                  <th className="px-6 py-3 font-bold uppercase">Resource Title</th>
                  <th className="px-6 py-3 font-bold uppercase">Target Folder</th>
                  <th className="px-6 py-3 font-bold uppercase">Size</th>
                  <th className="px-6 py-3 font-bold uppercase">Tag</th>
                  <th className="px-6 py-3 font-bold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {myUploadedDocs.map((doc) => {
                  const targetFolder = folders.find((f) => f.id === doc.folderId);
                  return (
                    <tr key={doc.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                        {doc.name}
                      </td>
                      <td className="px-6 py-4 text-neutral-500 font-medium">
                        {targetFolder ? targetFolder.name : 'Root Folder'}
                      </td>
                      <td className="px-6 py-4 text-neutral-500 font-mono">{doc.size}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onToggleImportant(doc.id)}
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            doc.tag === 'important'
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          {doc.tag || 'normal'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Student Views</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">412 Views</p>
            <span className="text-[11px] text-neutral-400">+18% this week</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Resource Downloads</span>
              <Download className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">189 Downloads</p>
            <span className="text-[11px] text-neutral-400">High engagement on DBMS notes</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Section Reach</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">96.4%</p>
            <span className="text-[11px] text-neutral-400">Section A & B active</span>
          </div>
        </div>
      )}

      {/* TAB 4: SECTION ANNOUNCEMENT */}
      {activeTab === 'announcement' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 max-w-2xl">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" />
            <span>Post Course Announcement to Section</span>
          </h3>

          <form onSubmit={handleNoticeSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-500 mb-1">Subject / Course Notice Title</label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="e.g. CN Unit 3 PPT Slides and Assignment 2 Published"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-500 mb-1">Details</label>
              <textarea
                value={noticeBody}
                onChange={(e) => setNoticeBody(e.target.value)}
                rows={4}
                placeholder="All Section A students: Please review Unit 3 slides before Thursday's lecture."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
            >
              <Bell className="w-4 h-4" />
              <span>Post to Student Inbox</span>
            </button>

            {noticePosted && (
              <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Notice posted to Section A Inbox!
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
