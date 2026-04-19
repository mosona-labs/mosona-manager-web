import type { AlertItemConfigType } from '@/api/alert.ts';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import ApiAlert from '@/api/alert.ts';
import { Switch } from '@/components/ui/switch.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { cn } from '@/lib/utils.ts';
import { useAlert } from '@/page/dashboard/hook/useAlert.tsx';
import { ToastError } from '@/utils/toast.ts';

const AlertItem = ({
    alertTargetId,
    scope,
    config,
    icon,
    override,
}: {
    alertTargetId: number;
    scope: 'server' | 'team';
    config: AlertItemConfigType;
    icon: ReactNode;
    override: boolean;
}) => {
    const { alerts, teamAlerts, refresh } = useAlert();

    const currentAlerts = scope === 'team' ? teamAlerts : alerts[alertTargetId];
    const currentAlert = currentAlerts?.[config.item];
    const thresholdEnabled = config.threshold.enabled;
    const durationEnabled = config.for_duration.enabled;
    const defaultThreshold = config.threshold.default ?? config.threshold.min ?? 0;
    const defaultDuration = config.for_duration.default ?? config.for_duration.min ?? 0;
    const sliderThresholdMax = config.threshold.max ?? defaultThreshold;
    const sliderDurationMax = config.for_duration.max ?? defaultDuration;

    const [enabled, setEnabled] = useState(false);
    const [threshold, setThreshold] = useState(defaultThreshold);
    const [duration, setDuration] = useState(defaultDuration);
    const debounceTimerRef = useRef<number | null>(null);
    const isSyncingRef = useRef(true);
    const prevEnabledRef = useRef(false);

    const effectiveOverride = scope === 'team' ? override : false;
    const normalizedDuration = durationEnabled ? duration : 0;
    const normalizedThreshold = thresholdEnabled ? threshold : defaultThreshold;

    const thresholdText = useMemo(
        () => formatValue(threshold, config.threshold.unit),
        [threshold, config.threshold.unit]
    );
    const durationText = useMemo(
        () => formatValue(duration, config.for_duration.unit),
        [duration, config.for_duration.unit]
    );

    useEffect(() => {
        isSyncingRef.current = true;

        if (currentAlert) {
            setEnabled(true);
            setThreshold(currentAlert.threshold ?? defaultThreshold);
            setDuration(
                durationEnabled ? (currentAlert.for_duration ?? defaultDuration) : defaultDuration
            );
            prevEnabledRef.current = true;
        } else {
            setEnabled(false);
            setThreshold(defaultThreshold);
            setDuration(defaultDuration);
            prevEnabledRef.current = false;
        }

        const timer = window.setTimeout(() => {
            isSyncingRef.current = false;
        }, 0);

        return () => window.clearTimeout(timer);
    }, [currentAlert, defaultDuration, defaultThreshold, durationEnabled]);

    useEffect(() => {
        if (isSyncingRef.current) {
            return;
        }
        if (prevEnabledRef.current === enabled) return;
        prevEnabledRef.current = enabled;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        if (!enabled) {
            setThreshold(defaultThreshold);
            setDuration(defaultDuration);

            ApiAlert.del(alertTargetId, config.item, effectiveOverride)
                .then((res) => {
                    void refresh();
                    if (scope === 'team') {
                        toast.success('Team alert disabled', {
                            description:
                                'There are currently ' +
                                res.data +
                                ' servers using the team alert settings.',
                        });
                    }
                })
                .catch(ToastError);
        } else {
            ApiAlert.set(
                alertTargetId,
                config.item,
                normalizedThreshold,
                normalizedDuration,
                effectiveOverride
            )
                .then((res) => {
                    void refresh();
                    if (scope === 'team') {
                        toast.success('Team alert enabled', {
                            description:
                                'There are currently ' +
                                res.data +
                                ' servers using the team alert settings.',
                        });
                    }
                })
                .catch(ToastError);
        }
    }, [
        alertTargetId,
        config.item,
        defaultDuration,
        defaultThreshold,
        effectiveOverride,
        enabled,
        normalizedDuration,
        normalizedThreshold,
        refresh,
        scope,
    ]);

    useEffect(() => {
        if (!enabled || isSyncingRef.current) return;

        if (
            currentAlert?.threshold === normalizedThreshold &&
            currentAlert?.for_duration === normalizedDuration
        ) {
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            ApiAlert.set(
                alertTargetId,
                config.item,
                normalizedThreshold,
                normalizedDuration,
                effectiveOverride
            )
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
    }, [
        alertTargetId,
        config.item,
        currentAlert,
        effectiveOverride,
        enabled,
        normalizedDuration,
        normalizedThreshold,
        refresh,
    ]);

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
                        {config.label}
                    </div>
                    <p className={'text-sm text-muted-foreground'}>{config.description}</p>
                    {enabled && config.notify_once && (
                        <p className={'text-xs text-muted-foreground'}>
                            This alert is sent once per matching window.
                        </p>
                    )}
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Switch checked={enabled} onCheckedChange={(v) => setEnabled(v)} />
                </div>
            </div>
            {enabled && (
                <div className={'flex flex-row w-full gap-4 flex-wrap'}>
                    {thresholdEnabled && (
                        <div className={'py-2 space-y-2.5 flex-1'}>
                            <div className={'text-muted-foreground text-sm font-semibold'}>
                                Threshold{' '}
                                <span className={'text-accent-foreground'}>{thresholdText}</span>
                            </div>
                            <Slider
                                value={[threshold]}
                                onValueChange={(e) => {
                                    setThreshold(e[0]);
                                }}
                                min={config.threshold.min ?? 0}
                                max={sliderThresholdMax}
                                step={getSliderStep(config.threshold.min ?? 0, sliderThresholdMax)}
                            />
                        </div>
                    )}
                    {durationEnabled && (
                        <div className={'py-2 space-y-2.5 flex-1'}>
                            <div className={'text-muted-foreground text-sm font-semibold'}>
                                Window{' '}
                                <span className={'text-accent-foreground'}>{durationText}</span>
                            </div>
                            <Slider
                                value={[duration]}
                                onValueChange={(e) => {
                                    setDuration(e[0]);
                                }}
                                min={config.for_duration.min ?? 0}
                                max={sliderDurationMax}
                                step={getSliderStep(
                                    config.for_duration.min ?? 0,
                                    sliderDurationMax
                                )}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const formatValue = (value: number, unit?: string) => {
    switch (unit) {
        case 'percent':
            return `${value}%`;
        case 'minute':
            return `${value} minute${value === 1 ? '' : 's'}`;
        case 'day':
            return `${value} day${value === 1 ? '' : 's'}`;
        default:
            return unit ? `${value} ${unit}` : String(value);
    }
};

const getSliderStep = (min: number, max: number) => {
    const range = Math.max(max - min, 1);
    if (range >= 10000) return 1000;
    if (range >= 1000) return 10;
    return 1;
};

export default AlertItem;
