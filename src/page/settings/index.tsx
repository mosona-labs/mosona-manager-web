import { useEffect, useState } from 'react';

import DisplaySettings from '@/page/settings/cards/display-settings.tsx';
import NotificationSettings from '@/page/settings/cards/notification-settings.tsx';

const Settings = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setMounted(true), 40);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div
                className="flex flex-row justify-between items-center mb-3"
                style={{
                    transition: 'opacity 400ms ease, transform 400ms ease',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'none' : 'translateY(6px)',
                }}
            >
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="opacity-65">Manage your client settings and notifications</p>
                </div>
            </div>
            <div className={'flex flex-col gap-4'}>
                <div
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '80ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <NotificationSettings />
                </div>
                <div
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '140ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <DisplaySettings />
                </div>
            </div>
        </div>
    );
};

export default Settings;
