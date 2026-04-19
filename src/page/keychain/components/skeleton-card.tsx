export default function KeychainSkeletonCard() {
    return (
        <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 animate-pulse">
            <div className="flex flex-row items-center gap-1">
                <div>
                    <div className="h-4 w-28 rounded bg-muted-foreground/10" />
                    <div className="mt-2 h-3 w-32 rounded bg-muted-foreground/8" />
                </div>
                <div className="flex-1" />
                <div className="h-9 w-9 rounded bg-muted-foreground/8" />
            </div>
        </div>
    );
}
