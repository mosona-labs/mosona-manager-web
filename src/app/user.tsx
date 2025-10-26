import md5 from 'md5';
import { memo } from 'react';
import { LogOut, User2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';

const User = () => {
    const { user } = useUser();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Avatar className="w-9 h-9 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage
                        src={`https://gravatar.webp.se/avatar/${md5(user?.email || '')}?d=mm&s=128`}
                        alt={user?.username.substring(0, 1)}
                    />
                    <AvatarFallback>{user?.username.substring(0, 1)}</AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent
                className="w-48 me-3 pt-3 pb-0 px-0 mt-1"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="px-3">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="mt-1.5">
                    <Button variant={'ghost'} className="w-full rounded-none py-3 justify-start">
                        <User2 />
                        Profile
                    </Button>
                    <Button
                        variant={'ghost'}
                        className="w-full rounded-none py-3 justify-start text-red-500"
                    >
                        <LogOut />
                        Sign Out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default memo(User);
