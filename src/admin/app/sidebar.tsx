import { type ReactNode } from 'react';
import {
    Briefcase,
    Container,
    FingerprintIcon,
    LogsIcon,
    Mail,
    Server,
    Settings,
    User,
    UserRoundPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import SidebarItem from '@/components/sidebar/sidebarItem.tsx';
import Logo from '@/components/logo.tsx';
import { useSiteBranding } from '@/hooks/useSiteBranding.ts';

const sidebarItems: {
    title: string;
    icon?: ReactNode;
    path?: string;
}[] = [
    { title: 'nav.overview' },
    { title: 'nav.dashboard', icon: <Container size={22} />, path: '/admin/' },
    { title: 'nav.projects' },
    {
        title: 'nav.users',
        icon: <User size={22} />,
        path: '/admin/users',
    },
    {
        title: 'nav.teams',
        icon: <Briefcase size={22} />,
    },
    {
        title: 'nav.servers',
        icon: <Server size={22} />,
    },
    { title: 'nav.logging' },
    {
        title: 'nav.adminLogs',
        icon: <LogsIcon size={22} />,
        path: '/admin/logs',
    },
    { title: 'common.settings' },
    {
        title: 'nav.general',
        icon: <Settings size={22} />,
        path: '/admin/settings/general',
    },
    {
        title: 'nav.email',
        icon: <Mail size={22} />,
        path: '/admin/settings/email',
    },
    {
        title: 'nav.oauth2',
        icon: <FingerprintIcon size={22} />,
        path: '/admin/settings/oauth',
    },
    {
        title: 'nav.registerLogin',
        icon: <UserRoundPlus size={22} />,
        path: '/admin/settings/register_login',
    },
];

const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    const navigator = useNavigate();
    const { title } = useSiteBranding();
    const { t } = useTranslation();

    return (
        <>
            {/* Sidebar */}
            <div
                className={cn(
                    'absolute z-10 bg-background h-screen border-e px-3 py-4 transition-all w-[300px] duration-300 ease-in-out shrink-0 gap-2 flex flex-col select-none',
                    open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
                )}
            >
                <div
                    className="flex flex-row items-center gap-3.5 px-1 cursor-pointer"
                    onClick={() => navigator('/')}
                >
                    <Logo />
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-bold">{title}</h1>
                        <p className="text-sm text-muted-foreground">{t('nav.administration')}</p>
                    </div>
                </div>

                <div className={'flex flex-col gap-2 overflow-y-auto -mx-3 px-3 flex-1'}>
                    {sidebarItems.map((item) =>
                        item.icon ? (
                            <SidebarItem
                                key={item.title}
                                title={t(item.title)}
                                icon={item.icon}
                                path={item.path || ''}
                                enabled={!!item.path}
                            />
                        ) : (
                            <p key={item.title} className="text-sm mt-3 mx-1 opacity-65">
                                {t(item.title)}
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
