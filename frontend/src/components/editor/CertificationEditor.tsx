import React, { useRef, useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import {
  downloadCertificationDocument,
  uploadCertificationFiles,
} from '../../api/certifications';

export const CertificationEditor: React.FC = () => {
  const {
    cvData,
    currentCvId,
    addCertification,
    updateCertification,
    removeCertification,
    mergeUploadedCertifications,
  } = useCVStore();
  const { certifications } = cvData;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    files: File[],
    certificationId?: string,
    skippedFiles = 0,
  ) => {
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    setUploadMessage('');
    try {
      const uploaded = await uploadCertificationFiles(files, {
        cvId: certificationId ? undefined : currentCvId || undefined,
        certificationId,
      });
      mergeUploadedCertifications(uploaded);
      if (uploaded[0]) setExpandedId(uploaded[0].id);
      const skippedMessage = skippedFiles
        ? ` ${skippedFiles} unsupported file${skippedFiles === 1 ? ' was' : 's were'} skipped.`
        : '';
      setUploadMessage(
        `${uploaded.length} certificate${uploaded.length === 1 ? '' : 's'} uploaded.${skippedMessage}`,
      );
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Certificate upload failed.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>,
    certificationId?: string,
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    const files = selectedFiles.filter((file) =>
      /\.(pdf|png|jpe?g|webp)$/i.test(file.name),
    );
    event.target.value = '';
    if (!files.length) {
      setUploadError('Choose a PDF, PNG, JPEG, or WebP certificate file.');
      return;
    }
    await handleUpload(files, certificationId, selectedFiles.length - files.length);
  };

  const handleDownload = async (url: string) => {
    setUploadError('');
    try {
      await downloadCertificationDocument(url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Certificate download failed.',
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <h3 className="font-medium text-blue-900">Upload certificate documents</h3>
        <p className="mt-1 text-sm text-blue-800">
          Select PDF or image files, or choose a folder. Folder uploads create one
          certification per file. Maximum 20 files, 10 MB each.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Choose files'}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => folderInputRef.current?.click()}
            className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            Choose folder
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            onChange={(event) => void handleFileSelection(event)}
            className="hidden"
          />
          <input
            ref={(element) => {
              folderInputRef.current = element;
              element?.setAttribute('webkitdirectory', '');
              element?.setAttribute('directory', '');
            }}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            onChange={(event) => void handleFileSelection(event)}
            className="hidden"
          />
        </div>
        {uploadError && <p role="alert" className="mt-2 text-sm text-red-700">{uploadError}</p>}
        {uploadMessage && <p role="status" className="mt-2 text-sm text-green-700">{uploadMessage}</p>}
      </div>

      {certifications.map((cert) => (
        <div 
          key={cert.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setExpandedId(expandedId === cert.id ? null : cert.id)}
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">
                {cert.name || 'New Certification'}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCertification(cert.id);
                }}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === cert.id ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {expandedId === cert.id && (
            <div className="p-4 space-y-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name *</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization *</label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                  <input
                    type="month"
                    value={cert.date}
                    onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
                <input
                  type="url"
                  value={cert.url || ''}
                  onChange={(e) => updateCertification(cert.id, { url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.coursera.org/account/accomplishments/..."
                />
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">Certificate file</p>
                {cert.documentName ? (
                  <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <span className="truncate text-sm text-gray-700">{cert.documentName}</span>
                    {cert.documentUrl && (
                      <button
                        type="button"
                        onClick={() => void handleDownload(cert.documentUrl!)}
                        className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Download
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mb-2 text-xs text-gray-500">No file attached</p>
                )}
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  {uploading ? 'Uploading…' : cert.documentName ? 'Replace file' : 'Attach file'}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                    disabled={uploading}
                    onChange={(event) => void handleFileSelection(event, cert.id)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <button
        onClick={async () => {
          const id = await addCertification();
          setExpandedId(id);
        }}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Certification
      </button>
    </div>
  );
};
