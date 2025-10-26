import React, { createContext, useContext, useState, useEffect } from 'react';

import ApiUser, { type UserType } from '@/api/user';

type UserContextType = {
    user?: UserType;
    setUser: (u?: UserType) => void;
    refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | undefined>(undefined);

    const refresh = async () => {
        try {
            const res = await ApiUser.me();
            setUser(res.data?.user);
        } catch (err) {
            console.error('Failed to load current user', err);
            setUser(undefined);
        }
    };

    useEffect(() => {
        void refresh();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, refresh }}>{children}</UserContext.Provider>
    );
};

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
