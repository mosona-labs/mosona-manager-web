import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const ConnectChecker = () => {
    const { t } = useTranslation();
    const [isConnected, setIsConnected] = useState(false);
    const [pingHistory, setPingHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        const ping = async (start: number) => {
            try {
                const res = await fetch('/api/ping', { method: 'GET', cache: 'no-cache' });
                if (!res.ok) {
                    setIsConnected(false);
                    setPingHistory((prev) => [...prev.slice(-9), -1]);
                    return;
                }
                const latency = Date.now() - start;
                setIsConnected(true);
                setPingHistory((prev) => [...prev.slice(-9), latency]);
            } catch {
                setIsConnected(false);
                setPingHistory((prev) => [...prev.slice(-9), -1]);
            }
        };
        const start = Date.now();
        ping(start);
        const interval = setInterval(async () => {
            const start = Date.now();
            await ping(start);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <span className={isConnected ? 'text-green-500' : 'text-red-500'}>◉</span>
                    {isConnected ? t('common.connected') : t('common.disconnected')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-38 mt-1">
                <div className="grid gap-2">
                    <h4 className="leading-none font-medium">{t('status.network')}</h4>
                    <div className="space-y-1 text-muted-foreground">
                        <p className="text-sm">
                            {pingHistory.length > 0
                                ? pingHistory[pingHistory.length - 1] >= 0
                                    ? `${pingHistory[pingHistory.length - 1].toFixed(2)} ms`
                                    : t('common.failed')
                                : 'N/A'}{' '}
                            <br />
                            {pingHistory.length > 0
                                ? pingHistory.length >= 0
                                    ? `${(
                                          pingHistory.reduce((a, b) => (b > 0 ? a + b : a), 0) /
                                          pingHistory.filter((p) => p > 0).length
                                      ).toFixed(2)} ms`
                                    : t('common.failed')
                                : 'N/A'}
                        </p>
                        <div className="mt-2.5 flex flex-row gap-1">
                            {pingHistory.map((ping, index) => (
                                <div
                                    key={index}
                                    className={`h-4 w-2 rounded-sm ${
                                        ping > 0
                                            ? `bg-green-500`
                                            : ping === 0
                                              ? `bg-gray-500`
                                              : `bg-red-500`
                                    }`}
                                    style={{
                                        height:
                                            ping >= 0 ? Math.min(Math.max(ping / 10, 4), 40) : 4,
                                    }}
                                    title={ping >= 0 ? `${ping} ms` : t('status.pingFailed')}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default memo(ConnectChecker);
