import React from 'react';
import { User, Mail, Shield, HardDrive, Key, LogOut, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  userRole: UserRole;
  onLogout: () => void;
  onOpenResetPassword?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  userRole,
  onLogout,
  onOpenResetPassword,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Circle */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shrink-0 ${
              user.bgColor || 'bg-blue-600'
            }`}
          >
            {user.initial || user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {user.name}
              </h1>
              <span className="w-fit mx-auto sm:mx-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                {userRole === 'admin' ? 'Administrator' : userRole === 'uploader' ? 'Lecturer' : 'Student'}
              </span>
            </div>

            <p className="text-sm font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-neutral-400" />
              {user.email || `${user.id.slice(0, 8)}@cecdrive.edu`}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Account Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                Verified CEC Credential
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Account Information
          </h2>

          <div className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            <div className="pt-2 flex justify-between">
              <span className="text-neutral-500">Display Name</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{user.name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-neutral-500">Access Level</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">{userRole}</span>
            </div>
          </div>
        </div>

        {/* Cloud Storage Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            CEC Drive Storage
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">Cloud Usage</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">60.1 MB / 15.0 GB</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[4%]" />
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Unlimited academic storage provided by CEC Drive cloud.
            </p>
          </div>
        </div>
      </div>

      {/* Security Actions Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Security & Authentication
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your password or sign out from this device.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          {onOpenResetPassword && (
            <button
              onClick={onOpenResetPassword}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Change Password
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
