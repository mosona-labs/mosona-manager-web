import { useCallback, useEffect, useMemo, useState } from 'react';

import ApiMonitor, { type MonitorType, type ServerStatusType } from '@/api/monitor';
import { ToastError } from '@/utils/toast';

export default function useMonitors(pollInterval = 3000) {
    const [isLoading, setIsLoading] = useState(true);
    const [time, setTime] = useState<Date>(new Date());
    const [servers, setServers] = useState<MonitorType[]>([]);
    const [statuses, setStatuses] = useState<Record<number, ServerStatusType>>({});
    const [total, setTotal] = useState(0);
    const [online, setOnline] = useState(0);
    const [avgCpu, setAvgCpu] = useState(0);
    const [avgMemory, setAvgMemory] = useState(0);

    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

    const categoryServerMap = useMemo(() => {
        const map: Record<number, MonitorType[]> = {};
        for (const s of servers) {
            if (!map[s.category]) map[s.category] = [];
            map[s.category].push(s);
        }
        return map;
    }, [servers]);

    const fetchData = useCallback(() => {
        ApiMonitor.list()
            .then((data) => {
                setTime(new Date(data.data.now * 1000));
                setServers(data.data.servers);
                setStatuses(data.data.status);
            })
            .catch(ToastError)
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        let totalCount = 0,
            onlineCount = 0,
            cpuAcc = 0,
            memAcc = 0;

        for (const server of servers) {
            if (categoryFilter !== null && server.category !== categoryFilter) {
                continue;
            }

            const status = statuses[server.id];
            if (status) {
                totalCount++;
                const nowMs = time.getTime();
                if (nowMs - new Date(status.time).getTime() < 5 * 1000) {
                    onlineCount++;
                    cpuAcc = cpuAcc + status.cpu / servers.length;
                    memAcc =
                        memAcc +
                        ((status.mem_used_mb / status.mem_total_mb) * 100) / servers.length;
                }
            }
        }

        setTotal(totalCount);
        setOnline(onlineCount);
        setAvgCpu(cpuAcc);
        setAvgMemory(memAcc);
    }, [servers, categoryFilter]);

    useEffect(() => {
        fetchData();
        const id = window.setInterval(fetchData, pollInterval);
        return () => window.clearInterval(id);
    }, [fetchData, pollInterval]);

    return {
        isLoading,
        time,
        servers,
        statuses,
        total,
        online,
        avgCpu,
        avgMemory,
        categoryServerMap,
        categoryFilter,
        setCategoryFilter,
        refresh: fetchData,
    } as const;
}
