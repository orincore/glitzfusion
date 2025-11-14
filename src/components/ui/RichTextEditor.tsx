'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Upload,
  Loader2
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton = ({ icon, title, onClick, isActive, disabled }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-2 rounded-lg transition-colors',
      'hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-gold',
      isActive ? 'bg-primary-gold/20 text-primary-gold' : 'text-gray-300',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    {icon}
  </button>
);

const ToolbarSeparator = () => (
  <div className="w-px h-6 bg-white/20 mx-1" />
);

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your blog post...",
  className = "",
  minHeight = "300px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

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

  // Formatting commands
  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatUnderline = () => execCommand('underline');
  const formatStrikethrough = () => execCommand('strikeThrough');
  
  const formatHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };
  
  const formatParagraph = () => execCommand('formatBlock', 'p');
  
  const alignLeft = () => execCommand('justifyLeft');
  const alignCenter = () => execCommand('justifyCenter');
  const alignRight = () => execCommand('justifyRight');
  const alignJustify = () => execCommand('justifyFull');
  
  const insertUnorderedList = () => execCommand('insertUnorderedList');
  const insertOrderedList = () => execCommand('insertOrderedList');
  const insertBlockquote = () => execCommand('formatBlock', 'blockquote');
  
  const insertCode = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      execCommand('insertHTML', `<code>${selection.toString()}</code>`);
    } else {
      execCommand('insertHTML', '<code>code</code>');
    }
  };

  const undo = () => execCommand('undo');
  const redo = () => execCommand('redo');

  const insertLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
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
      execCommand('createLink', linkUrl);
      setLinkUrl('');
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

      // Insert image into editor
      const imageHtml = `<img src="${data.url}" alt="${data.alt || 'Blog image'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
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

  const changeTextColor = () => {
    const color = prompt('Enter color (hex, rgb, or name):');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const changeBackgroundColor = () => {
    const color = prompt('Enter background color (hex, rgb, or name):');
    if (color) {
      execCommand('backColor', color);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <GlassPanel className="p-3 rounded-lg">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <ToolbarButton
            icon={<Bold className="w-4 h-4" />}
            title="Bold (Ctrl+B)"
            onClick={formatBold}
            isActive={isCommandActive('bold')}
          />
          <ToolbarButton
            icon={<Italic className="w-4 h-4" />}
            title="Italic (Ctrl+I)"
            onClick={formatItalic}
            isActive={isCommandActive('italic')}
          />
          <ToolbarButton
            icon={<Underline className="w-4 h-4" />}
            title="Underline (Ctrl+U)"
            onClick={formatUnderline}
            isActive={isCommandActive('underline')}
          />
          <ToolbarButton
            icon={<Strikethrough className="w-4 h-4" />}
            title="Strikethrough"
            onClick={formatStrikethrough}
            isActive={isCommandActive('strikeThrough')}
          />

          <ToolbarSeparator />

          {/* Headings */}
          <ToolbarButton
            icon={<Heading1 className="w-4 h-4" />}
            title="Heading 1"
            onClick={() => formatHeading(1)}
          />
          <ToolbarButton
            icon={<Heading2 className="w-4 h-4" />}
            title="Heading 2"
            onClick={() => formatHeading(2)}
          />
          <ToolbarButton
            icon={<Heading3 className="w-4 h-4" />}
            title="Heading 3"
            onClick={() => formatHeading(3)}
          />
          <ToolbarButton
            icon={<Type className="w-4 h-4" />}
            title="Paragraph"
            onClick={formatParagraph}
          />

          <ToolbarSeparator />

          {/* Alignment */}
          <ToolbarButton
            icon={<AlignLeft className="w-4 h-4" />}
            title="Align Left"
            onClick={alignLeft}
            isActive={isCommandActive('justifyLeft')}
          />
          <ToolbarButton
            icon={<AlignCenter className="w-4 h-4" />}
            title="Align Center"
            onClick={alignCenter}
            isActive={isCommandActive('justifyCenter')}
          />
          <ToolbarButton
            icon={<AlignRight className="w-4 h-4" />}
            title="Align Right"
            onClick={alignRight}
            isActive={isCommandActive('justifyRight')}
          />
          <ToolbarButton
            icon={<AlignJustify className="w-4 h-4" />}
            title="Justify"
            onClick={alignJustify}
            isActive={isCommandActive('justifyFull')}
          />

          <ToolbarSeparator />

          {/* Lists */}
          <ToolbarButton
            icon={<List className="w-4 h-4" />}
            title="Bullet List"
            onClick={insertUnorderedList}
            isActive={isCommandActive('insertUnorderedList')}
          />
          <ToolbarButton
            icon={<ListOrdered className="w-4 h-4" />}
            title="Numbered List"
            onClick={insertOrderedList}
            isActive={isCommandActive('insertOrderedList')}
          />
          <ToolbarButton
            icon={<Quote className="w-4 h-4" />}
            title="Blockquote"
            onClick={insertBlockquote}
          />

          <ToolbarSeparator />

          {/* Insert Elements */}
          <ToolbarButton
            icon={<Link className="w-4 h-4" />}
            title="Insert Link"
            onClick={insertLink}
          />
          <ToolbarButton
            icon={isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
            title="Insert Image"
            onClick={insertImage}
            disabled={isUploadingImage}
          />
          <ToolbarButton
            icon={<Code className="w-4 h-4" />}
            title="Inline Code"
            onClick={insertCode}
          />

          <ToolbarSeparator />

          {/* Colors */}
          <ToolbarButton
            icon={<Palette className="w-4 h-4" />}
            title="Text Color"
            onClick={changeTextColor}
          />

          <ToolbarSeparator />

          {/* History */}
          <ToolbarButton
            icon={<Undo className="w-4 h-4" />}
            title="Undo (Ctrl+Z)"
            onClick={undo}
          />
          <ToolbarButton
            icon={<Redo className="w-4 h-4" />}
            title="Redo (Ctrl+Y)"
            onClick={redo}
          />

          <ToolbarSeparator />

          {/* Preview Toggle */}
          <ToolbarButton
            icon={isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            title={isPreview ? "Edit Mode" : "Preview Mode"}
            onClick={() => setIsPreview(!isPreview)}
            isActive={isPreview}
          />
        </div>
      </GlassPanel>

      {/* Editor */}
      <GlassPanel className="rounded-lg overflow-hidden">
        {isPreview ? (
          <div 
            className="p-6 prose prose-lg prose-invert max-w-none
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
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="p-6 text-gray-300 leading-relaxed focus:outline-none"
            style={{ minHeight }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </GlassPanel>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <GlassPanel className="p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL (https://...)"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="px-4 py-2 bg-primary-gold text-primary-black font-semibold rounded-lg hover:bg-primary-gold-light transition-colors"
              >
                Insert Link
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2.25rem;
          font-weight: bold;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1.5rem 0 1rem 0;
          line-height: 1.2;
        }
        
        [contenteditable] h2 {
          font-size: 1.875rem;
          font-weight: bold;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.3;
        }
        
        [contenteditable] h3 {
          font-size: 1.5rem;
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
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #d4af37;
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
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
      `}</style>
    </div>
  );
}
