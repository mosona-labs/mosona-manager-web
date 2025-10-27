import type { TeamType } from '@/api/team';

import React, { createContext, useContext, useState, useEffect } from 'react';

import ApiUser, { type UserType } from '@/api/user';

type UserContextType = {
    user?: UserType;
    team?: TeamType;
    teams: TeamType[];
    setUser: (u?: UserType) => void;
    refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | undefined>(undefined);
    const [team, setTeam] = useState<TeamType | undefined>(undefined);
    const [teams, setTeams] = useState<TeamType[]>([]);

    const refresh = async () => {
        try {
            const res = await ApiUser.me();
            setUser(res.data?.user);
            setTeam(res.data?.team);
            setTeams(res.data?.teams || []);
        } catch (err) {
            console.error('Failed to load current user', err);
            setUser(undefined);
        }
    };

    useEffect(() => {
        void refresh();
    }, []);

    return (
        <UserContext.Provider value={{ user, team, teams, setUser, refresh }}>
            {children}
        </UserContext.Provider>
    );
};

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
