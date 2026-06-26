'use client';

import React, { useState, useRef } from 'react';
import { Eye, Edit3, Bold, Italic, Heading2, Heading3, List, Link as LinkIcon, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function RichTextEditor({ value, onChange, error }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const replacement = openTag + selection + closeTag;

    const newValue = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end);

    onChange(newValue);

    // Reposition cursor after inserting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + selection.length
      );
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter the destination URL:', 'https://');
    if (url) {
      insertTag(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
    }
  };

  return (
    <div className="w-full border border-outline-variant/60 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Editor Header / Tab Switcher */}
      <div className="flex items-center justify-between border-b border-outline-variant/40 bg-background/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'write'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground/60 hover:text-foreground hover:bg-outline-variant/20'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground/60 hover:text-foreground hover:bg-outline-variant/20'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* Formatting Toolbar - Only visible in Write mode */}
        {activeTab === 'write' && (
          <div className="flex items-center gap-1 border-l border-outline-variant/40 pl-2">
            <button
              type="button"
              onClick={() => insertTag('<h2>', '</h2>')}
              title="Heading 2"
              className="p-1.5 rounded hover:bg-outline-variant/20 text-foreground/75 hover:text-foreground"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<h3>', '</h3>')}
              title="Heading 3"
              className="p-1.5 rounded hover:bg-outline-variant/20 text-foreground/75 hover:text-foreground"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<b>', '</b>')}
              title="Bold"
              className="p-1.5 rounded hover:bg-outline-variant/20 text-foreground/75 hover:text-foreground"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<i>', '</i>')}
              title="Italic"
              className="p-1.5 rounded hover:bg-outline-variant/20 text-foreground/75 hover:text-foreground"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
              title="Bullet List"
              className="p-1.5 rounded hover:bg-outline-variant/20 text-foreground/75 hover:text-foreground"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertLink}
              title="Add Link"
              className="p-1.5 rounded hover:bg-outline-variant/20 text-foreground/75 hover:text-foreground"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('<blockquote>', '</blockquote>')}
              title="Blockquote"
              className="p-1.5 rounded hover:bg-outline-variant/20 text-foreground/75 hover:text-foreground"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="min-h-[300px]">
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your article content in HTML format..."
            className="w-full min-h-[350px] p-4 text-sm font-mono border-0 focus:ring-0 focus:outline-none resize-y text-foreground bg-white"
          />
        ) : (
          <div className="p-6 bg-white min-h-[350px] overflow-y-auto">
            {value.trim() ? (
              <div 
                className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: value }} 
              />
            ) : (
              <p className="text-foreground/40 text-sm italic">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-600 font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}
