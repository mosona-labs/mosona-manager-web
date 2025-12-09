import { useEffect, useState, useCallback } from 'react';

import ApiAuth, { type OAuthPublicType } from '@/api/auth';

type Keys = { captcha: string; oauth: OAuthPublicType[] } | null;

const STORAGE_KEY = 'authKeys';
const TTL_MS = 1000 * 60 * 60 * 6; // 6 hour

const useAuthKeys = () => {
    const [keys, setKeys] = useState<Keys>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchKeys = useCallback(async (force = false) => {
        setError(null);

        if (!force) {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.ts && Date.now() - parsed.ts < TTL_MS && parsed.data) {
                        setKeys(parsed.data);
                        return;
                    }
                }
            } catch {}
        }

        setLoading(true);
        try {
            const res = await ApiAuth.authKeys();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), data: res.data }));
            setKeys(res.data);
        } catch (e: any) {
            setError(e);
            setKeys(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKeys().then();
    }, [fetchKeys]);

    const refresh = useCallback(() => fetchKeys(true), [fetchKeys]);

    return { keys, loading, error, refresh };
};

export default useAuthKeys;
