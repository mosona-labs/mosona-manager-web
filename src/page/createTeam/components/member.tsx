import type { UserType } from '@/api/user';

import { Trash2 } from 'lucide-react';
import md5 from 'md5';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Member = ({
    item,
    index,
    onRemove,
}: {
    item: UserType;
    index: number;
    onRemove: () => void;
}) => (
    <div className={cn('flex flex-row gap-2 items-center px-4 py-3', index > 0 && 'border-t')}>
        <div>
            <Avatar>
                <AvatarImage
                    src={`https://gravatar.webp.se/avatar/${item.email ? md5(item.email) : ''}?d=mm&s=128`}
                    alt={item.username.substring(0, 1)}
                />
                <AvatarFallback>{item.username.substring(0, 1)}</AvatarFallback>
            </Avatar>
        </div>
        <div className="flex-1">
            <p className="font-medium">{item.username}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
        <Button variant="ghost" className="text-red-500" onClick={onRemove}>
            <Trash2 />
        </Button>
    </div>
);

export default Member;
