import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';

const skillCategories = [
  'Technical',
  'Soft Skills',
  'Languages',
  'Tools',
  'Frameworks',
  'Methodologies',
  'Design',
  'Business',
];

export const SkillsEditor: React.FC = () => {
  const { cvData, addSkill, updateSkill, removeSkill } = useCVStore();
  const { skills } = cvData;
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      addSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        level: 50,
      });
      setNewSkillName('');
    }
  };

  const handleSkillLevelChange = (id: string, level: number) => {
    updateSkill(id, { level });
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="space-y-6">
      {/* Quick Add */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">Quick Add Skill</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddSkill();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Skill name..."
          />
          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {skillCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Skills by Category */}
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {category}
            <span className="text-xs text-gray-400">({categorySkills.length})</span>
          </h4>
          <div className="space-y-3">
            {categorySkills.map((skill) => (
              <div key={skill.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                    className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  />
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Interactive Skill Bar */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={(e) => handleSkillLevelChange(skill.id, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-600 w-10 text-right">
                      {skill.level}%
                    </span>
                  </div>
                  
                  {/* Preset Buttons */}
                  <div className="flex gap-1 mt-2">
                    {[25, 50, 75, 90, 100].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleSkillLevelChange(skill.id, preset)}
                        className={`text-xs px-2 py-0.5 rounded ${
                          skill.level === preset 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        } transition-colors`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Category Selector */}
                <select
                  value={skill.category}
                  onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                  className="mt-2 text-xs px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {skillCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {skills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm">No skills added yet</p>
          <p className="text-xs mt-1">Use the quick add form above to add your skills</p>
        </div>
      )}
    </div>
  );
};
