import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';

export const ExperienceEditor: React.FC = () => {
  const { cvData, addExperience, updateExperience, removeExperience } = useCVStore();
  const { experiences } = cvData;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightInput, setHighlightInput] = useState<{ [key: string]: string }>({});

  const handleAddHighlight = (expId: string) => {
    const text = highlightInput[expId]?.trim();
    if (text) {
      const exp = experiences.find(e => e.id === expId);
      if (exp) {
        updateExperience(expId, { highlights: [...exp.highlights, text] });
        setHighlightInput({ ...highlightInput, [expId]: '' });
      }
    }
  };

  const handleRemoveHighlight = (expId: string, index: number) => {
    const exp = experiences.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, { highlights: exp.highlights.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Experience Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const newId = `temp-${Date.now()}`;
            addExperience({
              id: newId,
              company: '',
              position: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: '',
              highlights: []
            });
            setExpandedId(newId);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Experience
        </button>
      </div>

      {experiences.map((exp) => (
        <div 
          key={exp.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">
                {exp.position || 'New Position'} 
                {exp.company && <span className="text-gray-500 font-normal"> at {exp.company}</span>}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeExperience(exp.id);
                }}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === exp.id ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {expandedId === exp.id && (
            <div className="p-4 space-y-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Google"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="San Francisco, CA"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="month"
                    value={exp.current ? '' : exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    disabled={exp.current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Currently working here</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Brief description of your role..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Highlights</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={highlightInput[exp.id] || ''}
                      onChange={(e) => setHighlightInput({ ...highlightInput, [exp.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHighlight(exp.id)}
                      placeholder="Add an achievement..."
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddHighlight(exp.id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {exp.highlights.map((hl, index) => (
                        <li key={index} className="flex items-start justify-between gap-2 text-sm text-gray-600">
                          <span className="leading-relaxed">• {hl}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(exp.id, index)}
                            className="text-gray-400 hover:text-red-500 transition-colors pt-0.5"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
