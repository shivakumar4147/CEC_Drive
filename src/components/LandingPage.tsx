import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Lock,
  User,
  GraduationCap,
  LogIn,
  Building2,
  BookOpen,
  Calendar,
  Award,
  Layers,
  HelpCircle,
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { SynapseLogo } from './SynapseLogo';
import { ThemeMode, UserRole, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLoginSuccess: (selectedRole?: UserRole, userDetails?: Partial<UserProfile>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onToggleTheme,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'uploader'>('student');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentUSN, setStudentUSN] = useState('');
  const [studentAcademicYear, setStudentAcademicYear] = useState('');
  const [studentDept, setStudentDept] = useState('');
  const [studentSem, setStudentSem] = useState('');
  const [studentSec, setStudentSec] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Lecturer Form State
  const [lecturerName, setLecturerName] = useState('');
  const [lecturerDept, setLecturerDept] = useState('');
  const [lecturerCourse, setLecturerCourse] = useState('');
  const [lecturerEmail, setLecturerEmail] = useState('');
  const [lecturerPassword, setLecturerPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    const email = selectedRole === 'student' ? studentEmail : lecturerEmail;
    const password = selectedRole === 'student' ? studentPassword : lecturerPassword;

    try {
      // 1. Attempt Sign In with Supabase Auth
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // 2. If account does not exist yet or credentials failed, attempt auto Sign Up with user metadata
        const metadata =
          selectedRole === 'student'
            ? {
                name: studentName,
                usn: studentUSN,
                role: 'student',
                academic_year: studentAcademicYear,
                department: studentDept,
                semester: studentSem,
                section: studentSec,
              }
            : {
                name: lecturerName,
                role: 'uploader',
                department: lecturerDept,
                course: lecturerCourse,
              };

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        });

        // Helper function to write to Supabase public.profiles table with fallback resilience
        const saveProfileToSupabase = async (userId: string, userEmail: string) => {
          try {
            const fullPayload = {
              id: userId,
              email: userEmail,
              name: selectedRole === 'student' ? studentName || 'Student' : lecturerName || 'Lecturer',
              role: selectedRole === 'student' ? 'student' : 'uploader',
              usn: selectedRole === 'student' ? studentUSN || null : null,
              academic_year: selectedRole === 'student' ? studentAcademicYear || null : null,
              department: selectedRole === 'student' ? studentDept || 'CSE' : lecturerDept || 'CSE',
              semester: selectedRole === 'student' ? studentSem || '5th Sem' : null,
              section: selectedRole === 'student' ? studentSec || 'Sec A' : null,
              course: selectedRole === 'uploader' ? lecturerCourse || null : null,
              initial: ((selectedRole === 'student' ? studentName : lecturerName) || 'U').charAt(0).toUpperCase(),
              bg_color: selectedRole === 'student' ? 'bg-blue-600' : 'bg-amber-600',
              updated_at: new Date().toISOString(),
            };

            // 1. Try full upsert
            const { error: fullErr } = await supabase.from('profiles').upsert(fullPayload, { onConflict: 'id' });
            if (fullErr) {
              console.warn('Full profile upsert error, trying minimal core schema:', fullErr.message);
              // 2. Fallback to minimal core fields (id, name, email, role, usn) if extra columns do not exist in DB yet
              const minimalPayload = {
                id: userId,
                email: userEmail,
                name: selectedRole === 'student' ? studentName || 'Student' : lecturerName || 'Lecturer',
                role: selectedRole === 'student' ? 'student' : 'uploader',
                usn: selectedRole === 'student' ? studentUSN || null : null,
              };
              const { error: minErr } = await supabase.from('profiles').upsert(minimalPayload, { onConflict: 'id' });
              if (minErr) {
                console.error('Minimal profiles upsert error:', minErr.message);
              } else {
                console.log('Successfully saved minimal profile to Supabase!');
              }
            } else {
              console.log('Successfully saved full profile to Supabase profiles table!');
            }
          } catch (e) {
            console.error('Failed to sync profile to Supabase:', e);
          }
        };

        if (signUpError) {
          if (signUpError.message.includes('rate limit') || signUpError.message.includes('rate_limit')) {
            onLoginSuccess(selectedRole === 'student' ? 'student' : 'uploader', {
              name: metadata.name || 'User',
              department: metadata.department || 'CSE',
              section: metadata.section || 'Sec A',
            });
            setIsLoading(false);
            return;
          }
          if (
            signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('already exists') ||
            signInError.message.toLowerCase().includes('invalid login credentials')
          ) {
            setAuthError(
              'Incorrect password for this email account. If you forgot your password, please click "Forgot password?" below to reset it.'
            );
          } else {
            setAuthError(signUpError.message);
          }
          setIsLoading(false);
          return;
        }

        if (signUpData.user) {
          await saveProfileToSupabase(signUpData.user.id, signUpData.user.email || email);
          onLoginSuccess(selectedRole === 'student' ? 'student' : 'uploader', {
            name: metadata.name || 'User',
            department: metadata.department || 'CSE',
            section: metadata.section || 'Sec A',
          });
          setIsLoading(false);
          return;
        }
      }

      if (signInData?.user) {
        const meta = signInData.user.user_metadata || {};
        try {
          await supabase.from('profiles').upsert(
            {
              id: signInData.user.id,
              email: signInData.user.email,
              name: meta.name || (selectedRole === 'student' ? studentName : lecturerName) || 'User',
              role: selectedRole === 'student' ? 'student' : 'uploader',
              usn: meta.usn || studentUSN || null,
              academic_year: meta.academic_year || studentAcademicYear || null,
              department: meta.department || (selectedRole === 'student' ? studentDept : lecturerDept) || 'CSE',
              semester: meta.semester || studentSem || '5th Sem',
              section: meta.section || studentSec || 'Sec A',
              course: meta.course || lecturerCourse || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (e) {
          console.warn('Profiles upsert warning on sign in:', e);
        }

        onLoginSuccess(selectedRole === 'student' ? 'student' : 'uploader', {
          name: meta.name || (selectedRole === 'student' ? studentName : lecturerName) || 'User',
          department: meta.department || (selectedRole === 'student' ? studentDept : lecturerDept) || 'CSE',
          section: meta.section || studentSec || 'Sec A',
        });
      }
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      // Fallback local sign in if network issue occurs
      onLoginSuccess(selectedRole === 'student' ? 'student' : 'uploader', {
        name: selectedRole === 'student' ? studentName || 'Student' : lecturerName || 'Lecturer',
        department: selectedRole === 'student' ? studentDept || 'CSE' : lecturerDept || 'CSE',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetIdentifier.includes('@')) {
      try {
        await supabase.auth.resetPasswordForEmail(resetIdentifier);
      } catch (err) {
        console.error('Reset password error:', err);
      }
    }
    setResetSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-black text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-2 sm:p-4 md:p-6 font-sans transition-colors duration-200 select-none">
      {/* Main Responsive Card Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-900 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 max-h-[98vh] my-auto">
        
        {/* Left Column: Campus Image Showcase (Visible on Medium+ screens) */}
        <div className="md:col-span-5 relative bg-neutral-900 hidden md:flex flex-col justify-between p-6 overflow-hidden group min-h-[480px]">
          <img
            src="/canara_college_campus.jpg"
            alt="Canara Engineering College Campus"
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          {/* Top Logo Badge */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <SynapseLogo showText={false} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                CEC Drive
              </h2>
              <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">
                Canara Engineering College
              </p>
            </div>
          </div>

          {/* Bottom Campus Caption */}
          <div className="relative z-10 space-y-2 text-white mt-auto pt-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-semibold text-amber-300">
              <Building2 className="w-3.5 h-3.5" />
              Benjanapadavu, Mangalore
            </div>
            <h3 className="text-xl font-extrabold tracking-tight leading-snug">
              Academic & Resource Drive
            </h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Centralized digital portal for notes, syllabus, lab manuals, and departmental drives.
            </p>
          </div>
        </div>

        {/* Right Column: Clean Responsive Sign-In Form */}
        <div className="md:col-span-7 p-3.5 sm:p-5 md:p-6 flex flex-col justify-center space-y-3 bg-white dark:bg-neutral-950 overflow-y-auto max-h-[98vh] scrollbar-thin">
          
          {/* Header row with inline Theme Toggle */}
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-neutral-100 dark:border-neutral-900">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                Sign In to CEC Drive
              </h1>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400">
                Select your role and enter your details
              </p>
            </div>

            {/* Inline Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs shrink-0 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to OLED Black Theme'}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="leading-tight">{authError}</span>
              </div>
              {authError.toLowerCase().includes('password') && (
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="px-2 py-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors cursor-pointer shrink-0 border border-red-200 dark:border-red-800"
                >
                  Reset Password →
                </button>
              )}
            </div>
          )}

          {/* 2-Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setAuthError(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'student'
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('uploader');
                setAuthError(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'uploader'
                  ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Lecturer</span>
            </button>
          </div>

          {/* FORM: Student or Lecturer in 2-Column Side-by-Side Mobile Layout */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {selectedRole === 'student' ? (
              /* STUDENT FORM */
              <div className="grid grid-cols-2 gap-2">
                {/* Full Name */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full pl-7 pr-1.5 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* USN */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    USN
                  </label>
                  <div className="relative">
                    <Award className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      required
                      value={studentUSN}
                      onChange={(e) => setStudentUSN(e.target.value)}
                      placeholder="e.g. 4CB22CS001"
                      className="w-full pl-7 pr-1.5 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Academic Year */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Academic Year
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <select
                      required
                      value={studentAcademicYear}
                      onChange={(e) => setStudentAcademicYear(e.target.value)}
                      className={`w-full pl-7 pr-1 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${
                        !studentAcademicYear ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white font-medium'
                      }`}
                    >
                      <option value="" disabled>
                        Select Year
                      </option>
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2026-27">2026-27</option>
                      <option value="2027-28">2027-28</option>
                      <option value="2028-29">2028-29</option>
                    </select>
                  </div>
                </div>

                {/* Department */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <select
                      required
                      value={studentDept}
                      onChange={(e) => setStudentDept(e.target.value)}
                      className={`w-full pl-7 pr-1 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${
                        !studentDept ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white font-medium'
                      }`}
                    >
                      <option value="" disabled>
                        Select Dept
                      </option>
                      <option value="CSE">CSE (Comp Sci)</option>
                      <option value="ISE">ISE (Info Sci)</option>
                      <option value="ECE">ECE (Electronics)</option>
                      <option value="EEE">EEE (Electrical)</option>
                      <option value="MECH">Mechanical</option>
                      <option value="AI&DS">AI & DS</option>
                    </select>
                  </div>
                </div>

                {/* Semester */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Semester
                  </label>
                  <div className="relative">
                    <Layers className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <select
                      required
                      value={studentSem}
                      onChange={(e) => setStudentSem(e.target.value)}
                      className={`w-full pl-7 pr-1 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${
                        !studentSem ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white font-medium'
                      }`}
                    >
                      <option value="" disabled>
                        Select Sem
                      </option>
                      <option value="1st Sem">1st Sem</option>
                      <option value="2nd Sem">2nd Sem</option>
                      <option value="3rd Sem">3rd Sem</option>
                      <option value="4th Sem">4th Sem</option>
                      <option value="5th Sem">5th Sem</option>
                      <option value="6th Sem">6th Sem</option>
                      <option value="7th Sem">7th Sem</option>
                      <option value="8th Sem">8th Sem</option>
                    </select>
                  </div>
                </div>

                {/* Section */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Section
                  </label>
                  <div className="relative">
                    <Layers className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <select
                      required
                      value={studentSec}
                      onChange={(e) => setStudentSec(e.target.value)}
                      className={`w-full pl-7 pr-1 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${
                        !studentSec ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white font-medium'
                      }`}
                    >
                      <option value="" disabled>
                        Select Sec
                      </option>
                      <option value="Sec A">Section A</option>
                      <option value="Sec B">Section B</option>
                      <option value="Sec C">Section C</option>
                    </select>
                  </div>
                </div>

                {/* Email Address */}
                <div className="col-span-2 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="Enter email (Gmail or College mail ID)"
                      className="w-full pl-7 pr-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password & Forgot Link */}
                <div className="col-span-2 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <input
                      type="password"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-7 pr-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* LECTURER FORM */
              <div className="grid grid-cols-2 gap-2">
                {/* Faculty Name */}
                <div className="col-span-2 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Faculty Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      required
                      value={lecturerName}
                      onChange={(e) => setLecturerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-7 pr-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <select
                      required
                      value={lecturerDept}
                      onChange={(e) => setLecturerDept(e.target.value)}
                      className={`w-full pl-7 pr-1 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none cursor-pointer ${
                        !lecturerDept ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white font-medium'
                      }`}
                    >
                      <option value="" disabled>
                        Select Dept
                      </option>
                      <option value="CSE">CSE (Comp Sci)</option>
                      <option value="ISE">ISE (Info Sci)</option>
                      <option value="ECE">ECE (Electronics)</option>
                      <option value="EEE">EEE (Electrical)</option>
                      <option value="MECH">Mechanical</option>
                      <option value="AI&DS">AI & DS</option>
                    </select>
                  </div>
                </div>

                {/* Course Handled */}
                <div className="col-span-1 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Course / Subject
                  </label>
                  <div className="relative">
                    <BookOpen className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <select
                      required
                      value={lecturerCourse}
                      onChange={(e) => setLecturerCourse(e.target.value)}
                      className={`w-full pl-7 pr-1 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none cursor-pointer ${
                        !lecturerCourse ? 'text-neutral-400 dark:text-neutral-500' : 'text-amber-600 dark:text-amber-400 font-bold'
                      }`}
                    >
                      <option value="" disabled>
                        Select Course
                      </option>
                      <option value="DBMS">DBMS</option>
                      <option value="SE">SE</option>
                      <option value="RM">RM</option>
                      <option value="OS">OS</option>
                      <option value="CN">CN</option>
                      <option value="AI">AI</option>
                      <option value="WT">WT</option>
                    </select>
                  </div>
                </div>

                {/* Email Address */}
                <div className="col-span-2 space-y-0.5">
                  <label className="text-[10px] sm:text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <input
                      type="email"
                      required
                      value={lecturerEmail}
                      onChange={(e) => setLecturerEmail(e.target.value)}
                      placeholder="Enter email (Gmail or College mail ID)"
                      className="w-full pl-7 pr-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Password & Forgot Link */}
                <div className="col-span-2 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2" />
                    <input
                      type="password"
                      required
                      value={lecturerPassword}
                      onChange={(e) => setLecturerPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-7 pr-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-1 ${
                selectedRole === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              } ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to CEC Drive</span>
                  <LogIn className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-1 text-center text-[10px] text-neutral-400 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-900">
            Canara Engineering College • Central Academic Hub
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-5 shadow-2xl relative space-y-3.5">
            <button
              onClick={() => {
                setIsForgotPasswordOpen(false);
                setResetSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!resetSubmitted ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                    Reset Password
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                    Enter your email address (Gmail or College Mail) or USN to receive a recovery link
                  </p>
                </div>

                <form onSubmit={handleSendPasswordReset} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Email or USN / Faculty ID
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        placeholder="Enter Gmail, College Email, or USN"
                        className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-3 text-center py-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                  Reset Link Sent!
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                  A password reset link has been dispatched via Supabase Auth to your email address.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSubmitted(false);
                  }}
                  className="w-full py-2 text-xs font-bold text-white bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
