import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label.tsx';
import { cn } from '@/lib/utils.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';

const EnableCard = ({
    value,
    onChange,
    title,
    description,
    disabled = false,
    className,
}: {
    value: boolean;
    onChange: (v: boolean) => void;
    title: string;
    description?: string | ReactNode;
    disabled?: boolean;
    className?: string;
}) => (
    <Label
        className={cn(
            disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
            'hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950',
            className
        )}
    >
        <Checkbox
            id="toggle-2"
            checked={value}
            onCheckedChange={onChange}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
        />
        <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">{title}</p>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
    </Label>
);

export default EnableCard;
