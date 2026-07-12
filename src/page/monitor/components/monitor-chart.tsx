import { LoaderCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { timeFrameWindowSize, windowAverage, windowMax } from '@/utils/avg';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { NetUnit, UnitConverter } from '@/utils/unit';
import { useUser } from '@/context/useUser.tsx';

import './chart.css';

export function MonitorChart({
    data,
    defaultMode,
    enableModeSwitch = true,
    timeFrame,
    windowSize,
    nowTime,
    title,
    description,
    keyObj,
    keyName,
    keyUnit = '',
    autoUnit,
    yWidth = 30,
    colorClass = 'blue',
    chartMaxValue = 0,
    chartMaxValueUnit = 'mb',
    loading = false,
}: {
    data: any[];
    defaultMode: 'avg' | 'max' | 'raw';
    enableModeSwitch?: boolean;
    timeFrame: string;
    windowSize?: number;
    nowTime: Date;
    title: string;
    description: string;
    keyObj: string | string[];
    keyName: string | string[];
    keyUnit?: string | string[];
    autoUnit?: 'kb' | 'mb' | 'gb';
    yWidth?: number;
    colorClass?: string;
    chartMaxValue?: number;
    chartMaxValueUnit?: 'kb' | 'mb' | 'gb' | 'tb' | 'other';
    loading?: boolean;
}) {
    const { config } = useUser();

    const [maxValueChart, setMaxValueChart] = useState<number>(chartMaxValue);

    const [mode, setMode] = useState<'avg' | 'max' | 'raw'>(defaultMode);
    const [currentUnit, setCurrentUnit] = useState<string | string[]>(keyUnit || '');

    useEffect(() => {
        setMode(defaultMode);
    }, [defaultMode]);

    const keys = Array.isArray(keyObj) ? keyObj : [keyObj];
    const names = Array.isArray(keyName) ? keyName : [keyName];
    const units = Array.isArray(currentUnit) ? currentUnit : currentUnit ? [currentUnit] : [];
    const showOverlay = loading;

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const windowCount = Math.max(
            1,
            Math.floor(data.length / (windowSize ? windowSize : timeFrameWindowSize(timeFrame)))
        );

        const seriesByKey: Record<string, { time: number | string; value: number }[]> = {};
        for (const k of keys) {
            if (mode === 'avg') {
                seriesByKey[k] = windowAverage(data, k, windowCount);
            } else if (mode === 'max') {
                seriesByKey[k] = windowMax(data, k, windowCount);
            } else {
                seriesByKey[k] = data.map((d) => ({
                    time: d.time,
                    value: Number(d[k] ?? 0),
                }));
            }
        }
        let maxValue = 0;
        const map = new Map<number, Record<string, number>>();
        for (const k of keys) {
            const series = seriesByKey[k] || [];
            for (const item of series) {
                const t = typeof item.time === 'number' ? item.time : new Date(item.time).getTime();
                const entry = map.get(t) ?? { time: t };
                (entry as any)[k] = item.value;
                if (item.value > maxValue) {
                    maxValue = item.value;
                }
                map.set(t, entry);
            }
        }
        if (autoUnit) {
            const { unit, multiple } = NetUnit(
                config.defaultMinMaxMode === '0-max' && chartMaxValue != 0
                    ? chartMaxValue
                    : maxValue,
                autoUnit
            );
            setCurrentUnit(
                Array.isArray(keyUnit) ? keyUnit.map((value) => unit + value) : unit + keyUnit
            );
            if (multiple != 1)
                for (const entry of map.values()) {
                    for (const k of keys) {
                        if (entry[k]) {
                            entry[k] = (entry[k] as number) / multiple;
                        }
                    }
                }

            if (maxValue !== 0 && chartMaxValueUnit !== 'other') {
                setMaxValueChart(
                    UnitConverter(chartMaxValue, chartMaxValueUnit, unit.toLowerCase() as any)
                );
            }
        } else if (chartMaxValueUnit === 'other') {
            setMaxValueChart(chartMaxValue);
        }
        return Array.from(map.values()).sort((a: any, b: any) => a.time - b.time);
    }, [data, mode, timeFrame, keyObj, windowSize, autoUnit, chartMaxValue, chartMaxValueUnit]);

    const startTime = useMemo(() => {
        if (!chartData || chartData.length === 0) return Date.now();
        const now = nowTime.getTime();
        switch (timeFrame) {
            case '1h':
                return now - 60 * 60 * 1000;
            case '12h':
                return now - 12 * 60 * 60 * 1000;
            case '24h':
                return now - 24 * 60 * 60 * 1000;
            case '7d':
                return now - 7 * 24 * 60 * 60 * 1000;
            case '30d':
                return now - 30 * 24 * 60 * 60 * 1000;
            case '365d':
                return now - 365 * 24 * 60 * 60 * 1000;
            default:
                return (chartData[0] as any).time;
        }
    }, [chartData, timeFrame, nowTime]);

    const Tooltip = (props: any) => {
        const { active, payload, label } = props;
        if (!active || !payload || payload.length === 0) return null;
        return (
            <div className="bg-background rounded-lg border p-2 text-xs">
                <div className="mb-1.5 text-muted-foreground">
                    {new Date(label).toLocaleString()}
                </div>
                {payload.map((p: any) => {
                    const dataKey = p.dataKey;
                    const keyIndex = keys.indexOf(dataKey);
                    const displayName = names[keyIndex] ?? dataKey;
                    const unit = units[keyIndex] ?? '';
                    const colorVar = `var(--chart-${(keyIndex % 6) + 1})`;
                    return (
                        <div key={dataKey} className="flex items-center gap-2">
                            <div
                                className="h-2.5 w-1 shrink-0 rounded-[2px]"
                                style={{ background: colorVar }}
                            />
                            <div className="text-muted-foreground flex min-w-[130px] items-center text-xs">
                                {displayName}
                                <div className="text-foreground ms-auto flex items-baseline gap-0.5 font-mono font-medium">
                                    {(p.value as number).toFixed(2)}
                                    {unit && (
                                        <span className="text-muted-foreground font-normal">
                                            {unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card className={'min-w-0'}>
            <CardHeader className="flex flex-row justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                {enableModeSwitch && (
                    <Select onValueChange={(e) => setMode(e as 'avg' | 'max' | 'raw')} value={mode}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="avg">Average</SelectItem>
                                <SelectItem value="max">Maximum</SelectItem>
                                <SelectItem value="raw">Raw Data</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )}
            </CardHeader>
            <CardContent className={`${colorClass} relative`}>
                <div className="chart-surface">
                    <ChartContainer
                        config={{}}
                        className={`chart-canvas h-[256px] w-full ${showOverlay ? 'chart-canvas--loading' : ''}`}
                    >
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    `${parseFloat(value.toFixed(1))}` +
                                    (units.length > 0 ? units[0] : '')
                                }
                                domain={[
                                    config.defaultMinMaxMode === 'min-auto' ? 'min' : 0,
                                    config.defaultMinMaxMode === '0-max' && maxValueChart != 0
                                        ? maxValueChart
                                        : 'auto',
                                ]}
                                tickCount={6}
                                width={yWidth}
                                interval="preserveStartEnd"
                            />
                            <XAxis
                                dataKey={'time'}
                                domain={[startTime, nowTime.getTime()]}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => {
                                    return new Date(value).toLocaleTimeString('en-UK', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                }}
                                type="number"
                            />
                            <ChartTooltip
                                cursor={true}
                                labelFormatter={(value) => {
                                    return new Date(parseInt(value)).toLocaleString('en-UK');
                                }}
                                content={Tooltip}
                            />
                            {keys.map((k, i) => {
                                return (
                                    <Area
                                        key={k}
                                        dataKey={k}
                                        type="monotone"
                                        fill={i > 1 ? '#00000000' : `var(--chart-${(i % 6) + 1})`}
                                        fillOpacity={0.4}
                                        stroke={i > 1 ? '#00000000' : `var(--chart-${(i % 6) + 1})`}
                                        isAnimationActive={false}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ChartContainer>
                    <div
                        className={`chart-loading-overlay ${showOverlay ? 'chart-loading-overlay--visible' : ''}`}
                        aria-hidden={!showOverlay}
                    >
                        <div className="chart-loading-content">
                            <LoaderCircle className="chart-loading-spinner" />
                            <div className="chart-loading-text">Loading...</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
