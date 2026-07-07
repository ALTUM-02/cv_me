import React from 'react';
import { useCVStore } from '../../store/cvStore';

const proficiencyLevels = [
  { value: 'native', label: 'Native' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'basic', label: 'Basic' },
];

export const LanguageEditor: React.FC = () => {
  const { cvData, addLanguage, updateLanguage, removeLanguage } = useCVStore();
  const { languages } = cvData;

  return (
    <div className="space-y-4">
      {languages.map((lang) => (
        <div key={lang.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          <input
            type="text"
            value={lang.name}
            onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Language name"
          />
          <select
            value={lang.proficiency}
            onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value as typeof lang.proficiency })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {proficiencyLevels.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <button
            onClick={() => removeLanguage(lang.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      
      <button
        onClick={() => addLanguage()}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Language
      </button>
    </div>
  );
};
