import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { type MonitorType, type ServerStatusType } from '@/api/monitor.ts';
import { useUser } from '@/context/useUser.tsx';
import { SERVER_MUTATION_EVENT } from '@/utils/server-events';

const ONLINE_THRESHOLD_MS = 5 * 1000;
const SSE_STALE_TIMEOUT_MS = 30 * 1000;
const SSE_RECONNECT_DELAY_MS = 5 * 1000;
const MIN_COMMIT_INTERVAL_MS = 1000;

type MonitorSnapshot = {
    servers?: MonitorType[];
    status: Record<number, ServerStatusType>;
    now: number;
};

// Reference stabilization helpers.
// Every SSE frame replaces the entire snapshot with freshly parsed objects.
// Re-using the previous references for the parts that did not change lets
// memoized components (server cards) skip re-rendering entirely.

const isSameServer = (a: MonitorType, b: MonitorType): boolean => {
    if (a === b) return true;
    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;
    for (const key of keysA) {
        if (a[key as keyof MonitorType] !== b[key as keyof MonitorType]) return false;
    }
    return true;
};

const isSameDisk = (
    a: { mp: string; total_gb: number; used_gb: number },
    b: { mp: string; total_gb: number; used_gb: number }
) => a === b || (a.mp === b.mp && a.total_gb === b.total_gb && a.used_gb === b.used_gb);

// Compares only the fields the cards actually render (see ServerStatusType in
// src/api/monitor.ts; keep this list in sync when new rendered fields are
// added). `time` changes every frame for live servers and does not drive
// rendering there, so it is only compared once the report is stale — offline
// cards show it as the "last seen" label. A freshness change (live <-> stale)
// always counts as a change so online badges stay correct.
const isSameStatus = (a: ServerStatusType, b: ServerStatusType, nowMs: number): boolean => {
    if (a === b) return true;
    if (
        a.cpu !== b.cpu ||
        a.mem_total_mb !== b.mem_total_mb ||
        a.mem_used_mb !== b.mem_used_mb ||
        a.swap_total_mb !== b.swap_total_mb ||
        a.swap_used_mb !== b.swap_used_mb ||
        a.disk_read_kib_s !== b.disk_read_kib_s ||
        a.disk_write_kib_s !== b.disk_write_kib_s ||
        a.disk_read_iops !== b.disk_read_iops ||
        a.disk_write_iops !== b.disk_write_iops ||
        a.rx_kib_s !== b.rx_kib_s ||
        a.tx_kib_s !== b.tx_kib_s ||
        a.rx_total_mb !== b.rx_total_mb ||
        a.tx_total_mb !== b.tx_total_mb ||
        a.tcp_total !== b.tcp_total ||
        a.udp_total !== b.udp_total
    ) {
        return false;
    }
    const aLive = nowMs - new Date(a.time).getTime() < ONLINE_THRESHOLD_MS;
    const bLive = nowMs - new Date(b.time).getTime() < ONLINE_THRESHOLD_MS;
    if (aLive !== bLive || (!bLive && a.time !== b.time)) return false;
    const disksA = a.disks;
    const disksB = b.disks;
    if (disksA === disksB) return true;
    if (!disksA || !disksB || disksA.length !== disksB.length) return false;
    for (let i = 0; i < disksA.length; i++) {
        if (!isSameDisk(disksA[i], disksB[i])) return false;
    }
    return true;
};

const stabilizeServers = (prev: MonitorType[], next: MonitorType[]): MonitorType[] => {
    if (prev === next) return prev;
    if (prev.length !== next.length) return next;
    let changed = false;
    const merged: MonitorType[] = new Array(next.length);
    for (let i = 0; i < next.length; i++) {
        if (isSameServer(prev[i], next[i])) {
            merged[i] = prev[i];
        } else {
            merged[i] = next[i];
            changed = true;
        }
    }
    return changed ? merged : prev;
};

