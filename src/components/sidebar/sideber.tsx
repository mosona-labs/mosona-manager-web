import { useMemo, useState, type ReactNode } from 'react';
import {
    Container,
    Terminal,
    KeyRound,
    Clock,
    ChevronsUpDown,
    Briefcase,
    BadgeInfo,
    X,
    UserRoundCog,
    Settings,
    RadioTower,
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
import { useSession } from '@/context/useSession';
import { osIcons } from '@/utils/icon';

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
    { title: 'Public Page', icon: <RadioTower size={22} />, path: '/public-page' },
    { title: 'Profile', icon: <UserRoundCog size={22} />, path: '/profile' },
    { title: 'Settings', icon: <Settings size={22} />, path: '/settings' },
    {
        title: 'Other',
    },
    { title: 'About', icon: <BadgeInfo size={22} />, path: '/about' },
];

const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    const navigator = useNavigate();
    const { team, teams } = useUser();
    const { sessions, closeSession } = useSession();

    const sessionList = useMemo(() => Array.from(sessions.values()), [sessions]);

    const [showTeams, setShowTeams] = useState(false);

    return (
        <>
            {/* Sidebar */}
            <div
                className={cn(
                    'overflow-hidden absolute z-10 bg-background h-screen border-e px-3 py-4 transition-all w-[300px] duration-300 ease-in-out shrink-0 gap-2 flex flex-col select-none',
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

                <div className={'flex flex-col gap-2 overflow-y-auto -mx-3 px-3 flex-1'}>
                    {/* sessions */}
                    {sessionList.length > 0 && (
                        <>
                            <div className="border-t my-0.5" />
                            <p className="text-sm mt-1 mx-1 opacity-65">Sessions</p>
                            {sessionList.length > 0 ? (
                                sessionList.map((session) => (
                                    <SidebarItem
                                        key={session.id}
                                        title={session.name}
                                        icon={
                                            <img
                                                src={`/icons/${session?.os && osIcons.includes(session.os.toLowerCase() || '') ? session.os.toLowerCase() : 'linux'}.svg`}
                                                alt=""
                                                className="w-6"
                                            />
                                        }
                                        path={'/session/' + session.id}
                                        btn={
                                            <div
                                                className="p-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeSession(session.id);
                                                }}
                                            >
                                                <X size={16} />
                                            </div>
                                        }
                                    />
                                ))
                            ) : (
                                <p className="text-sm mt-1 mb-4 mx-1 opacity-50 italic">
                                    No active sessions
                                </p>
                            )}
                        </>
                    )}

                    {sidebarItems.map((item) =>
                        item.path ? (
                            <SidebarItem
                                key={item.title}
                                title={item.title}
                                icon={item.icon}
                                path={item.path}
                            />
                        ) : (
                            <p key={item.title} className="text-sm mt-3 mx-1 opacity-65">
                                {item.title}
                            </p>
                        )
                    )}
                </div>

                <div className="absolute bottom-[5rem] start-0 w-full h-8 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

                <DropdownMenu open={showTeams} onOpenChange={setShowTeams}>
                    <DropdownMenuTrigger className="focus-visible:ring-0" asChild>
                        <Button variant={'ghost'} className="w-full justify-between h-14 px-3">
                            <div className="flex flex-row justify-center items-center gap-2">
                                <div>
                                    <TeamAvatar
                                        color={team ? team?.color || '' : '#FFF'}
                                        imageUrl={team?.image || ''}
                                        name={team ? team?.name || 'Loading...' : 'N'}
                                    />
                                </div>
                                <div className="text-start">
                                    <p>{team ? team?.name : 'Click here'}</p>
                                    <p className="font-normal text-xs opacity-65">
                                        {team ? 'Team' : 'Create your first team now'}
                                    </p>
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
