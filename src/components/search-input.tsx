import { Search } from 'lucide-react';

import { Input } from './ui/input';

export const SearchInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => {
    return (
        <div className="relative">
            <Search className="absolute start-3 top-49/100 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
            <Input className={`ps-9 ${className || ''}`} {...props} />
        </div>
    );
};
