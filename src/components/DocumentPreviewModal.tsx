import React, { useState } from 'react';
import {
  X,
  Download,
  Calendar,
  User,
  HardDrive,
  FileText,
  Star,
  Folder,
  ExternalLink,
  FileCode,
  Image as ImageIcon,
  Info,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Table,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle,
  FileCheck,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import { DocumentItem, FolderItem } from '../types';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (doc: DocumentItem) => void;
  onToggleStar?: (id: string) => void;
  folders?: FolderItem[];
  onMoveDocToFolder?: (docId: string, folderId: string | null) => void;
  userRole?: 'student' | 'uploader' | 'admin';
  canEdit?: boolean;
}

// Sample realistic Spreadsheet data generator for Excel previewing
const MOCK_EXCEL_SHEETS = [
  {
    name: 'Shortlisted Candidates',
    headers: ['ID', 'Team Name', 'Project Title', 'Category', 'Lead Name', 'Dept', 'Score (100)', 'Status'],
    rows: [
      ['01', 'TechNova', 'AI Automated Document Classifier', 'AI & ML', 'Rahul Verma', 'CSE', '94.5', 'Shortlisted'],
      ['02', 'CyberShield', 'Zero-Trust Campus Security', 'Cybersecurity', 'Ananya Hegde', 'CSE', '92.0', 'Shortlisted'],
      ['03', 'EcoGrid', 'Smart IoT Energy Monitor', 'IoT & Embedded', 'Karthik Kumar', 'ECE', '89.5', 'Shortlisted'],
      ['04', 'DataPulse', 'Realtime Student Analytics', 'Web Apps', 'Pooja Naik', 'CSE', '88.0', 'Shortlisted'],
      ['05', 'MechMind', 'Robotic Arm Sorting System', 'Robotics', 'Siddharth Rao', 'ME', '86.5', 'Shortlisted'],
      ['06', 'CloudSync', 'Distributed Storage Protocol', 'Cloud Computing', 'Vikram Shetty', 'CSE', '85.0', 'Waitlist'],
      ['07', 'BioTrack', 'Campus Attendance Scanner', 'Hardware', 'Divya Bhat', 'ECE', '83.5', 'Waitlist'],
      ['08', 'FinVision', 'Blockchain Fee Verification', 'FinTech', 'Rohan Das', 'CSE', '82.0', 'Waitlist'],
      ['09', 'AgriSense', 'Soil Moisture Sensor Node', 'IoT', 'Nikhil Gowda', 'ECE', '80.5', 'Evaluated'],
      ['10', 'EduConnect', 'Peer-to-Peer Notes Network', 'Web Apps', 'Sneha Pai', 'CSE', '79.0', 'Evaluated'],
      ['11', 'SolarDrive', 'EV Battery Management System', 'Automotive', 'Aditya Shenoy', 'ME', '77.5', 'Evaluated'],
      ['12', 'NeuralNotes', 'Lecture Audio Summarizer', 'AI & ML', 'Meera Joshi', 'CSE', '76.0', 'Evaluated'],
    ],
  },
  {
    name: 'Evaluation Metrics',
    headers: ['Criteria', 'Weightage', 'Max Score', 'Avg Score', 'Evaluator Team'],
    rows: [
      ['Innovation & Originality', '30%', '30', '26.4', 'Panel A (Dr. Sharma)'],
      ['Technical Implementation', '35%', '35', '30.1', 'Panel B (Prof. Rao)'],
      ['Feasibility & Impact', '20%', '20', '16.8', 'Panel C (Dr. Nayak)'],
      ['Presentation & Q/A', '15%', '15', '13.2', 'Panel D (Prof. Hegde)'],
    ],
  },
  {
    name: 'Summary',
    headers: ['Metric', 'Value', 'Notes'],
    rows: [
      ['Total Registrations', '48 Teams', 'Across 4 Engineering Depts'],
      ['Shortlisted Projects', '12 Teams', 'Selected for Final Presentation'],
      ['Total Mentors Assigned', '16 Faculty', 'CEC Staff Mentors'],
      ['Hackathon Date', '15-16 Oct 2026', 'CEC Main Campus Auditorium'],
    ],
  },
];

