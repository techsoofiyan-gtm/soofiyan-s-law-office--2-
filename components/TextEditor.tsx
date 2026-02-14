import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Undo2, Redo2, Printer, Type, Palette, Minus, Plus, FileText, Save, Check
} from 'lucide-react';
import { useData } from '../context/DataContext';

const FONTS = [
    // Hindi / Devanagari
    'Kruti Dev 010',
    'Noto Sans Devanagari',
    'Mukta',
    // Google Fonts
    'Inter',
    'Roboto',
    'Poppins',
    'Open Sans',
    'Montserrat',
    'Nunito',
    'Lora',
    'Playfair Display',
    // System Fonts
    'Arial',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
];

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '56', '72'];

const COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#cccccc',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#a855f7',
];

const TextEditor: React.FC = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { documents, addDocument } = useData();

    const editId = searchParams.get('id');
    const existingDoc = editId ? documents.find(d => d.id === editId) : null;

    const [docTitle, setDocTitle] = useState(existingDoc?.name?.replace('.doc', '') || 'Untitled Document');
    const [currentFont, setCurrentFont] = useState(existingDoc?.font || 'Kruti Dev 010');
    const [currentSize, setCurrentSize] = useState('16');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [saved, setSaved] = useState(false);

    // Load existing document content
    useEffect(() => {
        if (existingDoc?.content && editorRef.current) {
            editorRef.current.innerHTML = existingDoc.content;
            updateCounts();
        }
    }, [editId]);

    const execCommand = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }, []);

    const handleFontChange = (font: string) => {
        setCurrentFont(font);
        execCommand('fontName', font);
    };

    const handleSizeChange = (size: string) => {
        setCurrentSize(size);
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = size + 'px';
            range.surroundContents(span);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        editorRef.current?.focus();
    };

    const handleColorChange = (color: string) => {
        execCommand('foreColor', color);
        setShowColorPicker(false);
    };

    const handleSave = () => {
        const content = editorRef.current?.innerHTML || '';
        const text = editorRef.current?.innerText || '';
        const title = docTitle.trim() || 'Untitled Document';

        const today = new Date().toISOString().split('T')[0];
        const sizeKB = Math.round(new Blob([content]).size / 1024);

        addDocument({
            name: `${title}.doc`,
            type: 'DOC',
            size: sizeKB > 0 ? `${sizeKB} KB` : '1 KB',
            uploadDate: today,
            tags: ['Editor', 'Krutidev'],
            content: content,
            font: currentFont,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handlePrint = () => {
        const printContent = editorRef.current?.innerHTML;
        if (!printContent) return;

        const fontUrl = `${window.location.origin}/fonts/Kruti Dev 010 Regular/Kruti Dev 010 Regular.ttf`;

        // Use a hidden iframe for reliable font loading & auto-return to editor
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        iframeDoc.open();
        iframeDoc.write(`
      <html>
        <head>
          <title>${docTitle}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Lora:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=Mukta:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @font-face {
              font-family: 'Kruti Dev 010';
              src: url('${fontUrl}') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            body {
              font-family: '${currentFont}', sans-serif;
              font-size: ${currentSize}px;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.8;
            }
            @media print {
              body { padding: 0; margin: 0; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
        iframeDoc.close();

        // Wait for font to load before printing
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                // Clean up iframe after printing
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    editorRef.current?.focus();
                }, 500);
            }, 300);
        };
    };

    const updateCounts = () => {
        if (!editorRef.current) return;
        const text = editorRef.current.innerText || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);
        setCharCount(text.length);
    };

    const ToolbarButton: React.FC<{
        onClick: () => void;
        active?: boolean;
        title: string;
        children: React.ReactNode;
    }> = ({ onClick, active, title, children }) => (
        <button
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={`p-2 rounded-lg transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 ${active ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600'
                }`}
        >
            {children}
        </button>
    );

    const ToolbarDivider = () => <div className="w-px h-8 bg-slate-200 mx-1" />;

    return (
        <div className="h-full flex flex-col bg-slate-100">
            {/* Title Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <FileText className="w-5 h-5 text-white" />
                </div>
                <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="text-lg font-semibold text-slate-800 bg-transparent border-none outline-none hover:bg-slate-50 focus:bg-slate-50 px-2 py-1 rounded-lg transition-colors flex-1"
                    placeholder="Document Title"
                />
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 font-medium text-sm ${saved
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-200'
                        }`}
                >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : 'Save'}
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 font-medium text-sm"
                >
                    <Printer className="w-4 h-4" />
                    Print
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1 flex-wrap shadow-sm">
                {/* Undo / Redo */}
                <ToolbarButton onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)">
                    <Undo2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('redo')} title="Redo (Ctrl+Y)">
                    <Redo2 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Font Family */}
                <div className="relative">
                    <select
                        value={currentFont}
                        onChange={(e) => handleFontChange(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 font-medium cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[160px]"
                        style={{ fontFamily: currentFont }}
                    >
                        {FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                    </select>
                </div>

                {/* Font Size */}
                <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            const idx = FONT_SIZES.indexOf(currentSize);
                            if (idx > 0) handleSizeChange(FONT_SIZES[idx - 1]);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-700 rounded-l-lg hover:bg-slate-100"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <select
                        value={currentSize}
                        onChange={(e) => handleSizeChange(e.target.value)}
                        className="appearance-none bg-transparent text-center text-sm text-slate-700 font-medium cursor-pointer w-10 focus:outline-none"
                    >
                        {FONT_SIZES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            const idx = FONT_SIZES.indexOf(currentSize);
                            if (idx < FONT_SIZES.length - 1) handleSizeChange(FONT_SIZES[idx + 1]);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-700 rounded-r-lg hover:bg-slate-100"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                <ToolbarDivider />

                {/* Text Formatting */}
                <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
                    <Underline className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>

                {/* Text Color */}
                <div className="relative">
                    <ToolbarButton onClick={() => setShowColorPicker(!showColorPicker)} title="Text Color">
                        <Palette className="w-4 h-4" />
                    </ToolbarButton>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-200 grid grid-cols-5 gap-2 z-50 animate-in fade-in">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onMouseDown={(e) => { e.preventDefault(); handleColorChange(c); }}
                                    className="w-7 h-7 rounded-lg border-2 border-slate-200 hover:border-indigo-400 hover:scale-110 transition-all"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('justifyFull')} title="Justify">
                    <AlignJustify className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Editor Area - Page-like */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center" onClick={() => editorRef.current?.focus()}>
                <div className="w-full max-w-[816px] min-h-[1056px] bg-white rounded-lg shadow-xl border border-slate-200 p-16 relative">
                    {/* Page ruler effect */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-t-lg" />

                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={updateCounts}
                        className="outline-none min-h-full leading-relaxed"
                        style={{
                            fontFamily: `'${currentFont}', sans-serif`,
                            fontSize: `${currentSize}px`,
                            lineHeight: '1.8',
                            caretColor: '#6366f1',
                        }}
                        data-placeholder="Start typing your document here..."
                    />
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5" />
                        <span className="font-medium">{currentFont}</span>
                    </span>
                    <span>{currentSize}px</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                </div>
            </div>

            {/* Placeholder styling */}
            <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          font-style: italic;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
        </div>
    );
};

export default TextEditor;
