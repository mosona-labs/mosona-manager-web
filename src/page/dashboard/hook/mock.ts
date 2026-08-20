// Dev-only mock fleet for profiling the dashboard with a large number of servers.
// Loaded on demand by useMonitors (see hook.ts) behind a build-time DEV guard,
// so this module never ships in production bundles.
// Enable with `?mock=100` (server count) on a DEV build, e.g. http://localhost:5173/?mock=300
import type { MonitorType, ServerStatusType } from '@/api/monitor.ts';

const OS_LIST = [
    'Ubuntu 24.04 LTS',
    'Debian 12',
    'CentOS 9 Stream',
    'Alpine 3.20',
    'Rocky Linux 9',
    'Fedora 40',
];

const AREA_LIST = [
    ['US', 'Los Angeles'],
    ['US', 'Seattle'],
    ['DE', 'Frankfurt'],
    ['GB', 'London'],
    ['SG', 'Singapore'],
    ['JP', 'Tokyo'],
    ['HK', 'Hong Kong'],
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const getMockServerCount = (): number => {
    const raw = new URLSearchParams(window.location.search).get('mock');
    const parsed = Number(raw);
    // `?mock=0` (or any non-positive/invalid value) disables the mock fleet.
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(Math.floor(parsed), 1000);
};

let mockServers: MonitorType[] | null = null;
let mockStatuses: Record<number, ServerStatusType> = {};

export type MockSnapshot = {
    servers: MonitorType[];
    status: Record<number, ServerStatusType>;
    now: number;
};

export const createMockSnapshot = (count: number): MockSnapshot => {
    if (!mockServers || mockServers.length !== count) {
        mockServers = Array.from({ length: count }, (_, i) => {
            const [county, area] = AREA_LIST[i % AREA_LIST.length];
            return {
                id: 900000 + i,
                name: `mock-server-${String(i + 1).padStart(3, '0')}`,
                weight: 0,
                category: 1 + (i % 3),
                allow_terminal: true,
                os: OS_LIST[i % OS_LIST.length],
                county,
                area,
                open_time: new Date(Date.now() - rand(1, 300) * 86400000).toISOString(),
                note: '',
                provider: 'MockCloud',
                cycle: (i % 4) + 1,
                start_time: new Date(Date.now() - rand(1, 90) * 86400000).toISOString(),
                end_time: new Date(Date.now() + rand(1, 300) * 86400000).toISOString(),
                amount: String(Math.round(rand(3, 30))),
                auto_renew: i % 2 === 0,
                bandwidth: '1Gbps',
                traffic: '1TB',
                traffic_type: 0,
                note_public: '',
                core_c: 2 + (i % 14),
                core_t: 2 + (i % 16),
            };
        });
        mockStatuses = {};
    }

    const now = new Date();
    for (const server of mockServers) {
        const isStale = server.id % 13 === 0; // a fraction of servers appear offline
        const prev = mockStatuses[server.id];
        const cpu = prev ? Math.min(100, Math.max(0, prev.cpu + rand(-8, 8))) : rand(0, 60);
        const memUsed = prev
            ? Math.min(8192, Math.max(256, prev.mem_used_mb + rand(-256, 256)))
            : rand(512, 4096);
        mockStatuses[server.id] = {
            cpu,
            mem_total_mb: 8192,
            mem_used_mb: memUsed,
            swap_total_mb: 1024,
            swap_used_mb: Math.min(1024, Math.max(0, (prev?.swap_used_mb ?? 0) + rand(-32, 32))),
            disks: [
                { mp: '/', total_gb: 80, used_gb: rand(10, 70) },
                { mp: '/data', total_gb: 200, used_gb: rand(20, 180) },
            ],
            disk_read_kib_s: rand(0, 20480),
            disk_write_kib_s: rand(0, 20480),
            disk_read_iops: rand(0, 900),
            disk_write_iops: rand(0, 900),
            rx_kib_s: rand(0, 81920),
            tx_kib_s: rand(0, 81920),
            rx_total_mb: rand(0, 512000),
            tx_total_mb: rand(0, 512000),
            tcp_total: Math.round(rand(0, 2000)),
            udp_total: Math.round(rand(0, 200)),
            time: (isStale
                ? new Date(now.getTime() - 60_000)
                : new Date(now.getTime() - rand(0, 1500))
            ).toISOString(),
        };
    }

    return {
        servers: mockServers,
        status: { ...mockStatuses },
        now: Math.floor(now.getTime() / 1000),
    };
};
