import md5 from 'md5';
import { memo, useEffect, useState } from 'react';
import { BookTextIcon, BugIcon, Cable, LogOut, Settings, Terminal, User2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import ApiAuth from '@/api/auth.ts';
import { ToastError } from '@/utils/toast.ts';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu.tsx';
import GithubIcon from '@/components/icons/github.tsx';

const User = ({ adminMode = false }: { adminMode?: boolean }) => {
    const navigator = useNavigate();
    const { user } = useUser();

    const [isOpen, setIsOpen] = useState(false);

    const signOut = () => {
        toast.promise<boolean>(
            () =>
                new Promise((resolve, reject) => {
                    ApiAuth.logout()
                        .then(() => {
                            resolve(true);
                            navigator('/auth');
                        })
                        .catch((err) => {
                            ToastError(err);
                            reject(err);
                        });
                }),
            {
                loading: 'Signing out in progress...',
                success: 'Signed out successfully',
                error: 'Error',
            }
        );

        setIsOpen(false);
    };

    useEffect(() => {
        if (adminMode && user && user?.id > 0 && !user?.is_admin) {
            navigator('/');
        }
    }, [adminMode, user]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                className="w-48 me-3 pt-3 pb-0 px-0 mt-1 overflow-hidden"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="px-3">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="mt-1.5">
                    <Button
                        variant={'ghost'}
                        className="w-full rounded-none py-3 justify-start"
                        onClick={() => {
                            navigator('/profile');
                            setIsOpen(false);
                        }}
                    >
                        <User2 />
                        Profile
                    </Button>
                    <Button
                        variant={'ghost'}
                        className="w-full rounded-none py-3 justify-start"
                        onClick={() => {
                            navigator('/token');
                            setIsOpen(false);
                        }}
                    >
                        <Cable />
                        API
                    </Button>
                    <Button
                        variant={'ghost'}
                        className="w-full rounded-none py-3 justify-start"
                        onClick={() => {
                            navigator('/settings/');
                            setIsOpen(false);
                        }}
                    >
                        <Settings />
                        Settings
                    </Button>
                    <DropdownMenuSeparator />
                    <a href={'https://github.com/mosona-network/mosona-manager'} target={'_blank'}>
                        <Button
                            variant={'ghost'}
                            className="w-full rounded-none py-3 justify-start"
                        >
                            <GithubIcon />
                            Github
                        </Button>
                    </a>
                    <a href={'manager.mosona.cc'} target={'_blank'}>
                        <Button
                            variant={'ghost'}
                            className="w-full rounded-none py-3 justify-start"
                        >
                            <BookTextIcon />
                            Documentation
                        </Button>
                    </a>
                    <a
                        href={
                            'https://github.com/mosona-network/mosona-manager/issues/new?template=bug-report.yml'
                        }
                        target={'_blank'}
                    >
                        <Button
                            variant={'ghost'}
                            className="w-full rounded-none py-3 justify-start"
                        >
                            <BugIcon />
                            Report Issue
                        </Button>
                    </a>
                    {!adminMode && user?.is_admin && (
                        <>
                            <DropdownMenuSeparator />
                            <Button
                                variant={'ghost'}
                                className="w-full rounded-none py-3 justify-start"
                                onClick={() => {
                                    navigator('/admin/');
                                    setIsOpen(false);
                                }}
                            >
                                <Settings />
                                Admin Dashboard
                            </Button>
                        </>
                    )}
                    {adminMode && (
                        <>
                            <DropdownMenuSeparator />
                            <Button
                                variant={'ghost'}
                                className="w-full rounded-none py-3 justify-start"
                                onClick={() => {
                                    navigator('/');
                                    setIsOpen(false);
                                }}
                            >
                                <Terminal />
                                Back to Manager
                            </Button>
                        </>
                    )}
                    <DropdownMenuSeparator />
                    <Button
                        variant={'ghost'}
                        className="w-full rounded-none py-3 justify-start text-red-500"
                        onClick={signOut}
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
