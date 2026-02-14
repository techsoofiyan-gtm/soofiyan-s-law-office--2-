import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Undo2, Redo2, Printer, Type, Palette, Minus, Plus, FileText, Save, Check,
    Download, ChevronDown, Sparkles, Send, X, Loader2
} from 'lucide-react';
import { useData } from '../context/DataContext';

const FONTS = [
    'Kruti Dev 010', 'Noto Sans Devanagari', 'Mukta',
    'Inter', 'Roboto', 'Poppins', 'Open Sans', 'Montserrat', 'Nunito', 'Lora', 'Playfair Display',
    'Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana',
];

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '56', '72'];

const COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#cccccc',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#a855f7',
];

// Horizontal Ruler Component
const HorizontalRuler: React.FC = () => {
    const marks = [];
    for (let i = 0; i <= 21; i++) {
        const x = i * 37.8;
        marks.push(
            <React.Fragment key={i}>
                <div className="absolute bottom-0" style={{ left: x + 'px' }}>
                    <div className="w-px bg-slate-400" style={{ height: i % 5 === 0 ? '12px' : '6px' }} />
                    {i % 5 === 0 && (
                        <span className="absolute -top-3 text-[9px] text-slate-400 font-mono" style={{ transform: 'translateX(-50%)' }}>{i}</span>
                    )}
                </div>
            </React.Fragment>
        );
    }
    return (
        <div className="relative h-6 bg-slate-50 border-b border-slate-200 overflow-hidden" style={{ marginLeft: '30px' }}>
            <div className="relative h-full max-w-[816px] mx-auto">
                {marks}
            </div>
        </div>
    );
};

