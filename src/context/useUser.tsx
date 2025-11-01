import type { TeamType } from '@/api/team';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | undefined>(undefined);
    const [team, setTeam] = useState<TeamType | undefined>(undefined);
    const [teams, setTeams] = useState<TeamType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);

    const refresh = async () => {
        try {
            const [userRes, categoryRes] = await Promise.all([ApiUser.me(), ApiCategory.list()]);
            setUser(userRes.data?.user);
            setTeam(userRes.data?.team);
            setTeams(userRes.data?.teams || []);
            setCategories(categoryRes.data || []);
        } catch (err) {
            console.error('Failed to load current user', err);
            setUser(undefined);
        }
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
        void refresh();
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
