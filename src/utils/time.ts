const formatUptime = (openTime: string, now: Date): string => {
    if (!openTime) return '-';
    const start = new Date(openTime);
    if (isNaN(start.getTime())) return '-';
    let diffMs = Math.max(0, now.getTime() - start.getTime());
    const days = Math.floor(diffMs / (24 * 3600 * 1000));
    diffMs -= days * 24 * 3600 * 1000;
    const hours = Math.floor(diffMs / (3600 * 1000));
    diffMs -= hours * 3600 * 1000;
    const minutes = Math.floor(diffMs / (60 * 1000));
    return `${days}d ${hours}h ${minutes}m`;
};

export { formatUptime };
