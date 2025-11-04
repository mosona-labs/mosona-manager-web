import type { TeamMemberType } from '@/api/team';

import { Trash2 } from 'lucide-react';
import md5 from 'md5';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const Member = ({
    item,
    index,
    myUID,
    onRemove,
    onChangeRole,
}: {
    item: TeamMemberType;
    index: number;
    myUID: number;
    onRemove: () => void;
    onChangeRole: (role: number) => void;
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
        <div>
            <Select
                value={item.role.toString()}
                onValueChange={(e) => {
                    onChangeRole(parseInt(e));
                }}
                disabled={item.id === myUID}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="0">Full Access & Write</SelectItem>
                        <SelectItem value="1">Read & Terminal</SelectItem>
                        <SelectItem value="2">Read Only</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <Button variant="ghost" className="text-red-500" onClick={onRemove}>
            <Trash2 />
        </Button>
    </div>
);

export default Member;
