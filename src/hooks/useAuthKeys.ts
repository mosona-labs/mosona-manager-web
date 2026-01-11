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

        const fetchNetwork = async (showLoading = true) => {
            if (showLoading) setLoading(true);
            try {
                const res = await ApiAuth.authKeys();
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ ts: Date.now(), data: res.data })
                );
                setKeys(res.data);
            } catch (e: any) {
                setError(e);
                if (force) setKeys(null);
            } finally {
                if (showLoading) setLoading(false);
            }
        };

        if (!force) {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.ts && Date.now() - parsed.ts < TTL_MS && parsed.data) {
                        // Use cached data immediately
                        setKeys(parsed.data);
                        // Refresh in background without showing loading
                        fetchNetwork(false).catch(() => {});
                        return;
                    }
                }
            } catch {}
        }

        // No valid cache or forced refresh: fetch with loading
        await fetchNetwork(true);
    }, []);

    useEffect(() => {
        fetchKeys().then();
    }, [fetchKeys]);

    const refresh = useCallback(() => fetchKeys(true), [fetchKeys]);

    return { keys, loading, error, refresh };
};

export default useAuthKeys;
