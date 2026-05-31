import 'react-quill-new/dist/quill.snow.css'

import { Divider } from '@heroui/react'
import { useRef, useState } from 'react'
import ReactQuill from 'react-quill-new'

import { EditorToolbar, formats, modules } from './EditorToolbar'
import { FloatingToolbar } from './FloatingToolbar'

interface QuillEditorProps {
    value: string
    onChange: (value: string) => void
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
    const quillRef = useRef<ReactQuill>(null)

    // State for Floating Toolbar (Bubble)
    const [floatingPos, setFloatingPos] = useState({
        top: 0,
        left: 0,
        visible: false,
    })

    // Handle Selection for Floating Toolbar
    const handleSelectionChange = (range: any, source: string, editor: any) => {
        if (source === 'silent') return
        if (range && range.length > 0) {
            const bounds = editor.getBounds(range.index, range.length)
            setFloatingPos({
                top: bounds.top,
                left: bounds.left + bounds.width / 2,
                visible: true,
            })
        } else {
            setFloatingPos((prev) => ({ ...prev, visible: false }))
        }
    }

    return (
        <div className="w-full rounded-lg shadow-2xl bg-background text-text-default border border-border-muted">
            {/* 1. FIXED TOOLBAR (Top) */}
            <EditorToolbar quillRef={quillRef} />

            <Divider />

            {/* 2. FLOATING TOOLBAR (Bubble) */}
            <div className="relative max-w-4xl mx-auto">
                <FloatingToolbar position={floatingPos} quillRef={quillRef} />

                {/* 3. EDITOR AREA */}
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    onChangeSelection={handleSelectionChange}
                    modules={modules}
                    formats={formats}
                    className="custom-dark-editor"
                    placeholder="Start writing..."
                />
            </div>

            {/* 4. CSS Overrides for Dark Mode / Clean Look */}
            <style jsx global>{`
                /* Remove Default Borders */
                .custom-dark-editor .ql-container.ql-snow {
                    border: none !important;
                    font-family: 'Inter', sans-serif;
                }

                /* Editor Area */
                .custom-dark-editor .ql-editor {
                    min-height: 400px;
                    padding-top: 2rem;
                    font-size: 1.05rem;
                    line-height: 1.8;
                    color: var(--color-text-default);
                }

                /* Placeholder */
                .custom-dark-editor .ql-editor.ql-blank::before {
                    color: #525252;
                    font-style: normal;
                }

                .custom-dark-editor code {
                    color: var(--color-background-hovered);
                    font-style: normal;
                }

                /* Headers */
                .custom-dark-editor h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    color: #fff;
                }
                .custom-dark-editor h2 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    color: #fff;
                }

                /* Blockquotes */
                .custom-dark-editor blockquote {
                    border-left: 4px solid #3b82f6;
                    background: var(--background);
                    padding: 1rem;
                    color: #9ca3af;
                }

                /* Hide the native Quill tooltip (we have our own UI) */
                .ql-tooltip {
                    z-index: 100 !important;
                }
            `}</style>
        </div>
    )
}
