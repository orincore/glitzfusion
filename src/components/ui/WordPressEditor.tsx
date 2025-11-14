'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Bold, Italic, Link, Image, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Eye, Settings, Save, MoreHorizontal, Plus, Type, Heading1, Heading2, Heading3
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

interface WordPressEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  placeholder?: string;
  showHeaderActions?: boolean;
  isPreview?: boolean;
  onTogglePreview?: () => void;
}

export default function WordPressEditor({ 
  value, 
  onChange, 
  title,
  onTitleChange,
  placeholder = "Start writing...",
  showHeaderActions = true,
  isPreview: controlledIsPreview,
  onTogglePreview,
}: WordPressEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalIsPreview, setInternalIsPreview] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const isPreview = controlledIsPreview ?? internalIsPreview;
  const togglePreview = () => {
    if (onTogglePreview) return onTogglePreview();
    setInternalIsPreview(!internalIsPreview);
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const isCommandActive = useCallback((command: string) => {
    return document.queryCommandState(command);
  }, []);

  // WordPress-style formatting
  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatHeading = (level: number) => execCommand('formatBlock', `h${level}`);
  const formatParagraph = () => execCommand('formatBlock', 'p');
  const alignLeft = () => execCommand('justifyLeft');
  const alignCenter = () => execCommand('justifyCenter');
  const alignRight = () => execCommand('justifyRight');
  const insertUnorderedList = () => execCommand('insertUnorderedList');
  const insertOrderedList = () => execCommand('insertOrderedList');
  const insertBlockquote = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      execCommand('insertHTML', `<blockquote>${selectedText}</blockquote>`);
    } else {
      execCommand('insertHTML', '<blockquote>Quote...</blockquote>');
    }
  };
  const undo = () => execCommand('undo');
  const redo = () => execCommand('redo');

  const insertLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
      setShowLinkDialog(true);
    } else {
      const url = prompt('Enter URL:');
      if (url) {
        execCommand('createLink', url);
      }
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      if (selectedText) {
        execCommand('insertHTML', `<a href="${linkUrl}">${selectedText}</a>`);
      } else {
        execCommand('createLink', linkUrl);
      }
      setLinkUrl('');
      setSelectedText('');
      setShowLinkDialog(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingImage(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', 'Blog image');
      formData.append('description', 'Image uploaded for blog post');
      formData.append('tags', 'blog,content,image');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const imageHtml = `<figure class="wp-block-image"><img src="${data.url}" alt="${data.alt || 'Blog image'}" style="max-width: 100%; height: auto; border-radius: 8px;" /></figure>`;
      execCommand('insertHTML', imageHtml);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-black">
      {/* GLITZFUSION-style Header */}
      <div className="border-b border-white/10 bg-primary-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gradient-gold">Edit Post</h1>
            <div className="flex items-center space-x-2">
              {showHeaderActions && (
                <button
                  onClick={togglePreview}
                  className="flex items-center px-3 py-1.5 text-sm border border-white/20 rounded text-white hover:bg-white/10 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {isPreview ? 'Edit' : 'Preview'}
                </button>
              )}
            </div>
          </div>
          {showHeaderActions && (
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm text-gray-300 border border-white/20 rounded hover:bg-white/10 transition-colors">
                Save Draft
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded hover:shadow-gold-glow transition-all duration-300">
                Publish
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Title Input */}
        <div className="px-6 py-4 border-b border-white/10">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Add title"
            className="w-full text-3xl font-bold text-gradient-gold placeholder-gray-400 bg-transparent border-none outline-none resize-none"
          />
        </div>

        {/* GLITZFUSION-style Toolbar */}
        <div className="border-b border-white/10 bg-white/5 px-6 py-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={formatBold}
              className={cn(
                'p-2 rounded hover:bg-white/20 text-gray-300 transition-colors',
                isCommandActive('bold') && 'bg-primary-gold/20 text-primary-gold'
              )}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={formatItalic}
              className={cn(
                'p-2 rounded hover:bg-white/20 text-gray-300 transition-colors',
                isCommandActive('italic') && 'bg-primary-gold/20 text-primary-gold'
              )}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'p') formatParagraph();
                else formatHeading(parseInt(value.replace('h', '')));
              }}
              className="px-2 py-1 text-sm border border-white/20 rounded bg-white/5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-gold"
            >
              <option value="p" className="bg-primary-dark">Paragraph</option>
              <option value="h1" className="bg-primary-dark">Heading 1</option>
              <option value="h2" className="bg-primary-dark">Heading 2</option>
              <option value="h3" className="bg-primary-dark">Heading 3</option>
            </select>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <button onClick={alignLeft} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={alignCenter} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={alignRight} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Align Right">
              <AlignRight className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <button onClick={insertUnorderedList} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button onClick={insertOrderedList} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
            <button onClick={insertBlockquote} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Quote">
              <Quote className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <button onClick={insertLink} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Link">
              <Link className="w-4 h-4" />
            </button>
            <button 
              onClick={insertImage} 
              disabled={isUploadingImage}
              className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors disabled:opacity-50" 
              title="Add Media"
            >
              <Image className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <button onClick={undo} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Undo">
              <Undo className="w-4 h-4" />
            </button>
            <button onClick={redo} className="p-2 rounded hover:bg-white/20 text-gray-300 transition-colors" title="Redo">
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Content (kept mounted) */}
        <div className={cn("flex-1 px-6 py-4", isPreview && "hidden")} aria-hidden={isPreview}>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="text-gray-300 leading-relaxed focus:outline-none"
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        </div>

        {/* Preview Content (kept mounted) */}
        <div className={cn("flex-1 px-6 py-4", !isPreview && "hidden")} aria-hidden={!isPreview}>
          <h1 className="text-3xl font-bold text-gradient-gold mb-6">{title}</h1>
          <div 
            className="prose prose-lg prose-invert max-w-none
              prose-headings:text-gradient-gold prose-headings:font-display
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-primary-gold prose-a:no-underline hover:prose-a:text-primary-gold-light
              prose-strong:text-white prose-em:text-gray-200
              prose-blockquote:border-l-primary-gold prose-blockquote:bg-white/5 prose-blockquote:rounded-r-lg prose-blockquote:p-4
              prose-code:bg-white/10 prose-code:text-primary-gold prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-primary-dark prose-pre:border prose-pre:border-white/10
              prose-img:rounded-lg prose-img:shadow-lg
              prose-ul:text-gray-300 prose-ol:text-gray-300
              prose-li:text-gray-300"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-primary-black border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gradient-gold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL"
              className="w-full px-3 py-2 border border-white/20 rounded mb-4 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-gold"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setSelectedText('');
                }}
                className="px-4 py-2 text-gray-300 border border-white/20 rounded hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkSubmit}
                className="px-4 py-2 bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded hover:shadow-gold-glow transition-all duration-300"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLITZFUSION-style CSS */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1.5rem 0 1rem 0;
          line-height: 1.2;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.3;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
        }
        
        [contenteditable] p {
          margin: 0.75rem 0;
          line-height: 1.7;
          color: #d1d5db;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #d4af37;
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #e5e7eb;
        }
        
        [contenteditable] code {
          background: rgba(255, 255, 255, 0.1);
          color: #d4af37;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
          color: #d1d5db;
        }
        
        [contenteditable] li {
          margin: 0.5rem 0;
        }
        
        [contenteditable] a {
          color: #d4af37;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #f4d03f;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .wp-block-image {
          margin: 1rem 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
