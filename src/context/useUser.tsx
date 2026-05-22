import type { TeamType } from '@/api/team';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiUser, { type UserType } from '@/api/user';
import ApiCategory, { type CategoryType } from '@/api/category';
import { ToastError } from '@/utils/toast.ts';
import ApiKey, { type KeyType } from '@/api/key.ts';

type UserContextType = {
    user?: UserType;
    team?: TeamType | null;
    teams: TeamType[];
    setUser: (u?: UserType) => void;
    refresh: () => Promise<void>;

    categories?: CategoryType[];
    refreshCategories: () => Promise<void>;

    keys?: KeyType[];
    refreshKeys: () => Promise<void>;

    config: UserConfigType;
    updateConfig: (newConfig: Partial<UserConfigType>) => void;
};

export type TerminalRendererType = 'xterm' | 'ghostty-web';

type UserConfigType = {
    defaultTimeFrame: string;
    autoRefresh: boolean;
    defaultMonitorMode: 'avg' | 'max' | 'raw';
    defaultMinMaxMode: 'min-auto' | '0-auto' | '0-max';
    defaultLayout: 'grid-3' | 'grid-2' | 'list';
    dashboardLayout: 'grid' | 'list' | 'list2';
    dashboardShowDetails: boolean;
    terminalRenderer: TerminalRendererType;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUserConfig: UserConfigType = {
    defaultTimeFrame: '1h',
    autoRefresh: true,
    defaultMonitorMode: 'avg',
    defaultMinMaxMode: 'min-auto',
    defaultLayout: 'grid-2',
    dashboardLayout: 'grid',
    dashboardShowDetails: false,
    terminalRenderer: 'ghostty-web',
};

const readUserConfig = (): UserConfigType => {
    const conf = localStorage.getItem('mosona-config');
    if (!conf) return defaultUserConfig;

    try {
        const parsed = JSON.parse(conf || '{}') as Partial<UserConfigType>;
        return {
            ...defaultUserConfig,
            ...parsed,
            terminalRenderer: parsed.terminalRenderer === 'xterm' ? 'xterm' : 'ghostty-web',
        };
    } catch {
        return defaultUserConfig;
    }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigator = useNavigate();

    const [user, setUser] = useState<UserType | undefined>(undefined);
    const [team, setTeam] = useState<TeamType | null | undefined>(undefined);
    const [teams, setTeams] = useState<TeamType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [keys, setKeys] = useState<KeyType[] | undefined>(undefined);

    const refresh = async () => {
        return ApiUser.me()
            .then((res) => {
                if (res.code === 'init_required') {
                    navigator('/init');
                    return;
                }

                setUser(res.data?.user);
                setTeam(res.data?.team ?? null);
                setTeams(res.data?.teams || []);
            })
            .catch((err) => {
                ToastError(err);
                setUser(undefined);
            });
    };

    const refreshCategories = async () => {
        ApiCategory.list()
            .then((res) => {
                setCategories(res.data || []);
            })
            .catch(() => {
                setCategories([]);
            });
    };

    const refreshKeys = async () => {
        setKeys(undefined);
        ApiKey.list()
            .then((res) => {
                setKeys(res.data || []);
            })
            .catch(() => {
                setKeys([]);
            });
    };

    // Config
    const [config, setConfig] = useState<UserConfigType>(() => readUserConfig());
    const updateConfig = (newConfig: Partial<UserConfigType>) => {
        setConfig((prev) => {
            const updated = { ...prev, ...newConfig };
            localStorage.setItem('mosona-config', JSON.stringify(updated));
            return updated;
        });
    };

    useEffect(() => {
        refresh().then(() => {
            console.log('User info refreshed');
        });
        refreshCategories().then(() => {
            console.log('Categories refreshed');
        });
        refreshKeys().then(() => {
            console.log('API Keys refreshed');
        });
    }, []);

    return (
        <UserContext.Provider
            value={{
                team,
                teams,
                user,
                setUser,
                refresh,

                categories,
                refreshCategories,

                keys,
                refreshKeys,

                config,
                updateConfig,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
