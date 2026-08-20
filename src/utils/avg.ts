const timeFrameWindowSize = (timeFrame: string): number => {
    switch (timeFrame) {
        case '1h':
            return 60; // ~1 point / 1 min
        case '12h':
            return 120; // ~1 point / 6 min
        case '24h':
            return 240; // ~1 point / 6 min
        case '7d':
            return 336; // ~1 point / 30 min
        case '30d':
            return 360; // ~1 point / 2 h
        case '180d':
            return 360; // ~1 point / 12 h
        case '365d':
            return 365;
        default:
            return 1;
    }
};

const itemsPerWindow = (sampleCount: number, targetPoints: number): number => {
    if (targetPoints <= 0 || sampleCount <= targetPoints) return 1;
    return Math.max(1, Math.floor(sampleCount / targetPoints));
};

const windowAverage = (values: any[], key: string, window: number) => {
    const result: any[] = [];
    const size = Math.max(1, window);
    for (let i = 0; i < values.length; i += size) {
        const first = values[i];
        if (!first?.time) continue;

        let sum = 0;
        let count = 0;
        for (let j = i; j < values.length && j < i + size; j++) {
            sum += Number(values[j][key] ?? 0);
            count++;
        }
        result.push({
            time: String(first.time),
            value: count > 0 ? sum / count : 0,
        });
    }
    return result;
};

const windowMax = (values: any[], key: string, window: number) => {
    const result: any[] = [];
    const size = Math.max(1, window);
    for (let i = 0; i < values.length; i += size) {
        const first = values[i];
        if (!first?.time) continue;

        let max = -Infinity;
        for (let j = i; j < values.length && j < i + size; j++) {
            const value = Number(values[j][key] ?? 0);
            if (value > max) max = value;
        }
        result.push({
            time: String(first.time),
            value: max === -Infinity ? 0 : max,
        });
    }
    return result;
};

export { timeFrameWindowSize, itemsPerWindow, windowAverage, windowMax };
