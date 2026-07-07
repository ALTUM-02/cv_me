import React from 'react';
import { useCVStore } from '../../store/cvStore';
import { templates, colorPresets, fontOptions } from '../../data/templates';

// Arabic & RTL font options
const arabicFonts = [
  { name: 'Noto Sans Arabic', category: 'Arabic Sans-Serif' },
  { name: 'Noto Naskh Arabic', category: 'Arabic Serif' },
  { name: 'Amiri', category: 'Arabic Serif' },
  { name: 'Tajawal', category: 'Arabic Sans-Serif' },
  { name: 'Cairo', category: 'Arabic Sans-Serif' },
  { name: 'Almarai', category: 'Arabic Sans-Serif' },
];

// Additional language / script font options (20+)
const languageFonts = [
  { name: 'Noto Sans SC', category: 'Chinese Simplified' },
  { name: 'Noto Sans TC', category: 'Chinese Traditional' },
  { name: 'Noto Sans JP', category: 'Japanese' },
  { name: 'Noto Sans KR', category: 'Korean' },
  { name: 'Noto Sans Devanagari', category: 'Hindi / Devanagari' },
  { name: 'Noto Sans Thai', category: 'Thai' },
  { name: 'Noto Sans Hebrew', category: 'Hebrew' },
  { name: 'Noto Sans Georgian', category: 'Georgian' },
  { name: 'Noto Sans Armenian', category: 'Armenian' },
  { name: 'Noto Sans Bengali', category: 'Bengali' },
  { name: 'Noto Sans Tamil', category: 'Tamil' },
  { name: 'Noto Sans Telugu', category: 'Telugu' },
  { name: 'Noto Sans Myanmar', category: 'Myanmar / Burmese' },
  { name: 'Noto Sans Khmer', category: 'Khmer' },
  { name: 'Noto Sans Lao', category: 'Lao' },
  { name: 'Noto Sans Ethiopic', category: 'Ethiopic / Amharic' },
  { name: 'Noto Sans CJK SC', category: 'CJK Chinese' },
  { name: 'Noto Sans CJK JP', category: 'CJK Japanese' },
  { name: 'Noto Sans CJK KR', category: 'CJK Korean' },
  { name: 'Noto Sans Oriya', category: 'Oriya / Odia' },
  { name: 'Noto Sans Gujarati', category: 'Gujarati' },
  { name: 'Noto Sans Gurmukhi', category: 'Punjabi / Gurmukhi' },
  { name: 'Noto Sans Sinhala', category: 'Sinhala' },
  { name: 'Noto Sans Tibetan', category: 'Tibetan' },
  { name: 'Noto Sans NKo', category: 'N’Ko' },
  { name: 'Noto Sans Vai', category: 'Vai' },
];

const allFontOptions = [
  ...fontOptions,
  ...arabicFonts,
  ...languageFonts,
];

// Font style presets
const fontStylePresets = [
  { label: 'Normal', value: 'normal', style: {} },
  { label: 'Bold', value: 'bold', style: { fontWeight: 'bold' as const } },
  { label: 'Light', value: 'light', style: { fontWeight: 300 as const } },
  { label: 'Italic', value: 'italic', style: { fontStyle: 'italic' as const } },
];

// Text color presets
const textColorPresets = [
  { name: 'Dark Gray', value: '#1f2937' },
  { name: 'Black', value: '#000000' },
  { name: 'Slate', value: '#334155' },
  { name: 'Blue', value: '#1e40af' },
  { name: 'Green', value: '#065f46' },
  { name: 'Red', value: '#991b1b' },
  { name: 'Purple', value: '#6b21a8' },
  { name: 'Brown', value: '#78350f' },
];

