'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Link, Image, Code, Heading1, Heading2, Heading3, Type,
  Palette, Undo, Redo, Eye, EyeOff, Upload, Loader2, Maximize, Minimize, Split,
  Table, Video, FileText, Hash, Minus, Plus, RotateCcw, Save, Settings, Zap,
  ChevronDown, Monitor, Smartphone, Tablet, Copy, Scissors, ClipboardPaste
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

interface AdvancedBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  dropdown?: React.ReactNode;
}

const ToolbarButton = ({ icon, title, onClick, isActive, disabled, dropdown }: ToolbarButtonProps) => (
  <div className="relative group">
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-colors relative',
        'hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-gold',
        isActive ? 'bg-primary-gold/20 text-primary-gold' : 'text-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon}
      {dropdown && <ChevronDown className="w-3 h-3 absolute -bottom-1 -right-1" />}
    </button>
    {dropdown && (
      <div className="absolute top-full left-0 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {dropdown}
      </div>
    )}
  </div>
);

const ToolbarSeparator = () => <div className="w-px h-6 bg-white/20 mx-1" />;

export default function AdvancedBlogEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your amazing blog post...",
  className = ""
}: AdvancedBlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

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

  // Enhanced formatting commands
  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatUnderline = () => execCommand('underline');
  const formatStrikethrough = () => execCommand('strikeThrough');
  
  const formatHeading = (level: number) => execCommand('formatBlock', `h${level}`);
  const formatParagraph = () => execCommand('formatBlock', 'p');
  
  const alignLeft = () => execCommand('justifyLeft');
  const alignCenter = () => execCommand('justifyCenter');
  const alignRight = () => execCommand('justifyRight');
  const alignJustify = () => execCommand('justifyFull');
  
  const insertUnorderedList = () => execCommand('insertUnorderedList');
  const insertOrderedList = () => execCommand('insertOrderedList');
  
  // Fixed blockquote function
  const insertBlockquote = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      execCommand('insertHTML', `<blockquote>${selectedText}</blockquote>`);
    } else {
      execCommand('insertHTML', '<blockquote>Quote text here...</blockquote>');
    }
  };
  
  const insertCode = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      execCommand('insertHTML', `<code>${selection.toString()}</code>`);
    } else {
      execCommand('insertHTML', '<code>code</code>');
    }
  };

  const insertCodeBlock = () => {
    execCommand('insertHTML', '<pre><code>// Your code here\nconsole.log("Hello World!");</code></pre>');
  };

  const insertHorizontalRule = () => {
    execCommand('insertHTML', '<hr style="margin: 20px 0; border: none; border-top: 2px solid #d4af37; opacity: 0.3;" />');
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

  const insertTable = () => {
    setShowTableDialog(true);
  };

  const createTable = () => {
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0;">';
    
    // Header row
    tableHTML += '<thead><tr>';
    for (let j = 0; j < tableCols; j++) {
      tableHTML += '<th style="border: 1px solid #444; padding: 8px; background: rgba(212, 175, 55, 0.1); color: #d4af37;">Header</th>';
    }
    tableHTML += '</tr></thead>';
    
    // Body rows
    tableHTML += '<tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        tableHTML += '<td style="border: 1px solid #444; padding: 8px; color: #e5e7eb;">Cell</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    execCommand('insertHTML', tableHTML);
    setShowTableDialog(false);
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

      const imageHtml = `<img src="${data.url}" alt="${data.alt || 'Blog image'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; cursor: pointer;" onclick="selectImage(this)" />`;
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

  const insertEmbed = () => {
    const embedCode = prompt('Enter embed code (YouTube, Twitter, etc.):');
    if (embedCode) {
      execCommand('insertHTML', `<div style="margin: 16px 0;">${embedCode}</div>`);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getPreviewDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  const renderToolbar = () => (
    <GlassPanel className="p-3 rounded-lg border-b border-white/10">
      <div className="flex flex-wrap items-center gap-1">
        {/* File Operations */}
        <ToolbarButton icon={<Save className="w-4 h-4" />} title="Save (Ctrl+S)" onClick={() => {}} />
        <ToolbarSeparator />

        {/* Text Formatting */}
        <ToolbarButton icon={<Bold className="w-4 h-4" />} title="Bold (Ctrl+B)" onClick={formatBold} isActive={isCommandActive('bold')} />
        <ToolbarButton icon={<Italic className="w-4 h-4" />} title="Italic (Ctrl+I)" onClick={formatItalic} isActive={isCommandActive('italic')} />
        <ToolbarButton icon={<Underline className="w-4 h-4" />} title="Underline (Ctrl+U)" onClick={formatUnderline} isActive={isCommandActive('underline')} />
        <ToolbarButton icon={<Strikethrough className="w-4 h-4" />} title="Strikethrough" onClick={formatStrikethrough} isActive={isCommandActive('strikeThrough')} />
        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton icon={<Heading1 className="w-4 h-4" />} title="Heading 1" onClick={() => formatHeading(1)} />
        <ToolbarButton icon={<Heading2 className="w-4 h-4" />} title="Heading 2" onClick={() => formatHeading(2)} />
        <ToolbarButton icon={<Heading3 className="w-4 h-4" />} title="Heading 3" onClick={() => formatHeading(3)} />
        <ToolbarButton icon={<Type className="w-4 h-4" />} title="Paragraph" onClick={formatParagraph} />
        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} title="Align Left" onClick={alignLeft} isActive={isCommandActive('justifyLeft')} />
        <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} title="Align Center" onClick={alignCenter} isActive={isCommandActive('justifyCenter')} />
        <ToolbarButton icon={<AlignRight className="w-4 h-4" />} title="Align Right" onClick={alignRight} isActive={isCommandActive('justifyRight')} />
        <ToolbarButton icon={<AlignJustify className="w-4 h-4" />} title="Justify" onClick={alignJustify} isActive={isCommandActive('justifyFull')} />
        <ToolbarSeparator />

        {/* Lists and Quotes */}
        <ToolbarButton icon={<List className="w-4 h-4" />} title="Bullet List" onClick={insertUnorderedList} isActive={isCommandActive('insertUnorderedList')} />
        <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} title="Numbered List" onClick={insertOrderedList} isActive={isCommandActive('insertOrderedList')} />
        <ToolbarButton icon={<Quote className="w-4 h-4" />} title="Blockquote" onClick={insertBlockquote} />
        <ToolbarSeparator />

        {/* Insert Elements */}
        <ToolbarButton icon={<Link className="w-4 h-4" />} title="Insert Link" onClick={insertLink} />
        <ToolbarButton icon={isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />} title="Insert Image" onClick={insertImage} disabled={isUploadingImage} />
        <ToolbarButton icon={<Table className="w-4 h-4" />} title="Insert Table" onClick={insertTable} />
        <ToolbarButton icon={<Video className="w-4 h-4" />} title="Embed Media" onClick={insertEmbed} />
        <ToolbarSeparator />

        {/* Code */}
        <ToolbarButton icon={<Code className="w-4 h-4" />} title="Inline Code" onClick={insertCode} />
        <ToolbarButton icon={<FileText className="w-4 h-4" />} title="Code Block" onClick={insertCodeBlock} />
        <ToolbarButton icon={<Minus className="w-4 h-4" />} title="Horizontal Rule" onClick={insertHorizontalRule} />
        <ToolbarSeparator />

        {/* History */}
        <ToolbarButton icon={<Undo className="w-4 h-4" />} title="Undo (Ctrl+Z)" onClick={undo} />
        <ToolbarButton icon={<Redo className="w-4 h-4" />} title="Redo (Ctrl+Y)" onClick={redo} />
        <ToolbarSeparator />

        {/* View Controls */}
        <ToolbarButton 
          icon={viewMode === 'editor' ? <Eye className="w-4 h-4" /> : viewMode === 'preview' ? <EyeOff className="w-4 h-4" /> : <Split className="w-4 h-4" />} 
          title="Toggle View Mode" 
          onClick={() => setViewMode(viewMode === 'split' ? 'editor' : viewMode === 'editor' ? 'preview' : 'split')} 
        />
        
        {viewMode === 'preview' && (
          <>
            <ToolbarButton icon={<Monitor className="w-4 h-4" />} title="Desktop Preview" onClick={() => setPreviewDevice('desktop')} isActive={previewDevice === 'desktop'} />
            <ToolbarButton icon={<Tablet className="w-4 h-4" />} title="Tablet Preview" onClick={() => setPreviewDevice('tablet')} isActive={previewDevice === 'tablet'} />
            <ToolbarButton icon={<Smartphone className="w-4 h-4" />} title="Mobile Preview" onClick={() => setPreviewDevice('mobile')} isActive={previewDevice === 'mobile'} />
          </>
        )}
        
        <ToolbarButton 
          icon={isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />} 
          title="Toggle Fullscreen" 
          onClick={toggleFullscreen} 
        />
      </div>
    </GlassPanel>
  );

  const renderEditor = () => (
    <div className="flex-1 flex flex-col">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-6 text-gray-300 leading-relaxed focus:outline-none overflow-y-auto"
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{ minHeight: isFullscreen ? 'calc(100vh - 200px)' : '400px' }}
      />
    </div>
  );

  const renderPreview = () => (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Preview</span>
          <div className="flex space-x-2">
            <button onClick={() => setPreviewDevice('desktop')} className={cn('p-1 rounded', previewDevice === 'desktop' && 'bg-primary-gold/20')}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewDevice('tablet')} className={cn('p-1 rounded', previewDevice === 'tablet' && 'bg-primary-gold/20')}>
              <Tablet className="w-4 h-4" />
            </button>
            <button onClick={() => setPreviewDevice('mobile')} className={cn('p-1 rounded', previewDevice === 'mobile' && 'bg-primary-gold/20')}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-primary-black via-primary-black to-primary-dark/90">
        <div className={getPreviewDeviceClass()}>
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
              prose-li:text-gray-300
              prose-table:border-collapse prose-th:border prose-th:border-white/20 prose-td:border prose-td:border-white/20"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </div>
      </div>
    </div>
  );

  const containerClass = isFullscreen 
    ? 'fixed inset-0 z-50 bg-primary-black' 
    : cn('rounded-lg overflow-hidden', className);

  return (
    <div className={containerClass}>
      <GlassPanel className="h-full flex flex-col">
        {renderToolbar()}
        
        <div className="flex-1 flex">
          {viewMode === 'split' && (
            <>
              <div className="flex-1 border-r border-white/10">
                <GlassPanel className="h-full">{renderEditor()}</GlassPanel>
              </div>
              <div className="flex-1">
                <GlassPanel className="h-full">{renderPreview()}</GlassPanel>
              </div>
            </>
          )}
          
          {viewMode === 'editor' && (
            <GlassPanel className="flex-1">{renderEditor()}</GlassPanel>
          )}
          
          {viewMode === 'preview' && (
            <GlassPanel className="flex-1">{renderPreview()}</GlassPanel>
          )}
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
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
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

        {/* Table Dialog */}
        {showTableDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <GlassPanel className="p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Insert Table</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTableDialog(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createTable}
                  className="px-4 py-2 bg-primary-gold text-primary-black font-semibold rounded-lg hover:bg-primary-gold-light transition-colors"
                >
                  Insert Table
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
            color: #e5e7eb;
          }
          
          [contenteditable] code {
            background: rgba(255, 255, 255, 0.1);
            color: #d4af37;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }
          
          [contenteditable] pre {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
          }
          
          [contenteditable] pre code {
            background: none;
            padding: 0;
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
          
          [contenteditable] table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
          }
          
          [contenteditable] th, [contenteditable] td {
            border: 1px solid #444;
            padding: 8px;
            text-align: left;
          }
          
          [contenteditable] th {
            background: rgba(212, 175, 55, 0.1);
            color: #d4af37;
            font-weight: bold;
          }
          
          [contenteditable] hr {
            margin: 20px 0;
            border: none;
            border-top: 2px solid #d4af37;
            opacity: 0.3;
          }
        `}</style>
      </GlassPanel>
    </div>
  );
}
