import { type ReactNode, useEffect, useState, useRef } from 'react';

import { Switch } from '@/components/ui/switch.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { cn } from '@/lib/utils.ts';
import { useAlert } from '@/page/dashboard/hook/useAlert.tsx';
import ApiAlert from '@/api/alert.ts';
import { ToastError } from '@/utils/toast.ts';

const AlertItem = ({
    server_id,
    item,
    icon,
    title,
    description,
    showThreshold = true,
    defaultThreshold = 80,
    maxThreshold = 100,
    thresholdUnit = '%',
    thresholdStep = 1,
    defaultDuration = 10,
}: {
    server_id: number;
    item: string;
    icon: ReactNode;
    title: string;
    description: string;
    showThreshold?: boolean;
    defaultThreshold?: number;
    maxThreshold?: number;
    thresholdUnit?: string;
    thresholdStep?: number;
    defaultDuration?: number;
}) => {
    const { alerts, refresh } = useAlert();

    const [enabled, setEnabled] = useState<boolean>(false);
    const [threshold, setThreshold] = useState<number>(defaultThreshold);
    const [duration, setDuration] = useState<number>(defaultDuration);
    const debounceTimerRef = useRef<number | null>(null);
    const isInitialLoadRef = useRef<boolean>(true);
    const prevEnabledRef = useRef<boolean>(false);

    useEffect(() => {
        const serverAlerts = alerts[server_id];
        if (serverAlerts && item in serverAlerts) {
            const alert = serverAlerts[item as keyof typeof serverAlerts];
            setEnabled(true);
            setThreshold(alert?.threshold || defaultThreshold);
            setDuration(alert?.for_duration || defaultDuration);
        } else {
            setEnabled(false);
        }
        isInitialLoadRef.current = false;
    }, [alerts, server_id, item]);

    useEffect(() => {
        if (isInitialLoadRef.current) {
            prevEnabledRef.current = enabled;
            return;
        }
        if (prevEnabledRef.current === enabled) return;
        prevEnabledRef.current = enabled;

        if (!enabled) {
            setThreshold(defaultThreshold);
            setDuration(defaultDuration);

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }

            ApiAlert.del(server_id, item)
                .then(() => {
                    void refresh();
                })
                .catch(ToastError);
        } else {
            ApiAlert.set(server_id, item, threshold, duration)
                .then(() => {
                    void refresh();
                })
                .catch(ToastError);
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled || isInitialLoadRef.current) return;
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            ApiAlert.set(server_id, item, threshold, duration)
                .then(() => {
                    void refresh();
                })
                .catch(ToastError);
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [threshold, duration]);

    return (
        <div className={cn('border rounded-md py-3 px-4', enabled ? 'bg-muted/30' : '')}>
            <div
                className={'flex flex-row justify-between items-center cursor-pointer select-none'}
                onClick={() => {
                    setEnabled(!enabled);
                }}
            >
                <div className={'space-y-1'}>
                    <div className={'font-semibold flex flex-row items-center gap-2'}>
                        {icon}
                        {title}
                    </div>
                    {!enabled && <p className={'text-sm text-muted-foreground'}>{description}</p>}
                </div>
                <Switch checked={enabled} onCheckedChange={(v) => setEnabled(v)} />
            </div>
            {enabled && (
                <div className={'flex flex-row w-full gap-4'}>
                    {showThreshold && (
                        <div className={'py-2 space-y-2.5 flex-1'}>
                            <div className={'text-muted-foreground text-sm font-semibold'}>
                                Average exceeds{' '}
                                <span className={'text-accent-foreground'}>
                                    {threshold}
                                    {thresholdUnit}
                                </span>
                            </div>
                            <Slider
                                value={[threshold]}
                                onValueChange={(e) => {
                                    setThreshold(e[0]);
                                }}
                                min={0}
                                max={maxThreshold}
                                step={thresholdStep}
                            />
                        </div>
                    )}
                    <div className={'py-2 space-y-2.5 flex-1'}>
                        <div className={'text-muted-foreground text-sm font-semibold'}>
                            For <span className={'text-accent-foreground'}>{duration}</span> minutes
                        </div>
                        <Slider
                            value={[duration]}
                            onValueChange={(e) => {
                                setDuration(e[0]);
                            }}
                            min={1}
                            max={120}
                            step={1}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertItem;