export const CustomizationPanel: React.FC = () => {
  const { customization, updateCustomization, setTemplate } = useCVStore();
  const { qrConfig, updateQRConfig } = useCVStore();

  const isRTL = customization.textDirection === 'rtl';

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setTemplate(template.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                customization.templateId === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div 
                className="w-full h-16 rounded mb-2"
                style={{ 
                  background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})` 
                }}
              />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{template.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{template.industry}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Color Theme</h3>
        <div className="grid grid-cols-5 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => updateCustomization({
                colors: {
                  primary: preset.primary,
                  secondary: preset.secondary,
                  accent: preset.accent,
                  text: customization.colors.text,
                  background: customization.colors.background,
                }
              })}
              className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                customization.colors.primary === preset.primary
                  ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400'
                  : 'border-transparent'
              }`}
              style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
              title={preset.name}
            />
          ))}
        </div>
        
        {/* Custom Color Inputs */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Primary</label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={customization.colors.primary}
                onChange={(e) => updateCustomization({
                  colors: { ...customization.colors, primary: e.target.value }
                })}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={customization.colors.primary}
                onChange={(e) => updateCustomization({
                  colors: { ...customization.colors, primary: e.target.value }
                })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Secondary</label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={customization.colors.secondary}
                onChange={(e) => updateCustomization({
                  colors: { ...customization.colors, secondary: e.target.value }
                })}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={customization.colors.secondary}
                onChange={(e) => updateCustomization({
                  colors: { ...customization.colors, secondary: e.target.value }
                })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Accent</label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={customization.colors.accent}
                onChange={(e) => updateCustomization({
                  colors: { ...customization.colors, accent: e.target.value }
                })}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={customization.colors.accent}
                onChange={(e) => updateCustomization({
                  colors: { ...customization.colors, accent: e.target.value }
                })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Typography</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Heading Font</label>
            <select
              value={customization.fonts.heading}
              onChange={(e) => updateCustomization({
                fonts: { ...customization.fonts, heading: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {allFontOptions.map((font) => (
                <option key={font.name} value={font.name}>{font.name} ({font.category})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Body Font</label>
            <select
              value={customization.fonts.body}
              onChange={(e) => updateCustomization({
                fonts: { ...customization.fonts, body: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {allFontOptions.map((font) => (
                <option key={font.name} value={font.name}>{font.name} ({font.category})</option>
              ))}
            </select>
          </div>

          {/* Font Style */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Font Style</label>
            <div className="flex gap-1.5">
              {fontStylePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateCustomization({ fontStyle: preset.value })}
                  className={`flex-1 py-2 text-xs font-medium border rounded-lg transition-all ${
                    (customization.fontStyle || 'normal') === preset.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  style={preset.style}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Text Color</h3>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {textColorPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateCustomization({
                colors: { ...customization.colors, text: preset.value }
              })}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
                customization.colors.text === preset.value
                  ? 'border-blue-500 ring-2 ring-offset-1 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ background: preset.value }}
              title={preset.name}
            >
              <span className="text-white text-[8px] font-bold drop-shadow">Aa</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customization.colors.text}
            onChange={(e) => updateCustomization({
              colors: { ...customization.colors, text: e.target.value }
            })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <input
            type="text"
            value={customization.colors.text}
            onChange={(e) => updateCustomization({
              colors: { ...customization.colors, text: e.target.value }
            })}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Text Direction / Language */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Language & Direction</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => updateCustomization({ textDirection: 'ltr' })}
              className={`flex-1 py-2.5 text-sm font-medium border rounded-lg transition-all ${
                !isRTL
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              ← LTR (English)
            </button>
            <button
              onClick={() => updateCustomization({ textDirection: 'rtl' })}
              className={`flex-1 py-2.5 text-sm font-medium border rounded-lg transition-all ${
                isRTL
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              RTL (العربية) →
            </button>
          </div>

          {isRTL && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Arabic fonts are recommended for RTL text. Select an Arabic font from the dropdown above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Settings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Photo Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={customization.showPhoto}
              onChange={(e) => updateCustomization({ showPhoto: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show Photo</span>
          </label>
          {customization.showPhoto && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Photo Shape</label>
              <div className="flex gap-2">
                {['circle', 'rounded', 'square'].map((shape) => (
                  <button
                    key={shape}
                    onClick={() => updateCustomization({ photoShape: shape as typeof customization.photoShape })}
                    className={`flex-1 py-2 text-sm capitalize border rounded-lg ${
                      customization.photoShape === shape
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } transition-colors`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Settings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">QR Code</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={qrConfig.enabled}
              onChange={(e) => updateQRConfig({ enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show QR Code</span>
          </label>
          {qrConfig.enabled && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">QR Code URL</label>
                <input
                  type="url"
                  value={qrConfig.url}
                  onChange={(e) => updateQRConfig({ url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://your-resume-url.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Size: {qrConfig.size}px</label>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={qrConfig.size}
                  onChange={(e) => updateQRConfig({ size: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
