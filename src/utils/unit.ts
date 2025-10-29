const NetUnit = (value: number, base: 'kib' | 'mb') => {
    let v: number, u: string;
    if (base === 'kib') {
        if (value < 1024) {
            v = value;
            u = 'KiB';
        } else if (value < 1024 * 1024) {
            v = value / 1024;
            u = 'MiB';
        } else {
            v = value / (1024 * 1024);
            u = 'GiB';
        }
    } else {
        if (value < 1024) {
            v = value;
            u = 'MB';
        } else if (value < 1024 * 1024) {
            v = value / 1024;
            u = 'GB';
        } else {
            v = value / (1024 * 1024);
            u = 'TB';
        }
    }
    return {
        value: v.toFixed(2),
        unit: u,
    };
};

export { NetUnit };
