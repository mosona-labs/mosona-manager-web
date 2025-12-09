import type { TeamType } from '@/api/team';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiUser, { type UserType } from '@/api/user';
import ApiCategory, { type CategoryType } from '@/api/category';
import { ToastError } from '@/utils/toast.ts';
import ApiKey, { type KeyType } from '@/api/key.ts';

type UserContextType = {
    user?: UserType;
    team?: TeamType;
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

type UserConfigType = {
    defaultTimeFrame: string;
    autoRefresh: boolean;
    defaultMonitorMode: 'avg' | 'max' | 'raw';
    defaultLayout: 'grid-3' | 'grid-2' | 'list';
    dashboardLayout: 'grid' | 'list' | 'list2';
    dashboardShowDetails: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigator = useNavigate();

    const [user, setUser] = useState<UserType | undefined>(undefined);
    const [team, setTeam] = useState<TeamType | undefined>(undefined);
    const [teams, setTeams] = useState<TeamType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [keys, setKeys] = useState<KeyType[] | undefined>(undefined);

    const refresh = async () => {
        ApiUser.me()
            .then((res) => {
                if (!res.data?.team) {
                    navigator('/create-team');
                }

                setUser(res.data?.user);
                setTeam(res.data?.team);
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
    const [config, setConfig] = useState<UserConfigType>(
        (() => {
            const conf = localStorage.getItem('mosona-config');
            return conf
                ? (JSON.parse(conf || '{}') as UserConfigType)
                : {
                      defaultTimeFrame: '1h',
                      autoRefresh: true,
                      defaultMonitorMode: 'avg',
                      defaultLayout: 'grid-2',
                      dashboardLayout: 'grid',
                      dashboardShowDetails: false,
                  };
        })()
    );
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
