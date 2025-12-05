import { type ReactNode } from 'react';
import {
    Briefcase,
    Container,
    FingerprintIcon,
    Mail,
    Server,
    Settings,
    User,
    UserRoundPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import SidebarItem from '@/components/sidebar/sidebarItem.tsx';
import Logo from '@/components/logo.tsx';

const sidebarItems: {
    title: string;
    icon?: ReactNode;
    path?: string;
}[] = [
    { title: 'Overview' },
    { title: 'Dashboard', icon: <Container size={22} />, path: '/admin/' },
    { title: 'Projects' },
    {
        title: 'Users',
        icon: <User size={22} />,
        path: '/admin/users',
    },
    {
        title: 'Teams',
        icon: <Briefcase size={22} />,
        path: '/admin/teams',
    },
    {
        title: 'Servers',
        icon: <Server size={22} />,
        path: '/admin/servers',
    },
    { title: 'Settings' },
    {
        title: 'General',
        icon: <Settings size={22} />,
        path: '/admin/settings/general',
    },
    {
        title: 'Email',
        icon: <Mail size={22} />,
        path: '/admin/settings/email',
    },
    {
        title: 'OAuth2',
        icon: <FingerprintIcon size={22} />,
        path: '/admin/settings/oauth',
    },
    {
        title: 'Register',
        icon: <UserRoundPlus size={22} />,
        path: '/admin/settings/register',
    },
];

const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    const navigator = useNavigate();

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
                        <p className="text-sm text-muted-foreground">Administration Dashboard</p>
                    </div>
                </div>

                <div className={'flex flex-col gap-2 overflow-y-auto -mx-3 px-3 flex-1'}>
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
