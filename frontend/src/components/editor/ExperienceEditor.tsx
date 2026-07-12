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
  // Inside ExperienceEditor.tsx
// Ensure your useMutation hook uses the correct name
// const [updateExperience] = useMutation(UPDATE_EXPERIENCE);
// Inside your ExperienceEditor.tsx component

// Look for your existing form submission function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. STACK YOUR DATA: Assuming 'formData' or 'experienceData' is your React state
  // This line separates 'id' so it is not sent inside the input object
  const { id, ...inputWithoutId } = formData; 

  try {
    // 2. RUN THE MUTATION
    // If you are CREATING a new item:
    await createExperience({
      variables: {
        cvId: currentCvId, // Pass your CV ID here
        input: inputWithoutId, // Sent without the 'id' field
      },
    });

    /* 
    // OR if you are UPDATING an existing item:
    await updateExperience({
      variables: {
        id: id,               // Sent as the required top-level ID
        input: inputWithoutId, // Sent without the 'id' field
      },
    });
    */

    console.log("Success!");
  } catch (error) {
    console.error("Mutation error:", error);
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
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    disabled={exp.current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, { current: e.target.value as unknown as boolean })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Achievements</label>
                <div className="space-y-2">
                  {exp.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-500">▸</span>
                      <span className="flex-1 text-sm text-gray-700">{highlight}</span>
                      <button
                        onClick={() => handleRemoveHighlight(exp.id, idx)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={highlightInput[exp.id] || ''}
                    onChange={(e) => setHighlightInput({ ...highlightInput, [exp.id]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight(exp.id);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Add an achievement..."
                  />
                  <button
                    onClick={() => handleAddHighlight(exp.id)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <button
        onClick={async () => {
          const id = await addExperience();
          setExpandedId(id);
        }}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Experience
      </button>
    </div>
  );
};
