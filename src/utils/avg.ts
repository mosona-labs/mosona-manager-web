const timeFrameWindowSize = (timeFrame: string) => {
    switch (timeFrame) {
        case '1h':
            return 60;
        case '12h':
            return 120;
        case '24h':
            return 240;
        case '7d':
            return 7;
        default:
            return 1;
    }
};

const windowAverage = (values: any[], key: string, window: number) => {
    const result: any[] = [];
    for (let i = 0; i <= values.length; i += window) {
        const windowSlice = values.slice(i, i + window);
        const avg = windowSlice.reduce((a, b) => a + b[key], 0) / window;
        result.push({
            time: String(windowSlice[0]?.time),
            value: avg,
        });
    }
    return result;
};

const windowMax = (values: any[], key: string, window: number) => {
    const result: any[] = [];
    for (let i = 0; i <= values.length; i += window) {
        const windowSlice = values.slice(i, i + window);
        const max = Math.max(...windowSlice.map((item) => item[key]));
        if (windowSlice[0]?.time)
            result.push({
                time: String(windowSlice[0]?.time),
                value: max,
            });
    }
    return result;
};

export { timeFrameWindowSize, windowAverage, windowMax };
