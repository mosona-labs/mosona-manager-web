import type { ReactNode } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

const SidebarItem = ({
    title,
    icon,
    path,
    btn,
}: {
    title: string;
    icon: ReactNode;
    path: string;
    btn?: ReactNode;
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <div
            onClick={() => navigate(path)}
            className={cn(
                'flex flex-row gap-2 py-2 rounded-md items-center cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 whitespace-nowrap transition-all duration-300 ease-in-out',
                isActive ? 'bg-accent text-accent-foreground px-3' : 'px-2'
            )}
        >
            {icon}
            {title}
            <div className="flex-1" />
            {btn}
        </div>
    );
};

export default SidebarItem;
