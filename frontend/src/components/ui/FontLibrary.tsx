import React, { useState } from 'react';

interface FontLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFont: (fontName: string, type: 'heading' | 'body') => void;
  currentHeadingFont: string;
  currentBodyFont: string;
}

const fontCategories = [
  {
    name: 'Serif',
    description: 'Classic and elegant typefaces',
    fonts: [
      { name: 'Playfair Display', preview: 'The quick brown fox' },
      { name: 'Merriweather', preview: 'The quick brown fox' },
      { name: 'EB Garamond', preview: 'The quick brown fox' },
      { name: 'Cormorant Garamond', preview: 'The quick brown fox' },
      { name: 'Source Serif Pro', preview: 'The quick brown fox' },
      { name: 'Lora', preview: 'The quick brown fox' },
      { name: 'PT Serif', preview: 'The quick brown fox' },
      { name: 'Libre Baskerville', preview: 'The quick brown fox' },
    ],
  },
  {
    name: 'Sans-Serif',
    description: 'Clean and modern typefaces',
    fonts: [
      { name: 'Montserrat', preview: 'The quick brown fox' },
      { name: 'Source Sans Pro', preview: 'The quick brown fox' },
      { name: 'Lato', preview: 'The quick brown fox' },
      { name: 'Open Sans', preview: 'The quick brown fox' },
      { name: 'Poppins', preview: 'The quick brown fox' },
      { name: 'Nunito', preview: 'The quick brown fox' },
      { name: 'Raleway', preview: 'The quick brown fox' },
      { name: 'Roboto', preview: 'The quick brown fox' },
      { name: 'Inter', preview: 'The quick brown fox' },
      { name: 'Space Grotesk', preview: 'The quick brown fox' },
      { name: 'DM Sans', preview: 'The quick brown fox' },
      { name: 'Work Sans', preview: 'The quick brown fox' },
    ],
  },
  {
    name: 'Display',
    description: 'Bold and impactful typefaces',
    fonts: [
      { name: 'Abril Fatface', preview: 'The quick brown fox' },
      { name: 'Righteous', preview: 'The quick brown fox' },
      { name: 'Archivo Black', preview: 'The quick brown fox' },
      { name: 'Bebas Neue', preview: 'The quick brown fox' },
    ],
  },
  {
    name: 'Handwriting',
    description: 'Personal and creative typefaces',
    fonts: [
      { name: 'Dancing Script', preview: 'The quick brown fox' },
      { name: 'Pacifico', preview: 'The quick brown fox' },
      { name: 'Caveat', preview: 'The quick brown fox' },
      { name: 'Satisfy', preview: 'The quick brown fox' },
    ],
  },
];

export const FontLibrary: React.FC<FontLibraryProps> = ({
  isOpen,
  onClose,
  onSelectFont,
  currentHeadingFont,
  currentBodyFont,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Serif');
  const [fontTarget, setFontTarget] = useState<'heading' | 'body'>('heading');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const category = fontCategories.find(c => c.name === selectedCategory);
  const filteredFonts = category?.fonts.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelectFont = (fontName: string) => {
    onSelectFont(fontName, fontTarget);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Font Library</h2>
              <p className="text-gray-500">Choose the perfect typography for your CV</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Target Selection */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFontTarget('heading')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                fontTarget === 'heading'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Heading Font
              <span className="ml-2 text-xs opacity-75">({currentHeadingFont})</span>
            </button>
            <button
              onClick={() => setFontTarget('body')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                fontTarget === 'body'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Body Font
              <span className="ml-2 text-xs opacity-75">({currentBodyFont})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search fonts..."
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-40 border-r border-gray-200 p-4 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
            {fontCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Font Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-sm text-gray-500 mb-4">
              {category?.description} • {filteredFonts.length} fonts
            </p>
            <div className="grid grid-cols-1 gap-3">
              {filteredFonts.map((font) => {
                const isSelected = fontTarget === 'heading' 
                  ? currentHeadingFont === font.name
                  : currentBodyFont === font.name;

                return (
                  <button
                    key={font.name}
                    onClick={() => handleSelectFont(font.name)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{font.name}</span>
                      {isSelected && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p 
                      className="text-2xl text-gray-800"
                      style={{ fontFamily: `"${font.name}", sans-serif` }}
                    >
                      {font.preview}
                    </p>
                    <p 
                      className="text-sm text-gray-500 mt-1"
                      style={{ fontFamily: `"${font.name}", sans-serif` }}
                    >
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Fonts are loaded from Google Fonts and will appear in your exported CV
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
