import { createContext, type FC, type ReactNode, useContext, useEffect, useState } from 'react';

import { type AdminSettingsType } from '@/api/admin/settings.ts';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';

type SettingsContextType = {
    settings?: AdminSettingsType;
    refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AdminSettingsType | undefined>(undefined);

    const refresh = async () => {
        ApiAdminSettings.get()
            .then((res) => {
                setSettings(res.data);
            })
            .catch((err) => {
                ToastError(err);
                setSettings(undefined);
            });
    };

    useEffect(() => {
        refresh().then(() => {
            console.log('Settings refreshed');
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, refresh }}>
            {children}
        </SettingsContext.Provider>
    );
};

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
}
