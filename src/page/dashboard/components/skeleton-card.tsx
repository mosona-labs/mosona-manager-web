import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SkeletonCard({ layout }: { layout: 'list' | 'list2' | 'grid' }) {
    return (
        <Card
            className={cn(
                'h-full border-border bg-card p-5 animate-pulse',
                layout !== 'grid' && 'py-3.5 gap-3.5'
            )}
        >
            <div className="flex h-full flex-col gap-3">
                <div className="flex w-full items-start justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted-foreground/10" />
                        <div className="flex flex-col gap-1">
                            <div className="h-4 w-32 rounded bg-muted-foreground/10" />
                            <div className="mt-1 h-3 w-24 rounded bg-muted-foreground/8" />
                        </div>
                    </div>
                    <div className="h-6 w-12 rounded bg-muted-foreground/10" />
                </div>

                <div className="mt-2 space-y-2">
                    <div className="h-3 w-full rounded bg-muted-foreground/8" />
                    <div className="h-3 w-5/6 rounded bg-muted-foreground/8" />
                    <div className="h-3 w-3/4 rounded bg-muted-foreground/8" />
                </div>

                <div className="mt-auto border-t border-border pt-3">
                    <div className="h-3 w-1/3 rounded bg-muted-foreground/6" />
                </div>
            </div>
        </Card>
    );
}
