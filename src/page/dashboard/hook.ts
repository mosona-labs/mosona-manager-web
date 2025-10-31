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

    const fetchData = useCallback(() => {
        ApiMonitor.list()
            .then((data) => {
                setTime(new Date(data.data.now * 1000));
                setServers(data.data.servers);
                setStatuses(data.data.status);

                let totalCount = 0,
                    onlineCount = 0,
                    cpuAcc = 0,
                    memAcc = 0;

                for (const server of data.data.servers) {
                    const status = data.data.status[server.id];
                    if (status) {
                        totalCount++;
                        const nowMs = data.data.now * 1000;
                        if (nowMs - new Date(status.time).getTime() < 5 * 1000) {
                            onlineCount++;
                            cpuAcc = cpuAcc + status.cpu / data.data.servers.length;
                            memAcc =
                                memAcc +
                                ((status.mem_used_mb / status.mem_total_mb) * 100) /
                                    data.data.servers.length;
                        }
                    }
                }

                setTotal(totalCount);
                setOnline(onlineCount);
                setAvgCpu(cpuAcc);
                setAvgMemory(memAcc);
            })
            .catch(ToastError)
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchData();
        const id = window.setInterval(fetchData, pollInterval);
        return () => window.clearInterval(id);
    }, [fetchData, pollInterval]);

    const categoryServerMap = useMemo(() => {
        const map: Record<number, MonitorType[]> = {};
        for (const s of servers) {
            if (!map[s.category]) map[s.category] = [];
            map[s.category].push(s);
        }
        return map;
    }, [servers]);

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
        refresh: fetchData,
    } as const;
}
