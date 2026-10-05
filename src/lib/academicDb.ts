import { supabase } from './supabase';
import { LecturerAssignment, StudentProfile, FolderItem } from '../types';
import * as XLSX from 'xlsx';

export interface FolderAcademicContext {
  academic_year?: string;
  semester?: string;
  department?: string;
  section?: string;
  pathDisplay: string;
  isSectionFolder: boolean;
}

/**
 * Fetch lecturer assignments from Supabase.
 * If lecturerId is provided, filters for that lecturer only.
 */
export async function fetchLecturerAssignments(lecturerId?: string): Promise<LecturerAssignment[]> {
  try {
    let query = supabase
      .from('lecturer_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (lecturerId) {
      query = query.eq('lecturer_id', lecturerId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching lecturer assignments:', error.message);
      return [];
    }
    return (data || []) as LecturerAssignment[];
  } catch (err) {
    console.error('Failed to fetch lecturer assignments:', err);
    return [];
  }
}

/**
 * Create a new lecturer assignment (Admin only).
 */
export async function createLecturerAssignment(
  assignment: Omit<LecturerAssignment, 'id' | 'created_at'>
): Promise<LecturerAssignment | null> {
  try {
    const payload = {
      ...assignment,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('lecturer_assignments')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating lecturer assignment:', error.message);
      return null;
    }
    return data as LecturerAssignment;
  } catch (err) {
    console.error('Failed to create lecturer assignment:', err);
    return null;
  }
}

/**
 * Delete a lecturer assignment (Admin only).
 */
export async function deleteLecturerAssignment(assignmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('lecturer_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error deleting lecturer assignment:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete lecturer assignment:', err);
    return false;
  }
}

/**
 * Traverses parent_id pointers from the current folder up to Root
 * to resolve the complete academic hierarchy (Year, Sem, Dept, Section).
 */
