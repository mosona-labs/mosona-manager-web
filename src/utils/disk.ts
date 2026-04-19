import type { DiskStatusType, ServerStatusType } from '@/api/monitor';

type DiskUsageLike = {
    total_gb: number;
    used_gb: number;
};

const getStatusDisks = (status?: Pick<ServerStatusType, 'disks'> | null): DiskStatusType[] => {
    if (!Array.isArray(status?.disks)) {
        return [];
    }

    return [...status.disks]
        .filter(
            (disk): disk is DiskStatusType =>
                Boolean(disk) &&
                typeof disk.mp === 'string' &&
                typeof disk.total_gb === 'number' &&
                typeof disk.used_gb === 'number'
        )
        .sort((a, b) => {
            if (a.mp === b.mp) return 0;
            if (a.mp === '/') return -1;
            if (b.mp === '/') return 1;
            return 0;
        });
};

const getDiskUsagePercentage = (disk?: DiskUsageLike | null) => {
    if (!disk || disk.total_gb <= 0) {
        return 0;
    }

    return Math.round((disk.used_gb / disk.total_gb) * 10000) / 100;
};

const getDiskLabel = (index: number) => `Disk ${index + 1}`;

export { getStatusDisks, getDiskUsagePercentage, getDiskLabel };
