import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import { sendEmail, generateCVShareEmail } from '../../utils/email';

interface EmailShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailShareModal: React.FC<EmailShareModalProps> = ({ isOpen, onClose }) => {
  const { cvData } = useCVStore();
  const [recipient, setRecipient] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    if (!recipient || !cvData.personalInfo.firstName) return;

    setIsSending(true);
    setSendResult(null);

    const cvUrl = `https://cv.example.com/${cvData.personalInfo.firstName.toLowerCase()}-${cvData.personalInfo.lastName.toLowerCase()}`;
    
    const emailPayload = generateCVShareEmail(
      {
        firstName: cvData.personalInfo.firstName,
        lastName: cvData.personalInfo.lastName,
        email: recipient,
      },
      cvUrl,
      customMessage || undefined
    );

    const result = await sendEmail(emailPayload);
    setSendResult(result);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Share via Email</h2>
                <p className="text-sm text-emerald-100">Send your CV directly</p>
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
        <div className="p-6 space-y-4">
          {sendResult ? (
            <div className={`text-center py-6 ${sendResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
              {sendResult.success ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Email Sent!</h3>
                  <p className="text-sm text-gray-600">{sendResult.message}</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Failed to Send</h3>
                  <p className="text-sm text-gray-600">{sendResult.message}</p>
                </>
              )}
              <button
                onClick={() => {
                  setSendResult(null);
                  setRecipient('');
                  setCustomMessage('');
                }}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="Add a personal note to accompany your CV..."
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><span className="font-medium">From:</span> {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}</p>
                  <p><span className="font-medium">To:</span> {recipient || 'recipient@example.com'}</p>
                  <p><span className="font-medium">Subject:</span> Resume - {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}</p>
                </div>
              </div>

              <button
                onClick={handleSendEmail}
                disabled={!recipient || isSending}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
