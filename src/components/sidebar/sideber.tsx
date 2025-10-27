import { useState, type ReactNode } from 'react';
import {
    Container,
    Terminal,
    KeyRound,
    Clock,
    Settings,
    ChevronsUpDown,
    Briefcase,
    BadgeInfo,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import Logo from '../logo';
import TeamAvatar from '../team-avatar';

import SidebarItem from './sidebarItem';
import TeamItem from './teamItem';

import { cn } from '@/lib/utils';
import { useUser } from '@/context/useUser';

const sidebarItems: {
    title: string;
    icon?: ReactNode;
    path?: string;
}[] = [
    { title: 'Overview' },
    { title: 'Dashboard', icon: <Container size={22} />, path: '/' },
    { title: 'Terminal', icon: <Terminal size={22} />, path: '/terminal' },
    { title: 'Keychain ', icon: <KeyRound size={22} />, path: '/keychain' },
    {
        title: 'Security',
    },
    { title: 'Logs', icon: <Clock size={22} />, path: '/logs' },
    {
        title: 'Manage',
    },
    { title: 'Team', icon: <Briefcase size={22} />, path: '/team' },
    { title: 'Settings', icon: <Settings size={22} />, path: '/settings' },
    {
        title: 'Other',
    },
    { title: 'About', icon: <BadgeInfo size={22} />, path: '/about' },
];

const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    const navigator = useNavigate();
    const { team, teams } = useUser();

    const [showTeams, setShowTeams] = useState(false);

    return (
        <>
            {/* Sidebar */}
            <div
                className={cn(
                    'absolute z-10 bg-background h-screen border-e px-3 py-4 transition-all w-[300px] duration-300 ease-in-out shrink-0 gap-2 flex flex-col select-none',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div
                    className="flex flex-row items-center gap-3.5 px-1 cursor-pointer"
                    onClick={() => navigator('/')}
                >
                    <Logo />
                    <div>
                        <h1 className="text-xl font-bold">Mosona Manager</h1>
                        <p className="text-sm text-muted-foreground">Server Monitor & Management</p>
                    </div>
                </div>

                {sidebarItems.map((item) =>
                    item.path ? (
                        <SidebarItem
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                            path={item.path}
                        />
                    ) : (
                        <p className="text-sm mt-3 mx-1 opacity-65">{item.title}</p>
                    )
                )}

                <div className="flex-1" />

                <DropdownMenu open={showTeams} onOpenChange={setShowTeams}>
                    <DropdownMenuTrigger className="focus-visible:ring-0" asChild>
                        <Button variant={'ghost'} className="w-full justify-between h-14 px-3">
                            <div className="flex flex-row justify-center items-center gap-2">
                                <div>
                                    <TeamAvatar
                                        color={team?.color || ''}
                                        imageUrl={team?.image || ''}
                                        name={team?.name || 'Loading...'}
                                    />
                                </div>
                                <div className="text-start">
                                    <p>{team?.name}</p>
                                    <p className="font-normal text-xs opacity-65">Team</p>
                                </div>
                            </div>
                            <ChevronsUpDown size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-full"
                        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
                    >
                        <DropdownMenuLabel>Teams</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {teams.map((t) => (
                            <DropdownMenuItem
                                key={t.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <TeamItem
                                    id={t.id}
                                    color={t.color}
                                    image={t.image}
                                    name={t.name}
                                    role={'Team'}
                                    isCurrent={t.id === team?.id}
                                    onClose={() => setShowTeams(false)}
                                />
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                            onClick={() => {
                                navigator('/create-team');
                            }}
                        >
                            <div className="flex flex-row w-full justify-center items-center gap-2 cursor-pointer">
                                <div className="w-8 h-8 border-2 border-dashed border-zinc-500 rounded-md" />
                                <div className="text-start">
                                    <p>Create New Team</p>
                                    <p className="font-normal text-xs opacity-65">
                                        Start a new team workspace
                                    </p>
                                </div>
                                <div className="flex-1" />
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {/* Sidebar Background */}
            <div
                className={cn(
                    'absolute w-full h-full bg-[#141414a2] transition-opacity duration-300 ease-in-out md:hidden',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setOpen(false)}
            />
            {/* Sidebar Spacer */}
            <div
                className={cn(
                    'transition-all duration-300 ease-in-out',
                    open ? 'md:w-[300px]' : 'w-0'
                )}
            />
        </>
    );
};

export default Sidebar;
