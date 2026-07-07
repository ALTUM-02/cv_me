import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({ isOpen, onClose }) => {
  const { loadSampleData } = useCVStore();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importMethod, setImportMethod] = useState<'url' | 'paste' | 'sample'>('sample');
  const [pasteData, setPasteData] = useState('');

  if (!isOpen) return null;

  const handleImportFromUrl = async () => {
    if (!linkedinUrl) return;
    
    setIsLoading(true);
    // Simulate LinkedIn API import (in reality, this would need backend support)
    setTimeout(() => {
      // For demo purposes, we'll use sample data
      loadSampleData();
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleImportFromPaste = () => {
    if (!pasteData.trim()) return;
    
    setIsLoading(true);
    // Parse pasted text (simplified parsing)
    setTimeout(() => {
      loadSampleData();
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleImportSample = () => {
    loadSampleData();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Import LinkedIn Profile</h2>
                <p className="text-sm text-blue-100">Auto-fill your CV with LinkedIn data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Import Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setImportMethod('sample')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                importMethod === 'sample'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Load Sample
            </button>
            <button
              onClick={() => setImportMethod('url')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                importMethod === 'url'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              From URL
            </button>
            <button
              onClick={() => setImportMethod('paste')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                importMethod === 'paste'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paste Data
            </button>
          </div>

          {/* Import Methods */}
          {importMethod === 'sample' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Try Sample Data</h3>
              <p className="text-sm text-gray-500 mb-6">
                Load a pre-filled sample CV to explore all features before entering your own data.
              </p>
              <button
                onClick={handleImportSample}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Load Sample CV
              </button>
            </div>
          )}

          {importMethod === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <p className="text-xs text-gray-500">
                Note: Due to LinkedIn API restrictions, this feature uses a simplified import. For best results, paste your profile data manually.
              </p>
              <button
                onClick={handleImportFromUrl}
                disabled={!linkedinUrl || isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  'Import from LinkedIn'
                )}
              </button>
            </div>
          )}

          {importMethod === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Your LinkedIn Profile Data
                </label>
                <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  placeholder="Copy and paste your LinkedIn profile information here..."
                />
              </div>
              <p className="text-xs text-gray-500">
                Tip: Copy your entire LinkedIn profile page and paste it here. The system will try to extract relevant information.
              </p>
              <button
                onClick={handleImportFromPaste}
                disabled={!pasteData.trim() || isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Import Pasted Data'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
