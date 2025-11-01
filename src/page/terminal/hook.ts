import { useCallback, useEffect, useMemo, useState } from 'react';

import { ToastError } from '@/utils/toast';
import ApiTerminal, { type TerminalType } from '@/api/terminal';

export default function useTerminals() {
    const [isLoading, setIsLoading] = useState(true);
    const [servers, setServers] = useState<TerminalType[]>([]);

    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

    const categoryServerMap = useMemo(() => {
        const map: Record<number, TerminalType[]> = {};
        for (const s of servers) {
            if (!map[s.category]) map[s.category] = [];
            map[s.category].push(s);
        }
        return map;
    }, [servers]);

    const fetchData = useCallback(() => {
        ApiTerminal.list()
            .then((data) => {
                setServers(data.data);
            })
            .catch(ToastError)
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        isLoading,
        servers,
        categoryServerMap,
        categoryFilter,
        setCategoryFilter,
        refresh: fetchData,
    } as const;
}
