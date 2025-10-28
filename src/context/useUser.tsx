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

    useEffect(() => {
        void refresh();
    }, []);

    return (
        <UserContext.Provider value={{ user, team, teams, categories, setUser, refresh }}>
            {children}
        </UserContext.Provider>
    );
};

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
