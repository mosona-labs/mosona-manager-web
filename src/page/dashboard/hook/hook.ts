import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { type MonitorType, type ServerStatusType } from '@/api/monitor.ts';
import { useUser } from '@/context/useUser.tsx';
import { SERVER_MUTATION_EVENT } from '@/utils/server-events';

export default function useMonitors() {
    const { team } = useUser();
    const navigator = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [time, setTime] = useState<Date>(new Date());
    const [servers, setServers] = useState<MonitorType[]>([]);
    const [statuses, setStatuses] = useState<Record<number, ServerStatusType>>({});
    const [total, setTotal] = useState(0);
    const [online, setOnline] = useState(0);
    const [avgCpu, setAvgCpu] = useState(0);
    const [avgMemory, setAvgMemory] = useState(0);
    const [sumRX, setSumRX] = useState(0);
    const [sumTX, setSumTX] = useState(0);

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
        let visibleServerCount = 0,
            totalCount = 0,
            onlineCount = 0,
            cpuAcc = 0,
            memAcc = 0,
            rxAcc = 0,
            txAcc = 0;

        for (const server of servers) {
            if (categoryFilter !== null && server.category !== categoryFilter) {
                continue;
            }

            visibleServerCount++;
            const status = statuses[server.id];
            if (status) {
                totalCount++;
                const nowMs = time.getTime();
                if (nowMs - new Date(status.time).getTime() < 5 * 1000) {
                    onlineCount++;
                    cpuAcc = cpuAcc + status.cpu;
                    memAcc = memAcc + (status.mem_used_mb / status.mem_total_mb) * 100;
                    rxAcc = rxAcc + status.rx_kib_s;
                    txAcc = txAcc + status.tx_kib_s;
                }
            }
        }
        cpuAcc = totalCount > 0 ? cpuAcc / totalCount : 0;
        memAcc = totalCount > 0 ? memAcc / totalCount : 0;

        setTotal(visibleServerCount);
        setOnline(onlineCount);
        setAvgCpu(cpuAcc);
        setAvgMemory(memAcc);
        setSumRX(rxAcc);
        setSumTX(txAcc);
    }, [servers, statuses, time, categoryFilter]);

    const reconnectInterval = useRef<number | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const heartbeatTimeout = useRef<number | null>(null);

    const subscribe = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        if (reconnectInterval.current) {
            clearTimeout(reconnectInterval.current);
            reconnectInterval.current = null;
        }
        if (heartbeatTimeout.current) {
            clearTimeout(heartbeatTimeout.current);
            heartbeatTimeout.current = null;
        }

        const eventSource = new EventSource('/api/v1/server/monitor/sse');
        eventSourceRef.current = eventSource;

        const resetHeartbeat = () => {
            if (heartbeatTimeout.current) clearTimeout(heartbeatTimeout.current); // Ref
            heartbeatTimeout.current = setTimeout(() => {
                toast.error('Connection lost', {
                    description: 'Client will try to reconnect at 5 seconds interval.',
                });
                setIsLoading(true);
                eventSource.close();
                reconnectInterval.current = setTimeout(() => {
                    subscribe();
                }, 5000);
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
            setIsLoading(false);
            resetHeartbeat();
        });

        eventSource.addEventListener('error', () => {
            fetch('/api/v1/server/monitor/sse')
                .then(async (res) => {
                    const data = await res.json();
                    if (data.code === 'login') navigator('/auth');
                })
                .finally(resetHeartbeat);
        });

        return () => {
            if (heartbeatTimeout.current) clearTimeout(heartbeatTimeout.current);
            eventSource.close();
            if (reconnectInterval.current) {
                clearTimeout(reconnectInterval.current);
            }
        };
    }, [navigator, team]);

    useEffect(() => {
        return subscribe();
    }, [subscribe]);

    useEffect(() => {
        window.addEventListener(SERVER_MUTATION_EVENT, subscribe);
        return () => {
            window.removeEventListener(SERVER_MUTATION_EVENT, subscribe);
        };
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
        sumRX,
        sumTX,
        categoryServerMap,
        categoryFilter,
        setCategoryFilter,
    } as const;
}
