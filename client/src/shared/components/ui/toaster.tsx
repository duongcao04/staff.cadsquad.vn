import { CheckCircle2, Info, X, Box, UploadCloud } from 'lucide-react'
import { ExternalToast, toast } from 'sonner'
import React from 'react'

type ToastColor =
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'notification'
    | 'promise'
    | 'upload'

interface ToastOptions extends ExternalToast {
    description?: React.ReactNode
    actionLabel?: string
    onAction?: () => void
    secondaryActionLabel?: string
    onSecondaryAction?: () => void
    iconType?: ToastColor
    avatarUrl?: string
    progress?: number // Added for upload logic
    version?: string // Added for update logic
}

const ToastLayout = ({
    t,
    color,
    title,
    opts,
}: {
    t: any
    color: ToastColor
    title: string
    opts?: ToastOptions
}) => {
    // Dark mode logic based on image (Success and Error/Update are dark)
    const isDark = color === 'success' || color === 'error'

    const renderIcon = () => {
        const iconSize = 20
        switch (opts?.iconType) {
            case 'success':
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-500/50 bg-green-500/10 text-green-500">
                        <CheckCircle2 size={iconSize} strokeWidth={3} />
                    </div>
                )
            case 'upload':
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-indigo-600 bg-white shadow-sm">
                        <UploadCloud size={iconSize} />
                    </div>
                )
            case 'error': // Used for "Update" style in your screenshot
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-slate-400">
                        <Box size={iconSize} />
                    </div>
                )
            case 'notification':
                return (
                    <div className="relative">
                        <img
                            src={opts?.avatarUrl}
                            className="h-10 w-10 rounded-full object-cover shadow-inner"
                            alt=""
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                    </div>
                )
            default:
                return <Info size={iconSize} className="text-indigo-500" />
        }
    }

    return (
        <div
            className={`flex w-[400px] rounded-2xl p-4 shadow-2xl border transition-all ${
                isDark
                    ? 'bg-[#121212] text-white border-white/10'
                    : 'bg-white text-slate-900 border-slate-200'
            }`}
        >
            <div className="flex w-full gap-4">
                <div className="flex-shrink-0">{renderIcon()}</div>

                <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold tracking-tight">
                                {title}
                            </span>
                            {opts?.iconType === 'notification' && (
                                <span className="text-[10px] opacity-40 font-medium">
                                    2 mins ago
                                </span>
                            )}
                            {opts?.version && (
                                <span className="text-[10px] opacity-40 font-mono tracking-tighter">
                                    {opts.version}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mt-1 text-sm opacity-70 leading-relaxed font-normal">
                        {opts?.description}
                    </div>

                    {/* Dynamic Progress Bar for Uploads */}
                    {opts?.iconType === 'upload' && (
                        <div className="mt-3">
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${opts.progress || 0}%` }}
                                />
                            </div>
                            <div className="mt-1 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {opts.progress || 0}%
                            </div>
                        </div>
                    )}

                    {/* Actions Row */}
                    {(opts?.actionLabel || opts?.secondaryActionLabel) && (
                        <div className="mt-4 flex gap-2">
                            {opts.secondaryActionLabel && (
                                <button
                                    onClick={opts.onSecondaryAction}
                                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors border ${
                                        isDark
                                            ? 'bg-transparent border-white/10 hover:bg-white/5'
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {opts.secondaryActionLabel}
                                </button>
                            )}
                            {opts.actionLabel && (
                                <button
                                    onClick={opts.onAction}
                                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                        isDark
                                            ? 'bg-white text-black hover:bg-slate-200'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {opts.actionLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const showToast = {
    success: (msg: string, opts?: ToastOptions) =>
        toast.custom((t) => (
            <ToastLayout
                t={t}
                color="success"
                title={msg}
                opts={{ ...opts, iconType: 'success' }}
            />
        )),

    error: (msg: string, opts?: ToastOptions) =>
        toast.custom((t) => (
            <ToastLayout
                t={t}
                color="error"
                title={msg}
                opts={{ ...opts, iconType: 'error' }}
            />
        )),

    notification: (name: string, opts?: ToastOptions) =>
        toast.custom((t) => (
            <ToastLayout
                t={t}
                color="notification"
                title={name}
                opts={{ ...opts, iconType: 'notification' }}
            />
        )),

    upload: (fileName: string, opts?: ToastOptions) =>
        toast.custom((t) => (
            <ToastLayout
                t={t}
                color="upload"
                title={fileName}
                opts={{ ...opts, iconType: 'upload' }}
            />
        )),

    info: (msg: string, opts?: ToastOptions) =>
        toast.custom((t) => (
            <ToastLayout
                t={t}
                color="info"
                title={msg}
                opts={{ ...opts, iconType: 'info' }}
            />
        )),
}
