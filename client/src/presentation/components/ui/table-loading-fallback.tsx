export function TableLoadingFallback() {
    return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-divider bg-background">
            <Spinner size="lg" color="primary" label="Loading workbench..." />
        </div>
    )
}
