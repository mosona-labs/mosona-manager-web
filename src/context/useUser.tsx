import type { TeamType } from '@/api/team';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiUser, { type UserType } from '@/api/user';
import ApiCategory, { type CategoryType } from '@/api/category';

type UserContextType = {
    user?: UserType;
    team?: TeamType;
    teams: TeamType[];
    categories?: CategoryType[];
    setUser: (u?: UserType) => void;
    refresh: () => Promise<void>;
    config: UserConfigType;
    updateConfig: (newConfig: Partial<UserConfigType>) => void;
};

type UserConfigType = {
    defaultTimeFrame: string;
    autoRefresh: boolean;
    defaultMonitorMode: 'avg' | 'max' | 'raw';
    defaultLayout: 'grid-3' | 'grid-2' | 'list';
    dashboardLayout: 'grid' | 'list';
    dashboardShowDetails: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigator = useNavigate();

    const [user, setUser] = useState<UserType | undefined>(undefined);
    const [team, setTeam] = useState<TeamType | undefined>(undefined);
    const [teams, setTeams] = useState<TeamType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);

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
            .catch(() => {
                setUser(undefined);
            });
        ApiCategory.list()
            .then((res) => {
                setCategories(res.data || []);
            })
            .catch(() => {
                setCategories([]);
            });
    };

    // Config
    const [config, setConfig] = useState<UserConfigType>(
        localStorage.getItem('mosona-config')
            ? (JSON.parse(localStorage.getItem('mosona-config') || '{}') as UserConfigType)
            : {
                  defaultTimeFrame: '1h',
                  autoRefresh: true,
                  defaultMonitorMode: 'avg',
                  defaultLayout: 'grid-2',
                  dashboardLayout: 'grid',
                  dashboardShowDetails: false,
              }
    );
    const updateConfig = (newConfig: Partial<UserConfigType>) => {
        setConfig((prev) => {
            const updated = { ...prev, ...newConfig };
            localStorage.setItem('mosona-config', JSON.stringify(updated));
            return updated;
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <UserContext.Provider
            value={{ user, team, teams, categories, setUser, refresh, config, updateConfig }}
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