// Vertical Ruler Component
const VerticalRuler: React.FC = () => {
    const marks = [];
    for (let i = 0; i <= 29; i++) {
        const y = i * 37.8;
        marks.push(
            <React.Fragment key={i}>
                <div className="absolute right-0" style={{ top: y + 'px' }}>
                    <div className="h-px bg-slate-400" style={{ width: i % 5 === 0 ? '12px' : '6px' }} />
                    {i % 5 === 0 && (
                        <span className="absolute -left-1 text-[9px] text-slate-400 font-mono" style={{ transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center' }}>{i}</span>
                    )}
                </div>
            </React.Fragment>
        );
    }
    return (
        <div className="w-[30px] flex-shrink-0 bg-slate-50 border-r border-slate-200 relative overflow-hidden">
            <div className="relative" style={{ height: '1056px' }}>
                {marks}
            </div>
        </div>
    );
};

// AI Template data - using regular strings to avoid backtick issues with Krutidev
const AI_TEMPLATES: Record<string, string> = {
    vakalatnama: 'eSdkyRukek\n\nvkfn oknh.................\n\nifz oknh.................\n\nvknkyr la[;k..........\n\neSa] ............. iq= ............. fuoklh ............... mez ......... o"kZ ,rn~ }kjk ............. vf/koDrk] ftyk U;k;ky; ............. dks vius vf/koDrk fu;qDr djrk@djrh gw¡A',
    affidavit: 'gYQukek\n\neSa ............. iq=@iRuh ............. mez yxHkx ......... o"kZ fuoklh ............... ftyk ............. jkT; ............. gYQ iwoZd ;g ?kks"k.kk djrk@djrh gw¡ fd%\n\n1- ;g fd ......................\n\n2- ;g fd ......................\n\n3- ;g fd ......................',
    petition: 'izkFkZuk i=\n\nlsok esa]\n..............\n..............\n\nfo"k;% .........................\n\nJheku th]\n\nlfou; fuosnu gS fd ................................................\n\nvr% Jh eku th ls lknj izkFkZuk gS fd ........................\n\nizkFkhZ\n............',
};

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
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState('');

    useEffect(() => {
        if (existingDoc?.content && editorRef.current) {
            editorRef.current.innerHTML = existingDoc.content;
            updateCounts();
        }
    }, [editId]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = () => {
            setShowDownloadMenu(false);
            setShowColorPicker(false);
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

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
        const title = docTitle.trim() || 'Untitled Document';
        const today = new Date().toISOString().split('T')[0];
        const sizeKB = Math.round(new Blob([content]).size / 1024);

        addDocument({
            name: title + '.doc',
            type: 'DOC',
            size: sizeKB > 0 ? sizeKB + ' KB' : '1 KB',
            uploadDate: today,
            tags: ['Editor', 'Krutidev'],
            content: content,
            font: currentFont,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const updateCounts = () => {
        if (!editorRef.current) return;
        const text = editorRef.current.innerText || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);
        setCharCount(text.length);
    };

    // --- Printable HTML builder ---
    const buildPrintableHTML = () => {
        const content = editorRef.current?.innerHTML || '';
        const fontUrl = window.location.origin + '/fonts/Kruti Dev 010 Regular/Kruti Dev 010 Regular.ttf';
        return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + docTitle + '</title>' +
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Lora:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=Mukta:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet">' +
            '<style>@font-face{font-family:"Kruti Dev 010";src:url("' + fontUrl + '") format("truetype");font-weight:normal;font-style:normal;}' +
            'body{font-family:"' + currentFont + '",sans-serif;font-size:' + currentSize + 'px;padding:40px;max-width:800px;margin:0 auto;line-height:1.8;}' +
            '@media print{body{padding:0;margin:0;}}</style></head><body>' + content + '</body></html>';
    };

    const handleDownloadDoc = (e: React.MouseEvent) => {
        e.stopPropagation();
        const html = buildPrintableHTML();
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (docTitle.trim() || 'Untitled') + '.doc';
        a.click();
        URL.revokeObjectURL(url);
        setShowDownloadMenu(false);
        editorRef.current?.focus();
    };

    const handleDownloadPdf = (e: React.MouseEvent) => {
        e.stopPropagation();
        const html = buildPrintableHTML();
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    editorRef.current?.focus();
                }, 500);
            }, 400);
        };
        setShowDownloadMenu(false);
    };

    const handlePrint = () => {
        const html = buildPrintableHTML();
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    editorRef.current?.focus();
                }, 500);
            }, 400);
        };
    };

    // --- AI Writer ---
    const handleAiGenerate = () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        setAiResult('');

        setTimeout(() => {
            const promptLower = aiPrompt.toLowerCase();
            let result = '';
            if (promptLower.includes('vakalatnama') || promptLower.includes('eSdkyRukek')) {
                result = AI_TEMPLATES.vakalatnama;
            } else if (promptLower.includes('affidavit') || promptLower.includes('gYQukek') || promptLower.includes('halafnama')) {
                result = AI_TEMPLATES.affidavit;
            } else if (promptLower.includes('petition') || promptLower.includes('izkFkZuk') || promptLower.includes('prarthna')) {
                result = AI_TEMPLATES.petition;
            } else {
                result = 'fo"k;% ' + aiPrompt + '\n\nJheku th]\n\nlfou; fuosnu gS fd ' + aiPrompt.toLowerCase() + '\n\nvr% Jheku th ls lknj izkFkZuk gS fd mfpr dk;Zokgh djsa A\n\nizkFkhZ\n..............';
            }

            setAiResult(result);
            setAiLoading(false);
        }, 1500);
    };

    const insertAiResult = () => {
        if (!aiResult || !editorRef.current) return;
        editorRef.current.focus();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const div = document.createElement('div');
            div.innerHTML = aiResult.replace(/\n/g, '<br>');
            range.insertNode(div);
        } else {
            editorRef.current.innerHTML += aiResult.replace(/\n/g, '<br>');
        }
        updateCounts();
        setAiResult('');
        setAiPrompt('');
        setShowAiPanel(false);
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
            className={'p-2 rounded-lg transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 ' + (active ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600')}
        >
            {children}
        </button>
    );

    const ToolbarDivider = () => <div className="w-px h-8 bg-slate-200 mx-1" />;

    return (
        <div className="h-full flex flex-col bg-slate-100">
            {/* Title Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
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
                {/* AI Writer */}
                <button
                    onClick={() => setShowAiPanel(!showAiPanel)}
                    className={'flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 font-medium text-sm ' + (showAiPanel
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-200'
                    )}
                >
                    <Sparkles className="w-4 h-4" />
                    AI Writer
                </button>
                {/* Save */}
                <button
                    onClick={handleSave}
                    className={'flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 font-medium text-sm ' + (saved
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-200'
                    )}
                >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : 'Save'}
                </button>
                {/* Download Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    {showDownloadMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 min-w-[180px] overflow-hidden">
                            <button onClick={handleDownloadPdf} className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold">PDF</div>
                                Save as PDF
                            </button>
                            <button onClick={handleDownloadDoc} className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors border-t border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">DOC</div>
                                Save as DOC
                            </button>
                        </div>
                    )}
                </div>
                {/* Print */}
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 font-medium text-sm">
                    <Printer className="w-4 h-4" />
                    Print
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1 flex-wrap shadow-sm">
                <ToolbarButton onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('redo')} title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></ToolbarButton>
                <ToolbarDivider />
                <div className="relative">
                    <select value={currentFont} onChange={(e) => handleFontChange(e.target.value)} className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 font-medium cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[160px]" style={{ fontFamily: currentFont }}>
                        {FONTS.map(f => (<option key={f} value={f} style={{ fontFamily: f }}>{f}</option>))}
                    </select>
                </div>
                <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <button onMouseDown={(e) => { e.preventDefault(); const idx = FONT_SIZES.indexOf(currentSize); if (idx > 0) handleSizeChange(FONT_SIZES[idx - 1]); }} className="p-1.5 text-slate-500 hover:text-slate-700 rounded-l-lg hover:bg-slate-100"><Minus className="w-3 h-3" /></button>
                    <select value={currentSize} onChange={(e) => handleSizeChange(e.target.value)} className="appearance-none bg-transparent text-center text-sm text-slate-700 font-medium cursor-pointer w-10 focus:outline-none">
                        {FONT_SIZES.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    <button onMouseDown={(e) => { e.preventDefault(); const idx = FONT_SIZES.indexOf(currentSize); if (idx < FONT_SIZES.length - 1) handleSizeChange(FONT_SIZES[idx + 1]); }} className="p-1.5 text-slate-500 hover:text-slate-700 rounded-r-lg hover:bg-slate-100"><Plus className="w-3 h-3" /></button>
                </div>
                <ToolbarDivider />
                <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)"><Bold className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)"><Italic className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)"><Underline className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolbarButton>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <ToolbarButton onClick={() => setShowColorPicker(!showColorPicker)} title="Text Color"><Palette className="w-4 h-4" /></ToolbarButton>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-200 grid grid-cols-5 gap-2 z-50">
                            {COLORS.map(c => (
                                <button key={c} onMouseDown={(e) => { e.preventDefault(); handleColorChange(c); }} className="w-7 h-7 rounded-lg border-2 border-slate-200 hover:border-indigo-400 hover:scale-110 transition-all" style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    )}
                </div>
                <ToolbarDivider />
                <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left"><AlignLeft className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center"><AlignCenter className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right"><AlignRight className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('justifyFull')} title="Justify"><AlignJustify className="w-4 h-4" /></ToolbarButton>
                <ToolbarDivider />
                <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List"><List className="w-4 h-4" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List"><ListOrdered className="w-4 h-4" /></ToolbarButton>
            </div>

            {/* Horizontal Ruler */}
            <HorizontalRuler />

            {/* Main Editor + AI Panel */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex overflow-y-auto">
                    <VerticalRuler />
                    <div className="flex-1 p-8 flex justify-center" onClick={() => editorRef.current?.focus()}>
                        <div className="w-full max-w-[816px] min-h-[1056px] bg-white rounded-lg shadow-xl border border-slate-200 p-16 relative">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-t-lg" />
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={updateCounts}
                                className="outline-none min-h-full leading-relaxed"
                                style={{
                                    fontFamily: "'" + currentFont + "', sans-serif",
                                    fontSize: currentSize + 'px',
                                    lineHeight: '1.8',
                                    caretColor: '#6366f1',
                                }}
                                data-placeholder="Start typing your document here..."
                            />
                        </div>
                    </div>
                </div>

                {/* AI Writer Panel */}
                {showAiPanel && (
                    <div className="w-[340px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col shadow-lg">
                        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">AI Writer</h3>
                                    <p className="text-[10px] text-slate-500">Legal document assistant</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiPanel(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/60 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-xs font-medium text-slate-500 mb-2">Quick Templates</p>
                            <div className="flex flex-wrap gap-1.5">
                                {['Vakalatnama', 'Affidavit', 'Petition', 'Application', 'Notice'].map(tmpl => (
                                    <button key={tmpl} onClick={() => setAiPrompt(tmpl)} className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors">
                                        {tmpl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {aiLoading && (
                                <div className="flex flex-col items-center justify-center py-12 text-purple-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                    <p className="text-sm font-medium">Generating document...</p>
                                    <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
                                </div>
                            )}
                            {aiResult && !aiLoading && (
                                <div>
                                    <div className="bg-purple-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-purple-100" style={{ fontFamily: "'Kruti Dev 010', sans-serif" }}>
                                        {aiResult}
                                    </div>
                                    <button onClick={insertAiResult} className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-95 font-medium text-sm flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Insert into Document
                                    </button>
                                </div>
                            )}
                            {!aiResult && !aiLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                                    <Sparkles className="w-10 h-10 mb-3 text-slate-300" />
                                    <p className="text-sm font-medium text-slate-500">Describe what you need</p>
                                    <p className="text-xs text-center mt-1 max-w-[200px]">e.g. "Write a Vakalatnama" or "Draft an Affidavit"</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAiGenerate(); }}
                                    placeholder="e.g. Write a Vakalatnama..."
                                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white"
                                />
                                <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()} className="px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /><span className="font-medium">{currentFont}</span></span>
                    <span>{currentSize}px</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: '[data-placeholder]:empty::before{content:attr(data-placeholder);color:#94a3b8;pointer-events:none;font-style:italic;}[contenteditable]:focus{outline:none;}' }} />
        </div>
    );
};

export default TextEditor;