const stabilizeStatuses = (
    prev: Record<number, ServerStatusType>,
    next: Record<number, ServerStatusType>,
    nowMs: number
): Record<number, ServerStatusType> => {
    if (prev === next) return prev;
    const prevRecord = prev as Record<string, ServerStatusType>;
    const nextRecord = next as Record<string, ServerStatusType>;
    const nextKeys = Object.keys(nextRecord);
    let changed = nextKeys.length !== Object.keys(prevRecord).length;
    const merged: Record<number, ServerStatusType> = {};
    for (const key of nextKeys) {
        const id = Number(key);
        const prevStatus = prevRecord[key];
        const nextStatus = nextRecord[key];
        if (prevStatus && isSameStatus(prevStatus, nextStatus, nowMs)) {
            merged[id] = prevStatus;
        } else {
            merged[id] = nextStatus;
            changed = true;
        }
    }
    return changed ? merged : prev;
};

export default function useMonitors() {
    const { team } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [time, setTime] = useState<Date>(new Date());
    const [servers, setServers] = useState<MonitorType[]>([]);
    const [statuses, setStatuses] = useState<Record<number, ServerStatusType>>({});
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

    // Snapshot committing (throttled): SSE frames arriving faster than
    // MIN_COMMIT_INTERVAL_MS are coalesced, only the latest one is committed.

    const pendingSnapshotRef = useRef<MonitorSnapshot | null>(null);
    const commitTimerRef = useRef<number | null>(null);
    const lastCommitAtRef = useRef(0);

    const clearCommitTimer = useCallback(() => {
        if (commitTimerRef.current !== null) {
            window.clearTimeout(commitTimerRef.current);
            commitTimerRef.current = null;
        }
    }, []);

    const commitSnapshot = useCallback((snapshot: MonitorSnapshot) => {
        setTime(new Date(snapshot.now * 1000));
        if (snapshot.servers) {
            const incoming = snapshot.servers;
            setServers((prev) => stabilizeServers(prev, incoming));
        }
        const incomingStatuses = snapshot.status;
        setStatuses((prev) => stabilizeStatuses(prev, incomingStatuses, snapshot.now * 1000));
        setIsLoading(false);
    }, []);

    const flushSnapshot = useCallback(() => {
        clearCommitTimer();
        const snapshot = pendingSnapshotRef.current;
        if (!snapshot) return;
        pendingSnapshotRef.current = null;
        lastCommitAtRef.current = Date.now();
        commitSnapshot(snapshot);
    }, [clearCommitTimer, commitSnapshot]);

    const queueSnapshot = useCallback(
        (snapshot: MonitorSnapshot) => {
            pendingSnapshotRef.current = snapshot;
            const delay = MIN_COMMIT_INTERVAL_MS - (Date.now() - lastCommitAtRef.current);
            if (delay <= 0) {
                flushSnapshot();
                return;
            }
            if (commitTimerRef.current === null) {
                commitTimerRef.current = window.setTimeout(() => {
                    commitTimerRef.current = null;
                    flushSnapshot();
                }, delay);
            }
        },
        [flushSnapshot]
    );

    const categoryServerMap = useMemo(() => {
        const map: Record<number, MonitorType[]> = {};
        for (const s of servers) {
            if (!map[s.category]) map[s.category] = [];
            map[s.category].push(s);
        }
        return map;
    }, [servers]);

    // Online set for card badges, keyed by a signature string so the Set keeps
    // a stable reference (memoized cards skip re-rendering) until membership
    // actually changes.
    const onlineSignature = useMemo(() => {
        const nowMs = time.getTime();
        const ids: number[] = [];
        for (const server of servers) {
            const status = statuses[server.id];
            if (status && nowMs - new Date(status.time).getTime() < ONLINE_THRESHOLD_MS) {
                ids.push(server.id);
            }
        }
        return ids.join(',');
    }, [servers, statuses, time]);
    const onlineIds = useMemo(
        () => new Set(onlineSignature ? onlineSignature.split(',').map(Number) : []),
        [onlineSignature]
    );

    // Overview statistics, derived instead of mirrored into state.
    const { total, online, avgCpu, avgMemory, sumRX, sumTX } = useMemo(() => {
        let visibleCount = 0;
        let withStatusCount = 0;
        let onlineCount = 0;
        let cpuAcc = 0;
        let memAcc = 0;
        let rxAcc = 0;
        let txAcc = 0;

        const nowMs = time.getTime();
        for (const server of servers) {
            if (categoryFilter !== null && server.category !== categoryFilter) {
                continue;
            }

            visibleCount++;
            const status = statuses[server.id];
            if (!status) continue;

            withStatusCount++;
            if (nowMs - new Date(status.time).getTime() < ONLINE_THRESHOLD_MS) {
                onlineCount++;
                cpuAcc = cpuAcc + status.cpu;
                memAcc = memAcc + (status.mem_used_mb / status.mem_total_mb) * 100;
                rxAcc = rxAcc + status.rx_kib_s;
                txAcc = txAcc + status.tx_kib_s;
            }
        }

        return {
            total: visibleCount,
            online: onlineCount,
            avgCpu: withStatusCount > 0 ? cpuAcc / withStatusCount : 0,
            avgMemory: withStatusCount > 0 ? memAcc / withStatusCount : 0,
            sumRX: rxAcc,
            sumTX: txAcc,
        };
    }, [servers, statuses, time, categoryFilter]);

    // SSE subscription

    const reconnectInterval = useRef<number | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const heartbeatTimeout = useRef<number | null>(null);
    const mockIntervalRef = useRef<number | null>(null);
    const mockGenerationRef = useRef(0);

    // The mock fleet's interval lives in a ref so that every (re)subscribe
    // cleans up the previous one, and a generation counter guards the async
    // module load: a subscribe that supersedes a still-pending import()
    // invalidates its callback, so the superseded interval is never created.
    // SERVER_MUTATION_EVENT invokes subscribe directly and discards its return
    // value, so relying on the effect cleanup alone would leak one interval
    // per mutation.
    const stopMockSource = useCallback(() => {
        if (mockIntervalRef.current !== null) {
            window.clearInterval(mockIntervalRef.current);
            mockIntervalRef.current = null;
        }
    }, []);

    const subscribe = useCallback(() => {
        clearCommitTimer();
        stopMockSource();
        pendingSnapshotRef.current = null;
        // Invalidates any still-pending mock import from a previous subscribe.
        const mockGeneration = ++mockGenerationRef.current;

        // Dev-only mock fleet (?mock=100) for dashboard profiling. The
        // `import.meta.env.DEV` guard is statically eliminated in production
        // builds, and the mock module is loaded on demand so it never ships
        // in the bundle. `?mock=0` (or any non-positive/invalid value)
        // disables the fleet and falls through to the real SSE stream below.
        if (
            import.meta.env.DEV &&
            Number(new URLSearchParams(window.location.search).get('mock')) > 0
        ) {
            let cancelled = false;
            void import('./mock.ts').then(({ createMockSnapshot, getMockServerCount }) => {
                if (cancelled || mockGeneration !== mockGenerationRef.current) return;
                const count = getMockServerCount();
                const push = () => queueSnapshot(createMockSnapshot(count));
                push();
                mockIntervalRef.current = window.setInterval(push, 3000);
            });
            return () => {
                cancelled = true;
                stopMockSource();
                clearCommitTimer();
            };
        }

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
                    description: 'Client will try to reconnect in 5 seconds.',
                });
                setIsLoading(true);
                eventSource.close();
                reconnectInterval.current = setTimeout(() => {
                    subscribe();
                }, SSE_RECONNECT_DELAY_MS);
            }, SSE_STALE_TIMEOUT_MS);
        };

        eventSource.addEventListener('open', () => {
            resetHeartbeat();
        });

        eventSource.addEventListener('update', (event) => {
            queueSnapshot(JSON.parse(event.data));
            resetHeartbeat();
        });

        eventSource.addEventListener('revoked', () => {
            eventSource.close();
            if (heartbeatTimeout.current) clearTimeout(heartbeatTimeout.current);
            if (reconnectInterval.current) clearTimeout(reconnectInterval.current);
            window.location.replace('/');
        });

        eventSource.addEventListener('error', () => {
            resetHeartbeat();
        });

        return () => {
            if (heartbeatTimeout.current) clearTimeout(heartbeatTimeout.current);
            eventSource.close();
            if (reconnectInterval.current) {
                clearTimeout(reconnectInterval.current);
            }
            clearCommitTimer();
        };
    }, [team, queueSnapshot, clearCommitTimer, stopMockSource]);

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
        servers,
        statuses,
        onlineIds,
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
