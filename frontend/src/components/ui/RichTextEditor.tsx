import React, { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  minRows = 3,
  maxRows = 10,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minRows * 24), maxRows * 24);
    textarea.style.height = `${newHeight}px`;
  };

  // Format text with markdown-like syntax
  const insertFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText: string;
    let newCursorPos: number;

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'bullet':
        newText = `\n• ${selectedText || 'List item'}`;
        newCursorPos = start + 3 + (selectedText?.length || 0);
        break;
      case 'number':
        newText = `\n1. ${selectedText || 'List item'}`;
        newCursorPos = start + 4 + (selectedText?.length || 0);
        break;
      case 'line':
        newText = '\n───────────────\n';
        newCursorPos = start + newText.length;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Character count
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
    }`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => insertFormat('bold')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertFormat('italic')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0v16m-4 0h8" />
          </svg>
        </button>
        
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => insertFormat('bullet')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertFormat('number')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertFormat('line')}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Divider"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none"
        style={{ minHeight: `${minRows * 24}px` }}
      />

      {/* Footer with counts */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
};
