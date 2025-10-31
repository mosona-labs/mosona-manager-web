const NetUnit = (value: number, base: 'kb' | 'mb' | 'gb') => {
    let v: number, u: string;
    let m: number = 1;
    switch (base) {
        case 'kb':
            if (value < 1024) {
                v = value;
                u = 'KB';
            } else if (value < 1024 * 1024) {
                v = value / 1024;
                u = 'MB';
                m = 1024;
            } else {
                v = value / (1024 * 1024);
                u = 'GB';
                m = 1024 * 1024;
            }
            break;
        case 'mb':
            if (value < 1024) {
                v = value;
                u = 'MB';
            } else if (value < 1024 * 1024) {
                v = value / 1024;
                u = 'GB';
                m = 1024;
            } else {
                v = value / (1024 * 1024);
                u = 'TB';
                m = 1024 * 1024;
            }
            break;
        case 'gb':
            if (value < 1024) {
                v = value;
                u = 'GB';
            } else {
                v = value / 1024;
                u = 'TB';
                m = 1024;
            }
            break;
    }
    return {
        value: v.toFixed(2),
        unit: u,
        multiple: m,
    };
};

export { NetUnit };