export function resolveFolderAcademicContext(
  currentFolderId: string | null,
  folders: FolderItem[]
): FolderAcademicContext {
  if (!currentFolderId) {
    return { pathDisplay: 'Root Directory', isSectionFolder: false };
  }

  // 1. Build path chain from root -> current folder
  const pathFolders: FolderItem[] = [];
  let curr: FolderItem | undefined = folders.find((f) => f.id === currentFolderId);

  while (curr) {
    pathFolders.unshift(curr);
    if (!curr.parentId) break;
    curr = folders.find((f) => f.id === curr!.parentId);
  }

  const pathDisplay = pathFolders.map((f) => f.name).join(' / ');

  let academic_year: string | undefined;
  let semester: string | undefined;
  let department: string | undefined;
  let section: string | undefined;

  const knownDepts = ['CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'AI&DS', 'AIDS', 'CIVIL', 'AUTOMOBILE', 'ROBOTICS'];

  // Analyze each segment in path
  for (const f of pathFolders) {
    const name = f.name.trim();

    // Check Academic Year (e.g. 2025-2026, 2024-2025, 2025-26, 2026-2027)
    if (/^\d{4}-\d{2,4}$/.test(name) || /^20\d{2}/.test(name)) {
      academic_year = name;
      continue;
    }

    // Check Semester (e.g. 1st Sem, 2nd Sem, 3rd Sem, 4th Sem, 5th Sem, 6th Sem, 7th Sem, 8th Sem, 5th, Sem 5)
    if (/^\d+(st|nd|rd|th)?\s*Sem(ester)?$/i.test(name) || /^Sem(ester)?\s*\d+$/i.test(name)) {
      semester = name;
      continue;
    }

    // Check Department (e.g. CSE, ECE, ISE, EEE, MECH, AI&DS)
    const upperName = name.toUpperCase();
    const deptMatch = knownDepts.find((d) => upperName === d || upperName.includes(d));
    if (deptMatch) {
      department = deptMatch;
      continue;
    }

    // Check Section (e.g. Section A, Sec A, Section B, Section C, A, B, C)
    if (/^(Section|Sec)?\s*[A-Z]$/i.test(name)) {
      const secLetter = name.replace(/^(Section|Sec)?\s*/i, '').trim().toUpperCase();
      section = `Section ${secLetter}`;
      continue;
    }
  }

  return {
    academic_year,
    semester,
    department,
    section,
    pathDisplay,
    isSectionFolder: Boolean(section || (department && semester && academic_year)),
  };
}

/**
 * Check if current user is authorized to fetch student details for given academic scope context.
 */
export function checkLecturerScopeAuthorization(
  userId: string,
  userRole: string,
  scope: FolderAcademicContext,
  assignments: LecturerAssignment[]
): { authorized: boolean; reason?: string } {
  if (userRole === 'admin') {
    return { authorized: true };
  }

  if (userRole !== 'uploader') {
    return { authorized: false, reason: 'Only System Admins and authorized Lecturers can export student details.' };
  }

  if (!scope.department && !scope.section) {
    return { authorized: true };
  }

  const userAssignments = assignments.filter((a) => a.lecturer_id === userId);
  if (userAssignments.length === 0) {
    return { authorized: false, reason: 'You have no assigned academic scopes.' };
  }

  const isAssigned = userAssignments.some((a) => {
    const deptMatch = !scope.department || a.department.toLowerCase().includes(scope.department.toLowerCase()) || scope.department.toLowerCase().includes(a.department.toLowerCase());
    const secLetter = scope.section ? scope.section.replace(/^(Section|Sec)?\s*/i, '').trim().toLowerCase() : '';
    const asgnSecLetter = a.section ? a.section.replace(/^(Section|Sec)?\s*/i, '').trim().toLowerCase() : '';
    const secMatch = !scope.section || secLetter === asgnSecLetter || a.section.toLowerCase().includes(secLetter);

    return deptMatch && secMatch;
  });

  if (!isAssigned) {
    return { authorized: false, reason: `You are not authorized for academic scope: ${scope.pathDisplay}` };
  }

  return { authorized: true };
}

/**
 * Fetch active student profiles matching an assigned academic scope or folder context.
 */
export async function fetchStudentsByScope(scope: {
  department?: string;
  section?: string;
  academic_year?: string;
  semester?: string;
}): Promise<StudentProfile[]> {
  try {
    let query = supabase
      .from('profiles')
      .select('id, name, email, usn, academic_year, department, semester, section, created_at')
      .eq('role', 'student');

    if (scope.department) {
      const deptUpper = scope.department.toUpperCase();
      query = query.or(`department.ilike.%${deptUpper}%,department.ilike.%${scope.department}%`);
    }

    if (scope.section) {
      const secLetter = scope.section.replace(/^(Section|Sec)?\s*/i, '').trim().toUpperCase();
      query = query.or(`section.eq.${scope.section},section.eq.Sec ${secLetter},section.eq.${secLetter},section.ilike.%${secLetter}%`);
    }

    if (scope.academic_year) {
      const shortYear = scope.academic_year.replace(/^(\d{4})-(\d{4})$/, (_, y1, y2) => `${y1}-${y2.slice(2)}`);
      query = query.or(`academic_year.eq.${scope.academic_year},academic_year.eq.${shortYear}`);
    }

    if (scope.semester) {
      const semNum = scope.semester.match(/\d+/)?.[0];
      if (semNum) {
        query = query.or(`semester.ilike.%${scope.semester}%,semester.ilike.%${semNum}%`);
      } else {
        query = query.eq('semester', scope.semester);
      }
    }

    const { data, error } = await query.order('usn', { ascending: true });

    if (error) {
      console.warn('Error fetching students by scope:', error.message);
      return [];
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name || 'Student',
      email: s.email,
      usn: s.usn || 'N/A',
      academic_year: s.academic_year || 'N/A',
      department: s.department || 'N/A',
      semester: s.semester || 'N/A',
      section: s.section || 'N/A',
      created_at: s.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch students by scope:', err);
    return [];
  }
}

/**
 * Generate and trigger download of Excel (.xlsx) student details workbook.
 * Filename format: CEC_<Year>_<Sem>_<Dept>_<Section>_Student_Details.xlsx
 */
export function exportFolderStudentDetailsToExcel(
  students: StudentProfile[],
  context: FolderAcademicContext
): string {
  const cleanDept = (context.department || 'DEPT').replace(/\s+/g, '_');
  const cleanSec = (context.section || 'SEC').replace(/\s+/g, '_');
  const cleanSem = (context.semester || 'SEM').replace(/\s+/g, '_');
  const cleanYear = (context.academic_year || 'YEAR').replace(/\s+/g, '_');

  const filename = `CEC_${cleanYear}_${cleanSem}_${cleanDept}_${cleanSec}_Student_Details.xlsx`;

  const tableData = students.map((std, index) => ({
    'Sl. No.': index + 1,
    'USN': std.usn,
    'Student Name': std.name,
    'Email Address': std.email,
    'Academic Year': std.academic_year,
    'Semester': std.semester,
    'Department': std.department,
    'Section': std.section,
  }));

  const worksheet = XLSX.utils.json_to_sheet(tableData);

  const colWidths = [
    { wch: 8 },  // Sl. No.
    { wch: 18 }, // USN
    { wch: 28 }, // Student Name
    { wch: 30 }, // Email Address
    { wch: 16 }, // Academic Year
    { wch: 14 }, // Semester
    { wch: 14 }, // Department
    { wch: 12 }, // Section
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Details');

  XLSX.writeFile(workbook, filename);
  return filename;
}

/**
 * Generate and trigger download of Excel (.xlsx) student list for a lecturer's assigned scope.
 */
export function exportStudentListToExcel(
  students: StudentProfile[],
  scopeInfo: {
    department: string;
    section: string;
    course: string;
    semester: string;
    academic_year: string;
  }
) {
  const cleanDept = (scopeInfo.department || 'DEPT').replace(/\s+/g, '_');
  const cleanSec = (scopeInfo.section || 'SEC').replace(/\s+/g, '_');
  const cleanCourse = (scopeInfo.course || 'COURSE').replace(/\s+/g, '_');
  const cleanSem = (scopeInfo.semester || 'SEM').replace(/\s+/g, '_');
  const cleanYear = (scopeInfo.academic_year || 'YEAR').replace(/\s+/g, '_');

  const filename = `CEC_${cleanDept}_${cleanSec}_${cleanCourse}_Sem${cleanSem}_${cleanYear}_Student_List.xlsx`;

  const tableData = students.map((std, index) => ({
    'Sl. No.': index + 1,
    'USN': std.usn,
    'Student Name': std.name,
    'Email Address': std.email,
    'Department': std.department,
    'Section': std.section,
    'Academic Year': std.academic_year,
    'Semester': std.semester,
  }));

  const worksheet = XLSX.utils.json_to_sheet(tableData);

  const colWidths = [
    { wch: 8 },  // Sl. No.
    { wch: 16 }, // USN
    { wch: 26 }, // Name
    { wch: 28 }, // Email
    { wch: 14 }, // Dept
    { wch: 12 }, // Section
    { wch: 16 }, // Year
    { wch: 12 }, // Sem
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  XLSX.writeFile(workbook, filename);
}
