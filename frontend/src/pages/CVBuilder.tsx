import React, { useState, useRef } from 'react';
import { useCVStore } from '../store/cvStore';
import { CVPreview } from '../components/preview/CVPreview';
import { PersonalInfoEditor } from '../components/editor/PersonalInfoEditor';
import { ExperienceEditor } from '../components/editor/ExperienceEditor';
import { EducationEditor } from '../components/editor/EducationEditor';
import { SkillsEditor } from '../components/editor/SkillsEditor';
import { LanguageEditor } from '../components/editor/LanguageEditor';
import { ProjectEditor } from '../components/editor/ProjectEditor';
import { CertificationEditor } from '../components/editor/CertificationEditor';
import { CustomizationPanel } from '../components/editor/CustomizationPanel';
import { LinkedInImportModal } from '../components/editor/LinkedInImportModal';
import { EmailShareModal } from '../components/editor/EmailShareModal';
import { FontLibrary } from '../components/ui/FontLibrary';
import { useAuthStore } from '../store/authStore';

type EditorTab = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications' | 'customize';

const editorTabs: { id: EditorTab; label: string; icon: React.ReactElement }[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'education',
    label: 'Education',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: 'languages',
    label: 'Languages',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    id: 'customize',
    label: 'Customize',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
];

interface CVBuilderProps {
  onNavigate: (page: 'login' | 'register' | 'user-dashboard' | 'admin-dashboard' | 'cv-builder') => void;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ onNavigate }) => {
  const { cvData, customization, qrConfig, resetCV, updateCustomization } = useCVStore();
  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showFontLibrary, setShowFontLibrary] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    onNavigate('login');
  };

  const handleFontSelect = (fontName: string, type: 'heading' | 'body') => {
    updateCustomization({
      fonts: {
        ...customization.fonts,
        [type]: fontName,
      },
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('cv-preview');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName} - CV</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&family=Merriweather:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&family=Poppins:wght@400;600;700&family=Nunito:wght@400;600&family=Raleway:wght@400;600;700&family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&family=Cormorant+Garamond:wght@400;600;700&family=EB+Garamond:wght@400;500;700&family=Source+Serif+Pro:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              body { margin: 0; padding: 0; }
              @media print {
                body { margin: 0; }
                @page { margin: 0; size: A4; }
              }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleDownloadHTML = () => {
    const printContent = document.getElementById('cv-preview');
    if (printContent) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName} - CV</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&family=Merriweather:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&family=Poppins:wght@400;600;700&family=Nunito:wght@400;600&family=Raleway:wght@400;600;700&family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&family=Cormorant+Garamond:wght@400;600;700&family=EB+Garamond:wght@400;500;700&family=Source+Serif+Pro:wght@400;600;700&display=swap" rel="stylesheet">
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvData.personalInfo.firstName}-${cvData.personalInfo.lastName}-CV.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderEditor = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoEditor />;
      case 'experience':
        return <ExperienceEditor />;
      case 'education':
        return <EducationEditor />;
      case 'skills':
        return <SkillsEditor />;
      case 'projects':
        return <ProjectEditor />;
      case 'languages':
        return <LanguageEditor />;
      case 'certifications':
        return <CertificationEditor />;
      case 'customize':
        return (
          <div className="space-y-4">
            <button
              onClick={() => setShowFontLibrary(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
              Browse Font Library
            </button>
            <CustomizationPanel />
          </div>
        );
      default:
        return <PersonalInfoEditor />;
    }
  };

  return (
    <div className="min-h-screen gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ResumeForge</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Professional CV Builder</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* LinkedIn Import */}
              <button
                onClick={() => setShowLinkedInModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="hidden lg:inline">Import LinkedIn</span>
              </button>

              {/* Download */}
              <button
                onClick={handleDownloadHTML}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* Email Share */}
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Dashboard */}
              <button
                onClick={() => {
                  const user = useAuthStore.getState().user;
                  onNavigate(user?.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Preview Toggle */}
              <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Editor */}
          <div className={`lg:w-450px xl:w-500px shrink-0 ${showMobilePreview ? 'hidden lg:block' : ''}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              {/* Editor Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex overflow-x-auto hide-scrollbar">
                  {editorTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-gray-800'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Content */}
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {editorTabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  {activeTab !== 'personal' && activeTab !== 'customize' && (
                    <button
                      onClick={resetCV}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Reset All
                    </button>
                  )}
                </div>
                {renderEditor()}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className={`flex-1 min-w-0 ${showMobilePreview ? '' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24 transition-colors duration-300">
              {/* Preview Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Live Preview</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">Auto-updating</span>
              </div>
              
              {/* Preview Content */}
              <div 
                ref={previewRef}
                className="p-4 bg-gray-100 dark:bg-gray-900 overflow-auto max-h-[calc(100vh-200px)]"
              >
                <CVPreview 
                  cvData={cvData} 
                  customization={customization}
                  qrConfig={qrConfig}
                />
              </div>
            </div>
          </div>

          {/* Mobile: Show Editor */}
          <div className={`lg:hidden ${showMobilePreview ? '' : 'fixed inset-0 z-30 bg-white dark:bg-gray-900'}`}>
            {!showMobilePreview && (
              <div className="h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CV Preview</h2>
                  <button
                    onClick={() => setShowMobilePreview(false)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <CVPreview 
                    cvData={cvData} 
                    customization={customization}
                    qrConfig={qrConfig}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LinkedInImportModal 
        isOpen={showLinkedInModal} 
        onClose={() => setShowLinkedInModal(false)} 
      />
      <EmailShareModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
      />
      <FontLibrary
        isOpen={showFontLibrary}
        onClose={() => setShowFontLibrary(false)}
        onSelectFont={handleFontSelect}
        currentHeadingFont={customization.fonts.heading}
        currentBodyFont={customization.fonts.body}
      />
    </div>
  );
};
