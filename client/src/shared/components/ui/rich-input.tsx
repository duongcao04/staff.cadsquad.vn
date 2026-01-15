import { useRef, useEffect } from 'react'

interface RichInputProps {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    autoFocus?: boolean
}

export const RichInput = ({
    value,
    onChange,
    placeholder,
    autoFocus,
}: RichInputProps) => {
    const editorRef = useRef<HTMLDivElement>(null)

    // Sync external value to editor only if it differs significantly
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value
        }
    }, [value])

    useEffect(() => {
        if (autoFocus && editorRef.current) {
            editorRef.current.focus()
        }
    }, [autoFocus])

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    return (
        <div className="relative w-full min-h-20">
            {!value || value === '<br>' || value === '' ? (
                <div className="absolute top-3 left-3 text-default-400 pointer-events-none text-sm">
                    {placeholder}
                </div>
            ) : null}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="w-full p-3 text-sm focus:outline-none min-h-20 leading-relaxed"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            />
        </div>
    )
}