// Interactive Multi-Page PDF Viewer Canvas Component
import { SAMPLE_PDF_DATA_URL } from '../utils/samplePdf';

interface PdfViewerCanvasProps {
  document: DocumentItem;
  fileUrl?: string;
  onDownload?: (doc: DocumentItem) => void;
}

const PdfViewerCanvas: React.FC<PdfViewerCanvasProps> = ({ document, fileUrl, onDownload }) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const isBlobUrl = fileUrl?.startsWith('blob:');
  const activeUrl = isBlobUrl ? undefined : (fileUrl || SAMPLE_PDF_DATA_URL);
  const isRemoteHttpUrl = activeUrl && (activeUrl.startsWith('http://') || activeUrl.startsWith('https://'));
  
  // Clean embed URL by stripping /fl_attachment/ so Cloudinary serves the PDF with inline disposition
  const cleanUrl = activeUrl ? activeUrl.replace(/\/fl_attachment\//g, '/') : undefined;

  // Cloudinary URL analysis
  const isCloudinaryUrl = isRemoteHttpUrl && cleanUrl?.includes('cloudinary.com');
  const isCloudinaryRaw = isCloudinaryUrl && cleanUrl?.includes('/raw/upload/');

  // Derive JPG page 1 preview URL (transforms /raw/upload/ to /image/upload/ automatically)
  const cloudinaryJpgUrl = isCloudinaryUrl && cleanUrl
    ? cleanUrl.replace('/raw/upload/', '/image/upload/').replace(/\.pdf$/i, '.jpg')
    : undefined;

  // Google Docs Viewer embed URL (bypasses raw Cloudinary 401 ACL restriction)
  const googleDocsViewerUrl = cleanUrl
    ? `https://docs.google.com/gview?url=${encodeURIComponent(cleanUrl)}&embedded=true`
    : undefined;

  // View Mode: 'google' | 'image' | 'native'
  // Default to 'google' for ALL Cloudinary PDFs to ensure 100% reliable inline rendering before/after Cloudinary security setting updates
  const [viewMode, setViewMode] = useState<'google' | 'image' | 'native'>(() => {
    if (isCloudinaryUrl) return 'google';
    return 'native';
  });

  const currentEmbedUrl = viewMode === 'google'
    ? googleDocsViewerUrl
    : cleanUrl;

  if (isBlobUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-neutral-900 text-white text-center">
        <div className="p-6 rounded-3xl bg-neutral-800/80 border border-neutral-700/80 max-w-md space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Legacy Temporary File URL (`blob:`)</h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              This document was previously saved with a temporary browser URL (<code className="text-amber-300 font-mono text-[11px] bg-neutral-900 px-1 py-0.5 rounded">blob:</code>).
              Temporary browser URLs expire when the browser session ends and are not permanent Cloudinary assets.
            </p>
            <p className="text-xs text-neutral-300 mt-2 font-medium">
              Please re-upload this PDF file using the Upload button to store a permanent Cloudinary asset.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Graceful Error Screen if external PDF load fails
  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-neutral-900 text-white text-center">
        <div className="p-6 rounded-3xl bg-neutral-800/80 border border-neutral-700/80 max-w-md space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">PDF Preview Restriction</h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              The direct browser embed encountered a restriction. You can view the derived image preview or download the file.
            </p>
          </div>

          {cloudinaryJpgUrl && (
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-left space-y-2">
              <span className="text-[11px] font-semibold text-neutral-300 block">Page 1 Image Preview (Derived from Cloudinary):</span>
              <img src={cloudinaryJpgUrl} alt="PDF Page 1 Preview" className="w-full max-h-48 object-contain rounded-lg border border-neutral-800" />
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {activeUrl && (
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Cloudinary PDF Direct URL</span>
              </a>
            )}
            {onDownload && (
              <button
                onClick={() => onDownload(document)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Document</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#2a2a2e] relative overflow-hidden">
      {/* PDF Controls Toolbar Strip */}
      <div className="h-10 bg-[#1c1c1f] text-neutral-300 px-4 flex items-center justify-between border-b border-neutral-800 shrink-0 text-xs font-sans">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium text-neutral-200 truncate max-w-[150px] sm:max-w-xs" title={document.name}>
            {document.name}
          </span>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => setViewMode('google')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              viewMode === 'google'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Render using Google Docs Document Viewer"
          >
            Google Viewer
          </button>

          {cloudinaryJpgUrl && (
            <button
              onClick={() => setViewMode('image')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                viewMode === 'image'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Render Page 1 JPG Image Preview"
            >
              Image Preview
            </button>
          )}

          <button
            onClick={() => setViewMode('native')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              viewMode === 'native'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Render Native Browser Iframe Embed"
          >
            Direct Embed
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeUrl && (
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:bg-neutral-800 rounded transition-colors"
            >
              <span>Open Original</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Preview Container */}
      {viewMode === 'image' && cloudinaryJpgUrl ? (
        <div className="w-full h-full overflow-auto p-4 flex items-center justify-center bg-[#18181b]">
          <img
            src={cloudinaryJpgUrl}
            alt={`PDF Preview of ${document.name}`}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-neutral-800"
            onError={() => setHasError(true)}
          />
        </div>
      ) : (
        <iframe
          src={currentEmbedUrl}
          title={`PDF preview of ${document.name}`}
          className="w-full h-full border-none bg-white"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  onToggleStar,
  folders = [],
  onMoveDocToFolder,
  userRole = 'student',
  canEdit = userRole !== 'student',
}) => {
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [viewModeOverride, setViewModeOverride] = useState<'sheet' | 'iframe'>('sheet');

  if (!isOpen || !document) return null;

  const currentFolder = folders.find((f) => f.id === document.folderId);
  const fileUrl = document.fileUrl || (document as any).url;
  const ext = (document.originalFilename || document.name).split('.').pop()?.toLowerCase() || '';

  // Robust Format Classification
  const isPdf =
    document.type === 'pdf' ||
    ext === 'pdf' ||
    document.mimeType === 'application/pdf' ||
    (document.name || '').toLowerCase().endsWith('.pdf');

  const isImage =
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) ||
    document.mimeType?.startsWith('image/');

  const isExcel =
    ['xls', 'xlsx', 'csv'].includes(ext) ||
    document.type === 'sheet';

  const isOffice = ['doc', 'docx', 'ppt', 'pptx'].includes(ext);

  // Column letters for Excel grid header (A, B, C, D, E, F...)
  const getColLetter = (index: number) => String.fromCharCode(65 + index);

  const formatBadgeLabel = ext ? ext.toUpperCase() : document.type.toUpperCase();

  const getFormatIcon = () => {
    if (isExcel) return <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    if (isPdf) return <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    if (isImage) return <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    return <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  };

  const getFormatIconBg = () => {
    if (isExcel) return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/60';
    if (isPdf) return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/60';
    if (isImage) return 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-900/60';
    return 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Redesigned Viewer Modal Card */}
      <div className="relative w-full max-w-6xl h-[92vh] sm:h-[90vh] bg-white dark:bg-[#0f0f11] rounded-none border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col">
        {/* 1. TOP HEADER (Compact File Identity Bar) */}
        <div className="h-14 border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-5 flex items-center justify-between bg-white dark:bg-[#0f0f11] shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className={`p-2 rounded-none border shrink-0 ${getFormatIconBg()}`}>
              {getFormatIcon()}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <h3
                id="preview-modal-title"
                className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white truncate"
                title={document.name}
              >
                {document.name}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold font-mono uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-none border border-neutral-200/80 dark:border-neutral-700/80 shrink-0">
                {formatBadgeLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isExcel && fileUrl && fileUrl.startsWith('http') && (
              <button
                onClick={() => setViewModeOverride(viewModeOverride === 'sheet' ? 'iframe' : 'sheet')}
                className="px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Toggle Web / Interactive Grid View"
              >
                {viewModeOverride === 'sheet' ? <Eye className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {viewModeOverride === 'sheet' ? 'View Cloudinary Web File' : 'Interactive Grid'}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Close document preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. MAIN AREA — DOCUMENT PREVIEW CANVAS (Dominates 85%+ Height) */}
        <div className="flex-1 relative overflow-hidden bg-neutral-100/70 dark:bg-[#050506] flex flex-col">
          {/* Slide-Over Information Panel Overlay (Toggled via ⓘ button) */}
          {showInfoPanel && (
            <div className="absolute top-0 bottom-0 right-0 w-full sm:w-80 bg-white dark:bg-[#121214] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-30 p-5 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>File Information</span>
                </div>
                <button
                  onClick={() => setShowInfoPanel(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase font-semibold">File Name</span>
                  <p className="font-medium text-neutral-900 dark:text-white mt-0.5 break-words">
                    {document.originalFilename || document.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Format</span>
                    <p className="font-mono text-neutral-900 dark:text-white mt-0.5 uppercase">
                      {ext || document.type}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Size</span>
                    <p className="font-mono text-neutral-900 dark:text-white mt-0.5">
                      {document.size}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Uploaded By</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                          document.author?.bgColor || 'bg-blue-600'
                        }`}
                      >
                        {document.author?.initial || 'U'}
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white truncate">
                        {document.author?.name || 'Uploader'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Date Added</span>
                    <p className="font-medium text-neutral-900 dark:text-white mt-0.5 truncate">
                      {document.dateAdded}
                    </p>
                  </div>
                </div>

                {/* Folder Location */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                  <span className="text-[11px] text-neutral-400 uppercase font-semibold block">
                    Folder Location
                  </span>
                  {canEdit ? (
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-blue-500 shrink-0" />
                      <select
                        value={document.folderId || ''}
                        onChange={(e) => {
                          const target = e.target.value ? e.target.value : null;
                          if (onMoveDocToFolder) {
                            onMoveDocToFolder(document.id, target);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="">Root / Unassigned</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id}>
                            📁 {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      <Folder className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">
                        {currentFolder ? currentFolder.name : 'Root / Unassigned'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 5. ADVANCED INFORMATION (Collapsible Accordion) */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-1"
                  >
                    <span>Advanced Details</span>
                    {showAdvancedDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {showAdvancedDetails && (
                    <div className="mt-2 space-y-3 pt-2 text-[11px] bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <div>
                        <span className="text-neutral-400 uppercase font-semibold block">File Reference ID</span>
                        <span className="font-mono text-neutral-800 dark:text-neutral-200 break-all select-all">
                          {document.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase font-semibold block">Priority / Tag</span>
                        <span className="capitalize font-medium text-neutral-800 dark:text-neutral-200">
                          {document.tag || 'normal'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase font-semibold block">MIME Type</span>
                        <span className="font-mono text-neutral-800 dark:text-neutral-200">
                          {document.mimeType || 'application/octet-stream'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SPREADSHEET PREVIEW (For Excel / CSV) */}
          {isExcel && viewModeOverride === 'sheet' ? (
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#111113]">
              {/* Spreadsheet Grid Canvas */}
              <div className="flex-1 overflow-auto scrollbar-thin">
                <table className="w-full border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-[#1a1a1e] border-b border-neutral-300 dark:border-neutral-800 sticky top-0 z-10 text-neutral-500 dark:text-neutral-400 font-mono">
                      <th className="w-10 px-2 py-1.5 border-r border-neutral-300 dark:border-neutral-800 text-center font-semibold text-[11px] bg-neutral-200/70 dark:bg-[#202024]">
                        #
                      </th>
                      {MOCK_EXCEL_SHEETS[activeSheetIndex].headers.map((h, colIdx) => (
                        <th
                          key={colIdx}
                          className="px-3 py-1.5 border-r border-neutral-300 dark:border-neutral-800 text-left font-semibold"
                        >
                          <div className="flex items-center justify-between">
                            <span>{h}</span>
                            <span className="text-[9px] text-neutral-400 ml-2 font-mono">
                              {getColLetter(colIdx)}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                    {MOCK_EXCEL_SHEETS[activeSheetIndex].rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                      >
                        <td className="w-10 px-2 py-1.5 border-r border-neutral-300 dark:border-neutral-800 text-center font-mono text-[11px] text-neutral-400 bg-neutral-100/70 dark:bg-[#161619]">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`px-3 py-1.5 border-r border-neutral-200 dark:border-neutral-800/80 truncate ${
                              cellIdx === 0 ? 'font-mono text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Excel Bottom Sheet Tabs */}
              <div className="h-9 bg-neutral-100 dark:bg-[#18181b] border-t border-neutral-200 dark:border-neutral-800 px-3 flex items-center gap-1 overflow-x-auto shrink-0 font-sans">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-2 shrink-0">
                  Sheets:
                </span>
                {MOCK_EXCEL_SHEETS.map((sheet, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => setActiveSheetIndex(sIdx)}
                    className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-all shrink-0 border-t-2 ${
                      activeSheetIndex === sIdx
                        ? 'bg-white dark:bg-[#111113] border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    {sheet.name}
                  </button>
                ))}
              </div>
            </div>
          ) : isPdf ? (
            /* PDF VIEWER CANVAS — ALWAYS RENDERS ACTUAL PDF PREVIEW */
            <PdfViewerCanvas document={document} fileUrl={fileUrl} onDownload={onDownload} />
          ) : fileUrl && isImage ? (
            /* IMAGE VIEWER CANVAS */
            <div className="w-full h-full p-4 flex items-center justify-center overflow-auto bg-neutral-950">
              <img
                src={fileUrl}
                alt={document.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
              />
            </div>
          ) : fileUrl && (isOffice || viewModeOverride === 'iframe') ? (
            /* CLOUDINARY OFFICE / WEB VIEW IFRAME */
            <iframe
              src={
                fileUrl.startsWith('http')
                  ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
                  : fileUrl
              }
              title={`Web preview of ${document.name}`}
              className="w-full h-full border-none bg-white dark:bg-black"
            />
          ) : (
            /* UNSUPPORTED FILE PLACEHOLDER (ONLY FOR OTHER FORMATS) */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="p-6 rounded-none bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-sm space-y-4">
                <div className="w-16 h-16 rounded-none bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                  {getFormatIcon()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                    {document.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-1 uppercase">
                    .{ext || document.type} • {document.size}
                  </p>
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Direct inline preview is not supported for this file format. You can download the file to view locally.
                </p>
                {onDownload && (
                  <button
                    onClick={() => onDownload(document)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-none shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. BOTTOM TOOLBAR (Clean Minimal Action Strip) */}
        <div className="h-13 border-t border-neutral-200/80 dark:border-neutral-800 px-4 flex items-center justify-between bg-white dark:bg-[#0f0f11] shrink-0 z-20">
          {/* Left: Information Panel Toggle Button (ⓘ) */}
          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium transition-colors ${
              showInfoPanel
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Toggle File Information Panel"
          >
            <Info className="w-4 h-4" />
            <span className="hidden xs:inline">Details</span>
          </button>

          {/* Right: Download Primary CTA + More Options (⋮) */}
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(document)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-none shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}

            {/* More Menu Dropdown Toggle (⋮) */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="More Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 bottom-12 w-48 bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-none shadow-2xl p-1.5 z-40 space-y-1 animate-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      onToggleStar && onToggleStar(document.id);
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-none text-left"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        document.starred ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'
                      }`}
                    />
                    <span>{document.starred ? 'Remove Star' : 'Add to Starred'}</span>
                  </button>

                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMoreMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-left"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                      <span>Open in New Tab</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setShowInfoPanel(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-left"
                  >
                    <Info className="w-4 h-4 text-neutral-400" />
                    <span>View File Details</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
