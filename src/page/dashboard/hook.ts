import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { type MonitorType, type ServerStatusType } from '@/api/monitor';

export default function useMonitors() {
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

    const reconnectInterval = useRef<number | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const subscribe = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        if (reconnectInterval.current) {
            clearTimeout(reconnectInterval.current);
            reconnectInterval.current = null;
        }

        const eventSource = new EventSource('/api/v1/server/monitor/sse');
        eventSourceRef.current = eventSource;

        let heartbeatTimeout: number | null = null;

        const resetHeartbeat = () => {
            if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
            heartbeatTimeout = setTimeout(() => {
                toast.error('Connection lost', {
                    description: 'Client will try to reconnect at 3 seconds interval.',
                });
                setIsLoading(true);
                eventSource.close();
                reconnectInterval.current = setTimeout(() => {
                    subscribe();
                }, 3000);
            }, 10000);
        };

        eventSource.addEventListener('open', () => {
            resetHeartbeat();
        });

        eventSource.addEventListener('update', (event) => {
            const data = JSON.parse(event.data);

            setTime(new Date(data.now * 1000));
            setServers(data.servers);
            setStatuses(data.status);

            if (isLoading) setIsLoading(false);
            resetHeartbeat();
        });

        eventSource.addEventListener('error', () => {
            if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
            toast.error('Connection lost', {
                description: 'Client will try to reconnect at 3 seconds interval.',
            });
            setIsLoading(true);
            eventSource.close();
            reconnectInterval.current = setTimeout(() => {
                subscribe();
            }, 3000);
        });

        return () => {
            if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
            eventSource.close();
            if (reconnectInterval.current) {
                clearTimeout(reconnectInterval.current);
            }
        };
    }, [isLoading]);

    useEffect(() => {
        return subscribe();
    }, [subscribe]);

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
    } as const;
}
