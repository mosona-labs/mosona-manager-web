import { Card } from '@/components/ui/card';

export default function TerminalSkeletonCard() {
    return (
        <Card className="border-border bg-card p-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted-foreground/10" />
                <div>
                    <div className="h-4 w-32 rounded bg-muted-foreground/10" />
                    <div className="mt-2 h-3 w-20 rounded bg-muted-foreground/8" />
                </div>
                <div className="flex-1" />
                <div className="h-9 w-9 rounded bg-muted-foreground/8" />
            </div>
        </Card>
    );
}
