const formatUptime = (openTime: string | Date): string => {
    if (!openTime) return '-';
    const start = new Date(openTime);
    if (isNaN(start.getTime())) return '-';
    let diffMs = Math.max(0, new Date().getTime() - start.getTime());
    const days = Math.floor(diffMs / (24 * 3600 * 1000));
    diffMs -= days * 24 * 3600 * 1000;
    const hours = Math.floor(diffMs / (3600 * 1000));
    diffMs -= hours * 3600 * 1000;
    const minutes = Math.floor(diffMs / (60 * 1000));
    return `${days}d ${hours}h ${minutes}m`;
};

const formatUptimeDays = (openTime: string | Date): number => {
    if (!openTime) return 0;
    const start = new Date(openTime);
    if (isNaN(start.getTime())) return 0;
    let diffMs = Math.max(0, new Date().getTime() - start.getTime());
    return parseFloat((diffMs / (24 * 3600 * 1000)).toFixed(1));
};

const getRemainingTime = (endTime: string | Date): number => {
    if (!endTime) return 0;
    const end = new Date(endTime);
    if (isNaN(end.getTime())) return 0;
    let diffMs = end.getTime() - new Date().getTime();
    return Math.floor(diffMs / (24 * 3600 * 1000));
};

export { formatUptime, formatUptimeDays, getRemainingTime };
