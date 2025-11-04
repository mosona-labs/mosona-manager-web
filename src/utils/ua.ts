export type UAInfo = {
    device: 'Mobile' | 'Tablet' | 'Desktop';
    os: string;
    browser: string;
    version?: string;
};

const GetUAInfo = (ua: string = ''): UAInfo => {
    const s = (ua || '').toLowerCase();

    // device
    let device: UAInfo['device'] = 'Desktop';
    if (/tablet|ipad/i.test(s)) {
        device = 'Tablet';
    } else if (/mobile|android|iphone|phone|ipod/i.test(s)) {
        device = 'Mobile';
    }

    // os
    let os = 'Unknown';
    if (/windows nt/i.test(s)) os = 'Windows';
    else if (/android/i.test(s)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(s)) os = 'iOS';
    else if (/mac os x|macintosh/i.test(s)) os = 'macOS';
    else if (/cros|crios/i.test(s)) os = 'Chrome OS';
    else if (/linux/i.test(s)) os = 'Linux';

    // browser + version (ordered to avoid false positives)
    let browser = 'Unknown';
    let version: string | undefined;

    let m: RegExpExecArray | null;
    if ((m = /edg(e)?\/([\d.]+)/i.exec(s))) {
        browser = 'Edge';
        version = m[2];
    } else if ((m = /opr\/([\d.]+)/i.exec(s))) {
        browser = 'Opera';
        version = m[1];
    } else if ((m = /chrome\/([\d.]+)/i.exec(s))) {
        browser = 'Chrome';
        version = m[1];
    } else if ((m = /version\/([\d.]+).*safari/i.exec(s))) {
        browser = 'Safari';
        version = m[1];
    } else if ((m = /safari\/([\d.]+)/i.exec(s))) {
        browser = 'Safari';
        version = m[1];
    } else if ((m = /firefox\/([\d.]+)/i.exec(s))) {
        browser = 'Firefox';
        version = m[1];
    } else if ((m = /msie\s([\d.]+)/i.exec(s))) {
        browser = 'IE';
        version = m[1];
    } else if ((m = /trident.*rv:([\d.]+)/i.exec(s))) {
        browser = 'IE';
        version = m[1];
    }

    return { device, os, browser, version };
};

export default GetUAInfo;
