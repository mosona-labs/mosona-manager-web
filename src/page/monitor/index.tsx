import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowBigDownDash,
    ArrowBigUpDash,
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ClockArrowUp,
    CpuIcon,
    EthernetPort,
    HardDrive,
    HardDriveDownload,
    HardDriveUpload,
    MemoryStick,
    MonitorIcon,
    PercentCircle,
    RefreshCw,
    RefreshCwOff,
    Settings,
    Shell,
    Triangle,
    Unplug,
    WorkflowIcon,
} from 'lucide-react';

import { MonitorChart } from './components/monitor-chart';
import LayoutBtn from './components/layout-btn';

import ApiMonitor, { type MonitorDetailType, type ServerStatusType } from '@/api/monitor';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatUptimeDays } from '@/utils/time';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOsIconName } from '@/utils/icon';
import { MemoryUnit, NetUnit } from '@/utils/unit';
import { getDiskLabel, getDiskUsagePercentage, getStatusDisks } from '@/utils/disk';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToastError } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/context/useUser';
import SettingsDialog from '@/page/monitor/components/settings-dialog.tsx';

const Monitor = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const { config, updateConfig } = useUser();

    const [server, setServer] = useState<MonitorDetailType>();
    const [stale, setStale] = useState<boolean>(true);
    const [realTimeStatus, setRealTimeStatus] = useState<ServerStatusType>();
    const [nowTime, setNowTime] = useState<Date>(new Date());

    const [statuses, setStatuses] = useState<ServerStatusType[]>();
    const [status, setStatus] = useState<ServerStatusType>();
    const [chartLoading, setChartLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

    const [layout, setLayout] = useState<'grid-2' | 'grid-3' | 'list'>(config.defaultLayout);

    const [autoRefresh, setAutoRefresh] = useState<boolean>(config.autoRefresh);
    const autoRefreshRef = useRef<number>(0);

    const [timeFrame, setTimeFrame] = useState<string>(config.defaultTimeFrame);
    const [defaultMode, setDefaultMode] = useState<'avg' | 'max' | 'raw'>(
        config.defaultMonitorMode
    );
    const hasInitialLoadedRef = useRef(false);

    const syncNowTime = (value?: string) => {
        if (!value) {
            return;
        }

        const nextNow = new Date(value);
        if (!Number.isNaN(nextNow.getTime())) {
            setNowTime(nextNow);
        }
    };

    // Config
    useEffect(() => {
        if (config) {
            setLayout(config.defaultLayout);
            setAutoRefresh(config.autoRefresh);
            setTimeFrame(config.defaultTimeFrame);
            setDefaultMode(config.defaultMonitorMode);
        }
    }, [config]);

    useEffect(() => {
        hasInitialLoadedRef.current = hasInitialLoaded;
    }, [hasInitialLoaded]);

    useEffect(() => {
        setDefaultMode(timeFrame === 'real-time' ? 'raw' : config.defaultMonitorMode);
    }, [config.defaultMonitorMode, timeFrame]);

    const realTimeChart = useRef<boolean>(false);
    const chartRequestRef = useRef(0);
    const realtime = (id: string, updateRealtimeChart = realTimeChart.current) => {
        ApiMonitor.realtime(parseInt(id))
            .then((data) => {
                setRealTimeStatus(data.data);
                syncNowTime(data.data.time);

                if (updateRealtimeChart)
                    setStatuses((prev) => {
                        if (!prev) return [data.data];
                        const newStatuses = [...prev, data.data];
                        if (newStatuses.length > 60) {
                            newStatuses.shift();
                        }
                        setStatus(data.data);
                        return newStatuses;
                    });
            })
            .catch((err) => {
                console.error('Failed to fetch monitor real-time data:', err);
                ToastError(err);
            })
            .finally(() => {
                if (updateRealtimeChart) {
                    setChartLoading(false);
                }
            });
    };

    const chart = (id: string, time_frame: string, withOverlay = true) => {
        const requestId = ++chartRequestRef.current;
        if (withOverlay) {
            setChartLoading(true);
        }

        ApiMonitor.chart(parseInt(id), time_frame)
            .then((data) => {
                if (requestId !== chartRequestRef.current) {
                    return;
                }
                setStatuses(data.data);
                if (data.data?.length > 0) {
                    const latestStatus = data.data[data.data.length - 1];
                    setStatus(latestStatus);
                    syncNowTime(latestStatus.time);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch monitor chart data:', err);
                ToastError(err);
            })
            .finally(() => {
                if (requestId === chartRequestRef.current && withOverlay) {
                    setChartLoading(false);
                }
            });
    };

    useEffect(() => {
        if (!id) return;
        ApiMonitor.get(parseInt(id))
            .then((data) => {
                setServer(data.data.info);
                setStale(data.data.stale);
                setNowTime(new Date(data.data.now));
            })
            .catch((err) => {
                console.error('Failed to fetch monitor data:', err);
                ToastError(err);
            });

        realTimeChart.current = timeFrame === 'real-time';
        const shouldOverlayCharts = hasInitialLoadedRef.current;

        let interval: number;
        interval = setInterval(() => {
            realtime(id);
        }, 3000);

        if (timeFrame === 'real-time') {
            setStatuses(undefined);
            if (shouldOverlayCharts) {
                setChartLoading(true);
            }
            realtime(id, true);
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
            }
        } else {
            realtime(id, false);
            chart(id, timeFrame, shouldOverlayCharts);
        }
        return () => {
            if (interval) clearInterval(interval);
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
                autoRefreshRef.current = 0;
            }
        };
    }, [id, timeFrame]);

    useEffect(() => {
        if (autoRefreshRef.current) {
            clearInterval(autoRefreshRef.current);
            autoRefreshRef.current = 0;
        }

        if (!autoRefresh || !id || timeFrame === 'real-time') {
            return;
        }

        autoRefreshRef.current = window.setInterval(() => {
            chart(id, timeFrame);
        }, 60000);

        return () => {
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
                autoRefreshRef.current = 0;
            }
        };
    }, [autoRefresh, id, timeFrame]);

    const initialLoading =
        !server || !realTimeStatus || (timeFrame !== 'real-time' && statuses === undefined);

    useEffect(() => {
        let fadeInTimer: number | undefined;
        let fadeOutTimer: number | undefined;

        if (!hasInitialLoaded && initialLoading) {
            setShowSkeleton(true);
            setMounted(false);
            return;
        }

        if (!hasInitialLoaded && !initialLoading) {
            setHasInitialLoaded(true);
        }

        fadeInTimer = window.setTimeout(() => setMounted(true), 60);
        fadeOutTimer = window.setTimeout(() => setShowSkeleton(false), 420);

        return () => {
            if (fadeInTimer) window.clearTimeout(fadeInTimer);
            if (fadeOutTimer) window.clearTimeout(fadeOutTimer);
        };
    }, [hasInitialLoaded, initialLoading]);

    const rx = status
        ? NetUnit(realTimeStatus ? realTimeStatus.rx_total_mb : status.rx_total_mb, 'mb')
        : {
              value: 0,
              unit: 'MB',
          };
    const tx = status
        ? NetUnit(realTimeStatus ? realTimeStatus.tx_total_mb : status.tx_total_mb, 'mb')
        : {
              value: 0,
              unit: 'MB',
          };

    const realtimeDisks = useMemo(() => getStatusDisks(realTimeStatus), [realTimeStatus]);
    const diskDefinitions = useMemo(() => {
        const diskMap = new Map<string, { mp: string; total_gb: number; used_gb: number }>();

        for (const disk of realtimeDisks) {
            diskMap.set(disk.mp, disk);
        }

        for (const entry of [...(statuses || [])].reverse()) {
            for (const disk of getStatusDisks(entry)) {
                if (!diskMap.has(disk.mp)) {
                    diskMap.set(disk.mp, disk);
                }
            }
        }

        return Array.from(diskMap.values());
    }, [realtimeDisks, statuses]);

    const diskChartData = useMemo(
        () =>
            diskDefinitions.map((disk, index) => ({
                disk,
                label: getDiskLabel(index),
                data: (statuses || []).map((entry) => {
                    const matched = getStatusDisks(entry).find((item) => item.mp === disk.mp);

                    return {
                        time: entry.time,
                        used_gb: matched?.used_gb ?? 0,
                    };
                }),
            })),
        [diskDefinitions, statuses]
    );

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 flex flex-col gap-4 relative">
            {showSkeleton ? (
                <div
                    className="absolute inset-5 z-40 pointer-events-none overflow-hidden transition-opacity duration-400"
                    style={{ opacity: !hasInitialLoaded && initialLoading ? 1 : 0 }}
                >
                    <div className="flex flex-col gap-3 items-start md:flex-row justify-between md:items-center">
                        <div className="flex flex-row gap-3 items-center">
                            <div className="h-10 w-10 rounded bg-muted-foreground/8 animate-pulse" />
                            <div className="h-8 w-48 rounded bg-muted-foreground/10 animate-pulse" />
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="h-8 w-20 rounded-full bg-muted-foreground/8 animate-pulse" />
                            <div className="h-8 w-28 rounded-full bg-muted-foreground/8 animate-pulse" />
                            <div className="h-8 w-24 rounded-full bg-muted-foreground/8 animate-pulse" />
                        </div>
                    </div>
                    <Card className="px-6 py-4 grid grid-cols-12 gap-4 mt-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'h-16 rounded bg-muted-foreground/8 animate-pulse',
                                    index < 2
                                        ? 'col-span-12 md:col-span-6'
                                        : index < 5
                                          ? 'col-span-6 lg:col-span-2 xl:col-span-2'
                                          : 'col-span-12 md:col-span-6 xl:col-span-4'
                                )}
                            />
                        ))}
                    </Card>
                    <div className="flex flex-row justify-between mt-4">
                        <div className="h-10 w-[180px] rounded bg-muted-foreground/8 animate-pulse" />
                        <div className="flex gap-2">
                            <div className="h-10 w-10 rounded bg-muted-foreground/8 animate-pulse" />
                            <div className="h-10 w-10 rounded bg-muted-foreground/8 animate-pulse" />
                            <div className="h-10 w-10 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                    </div>
                    <div
                        className={cn(
                            'grid gap-4 mt-4',
                            layout === 'grid-3'
                                ? 'xl:grid-cols-3 lg:grid-cols-2'
                                : layout === 'grid-2'
                                  ? 'lg:grid-cols-2'
                                  : 'grid-cols-1'
                        )}
                    >
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="min-w-0">
                                <div className="p-6 pb-2">
                                    <div className="h-5 w-32 rounded bg-muted-foreground/10 animate-pulse" />
                                    <div className="h-4 w-48 rounded bg-muted-foreground/8 animate-pulse mt-2" />
                                </div>
                                <div className="p-6 pt-4">
                                    <div className="h-[256px] rounded bg-muted-foreground/8 animate-pulse" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : null}

            <div
                className="flex flex-col gap-4"
                style={{ transition: 'opacity 400ms ease', opacity: mounted ? 1 : 0 }}
            >
                <div
                    className="flex flex-col gap-3 items-start md:flex-row justify-between md:items-center"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(6px)',
                    }}
                >
                    <div className="flex flex-row gap-3 items-center">
                        <Button
                            className="w-10 h-10"
                            variant={'ghost'}
                            onClick={() => {
                                if (window.history.length > 1) navigate(-1);
                                else navigate('/');
                            }}
                        >
                            <ChevronLeft size={100} className="rtl:rotate-180" />
                        </Button>
                        <h1 className="text-2xl font-bold">{server?.name}</h1>
                    </div>
                    <div className="flex flex-row gap-2">
                        <Badge
                            className={cn(
                                'bg-accent text-accent-foreground px-3 py-1 text-sm',
                                !stale
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                            )}
                        >
                            {!stale ? 'online' : 'offline'}
                        </Badge>
                        <Badge className="bg-accent text-accent-foreground px-3 py-1 text-sm gap-1.5">
                            <img
                                src={`/flags/${(server?.county || 'UN').toLowerCase()}.svg`}
                                width="16"
                                height="12"
                                alt={'UN'}
                            />
                            {server?.area || 'Unknown'}
                        </Badge>
                        <Badge className="bg-accent text-accent-foreground px-3 py-1 text-sm">
                            <ClockArrowUp />
                            {formatUptimeDays(server?.open_time || '')}d
                        </Badge>
                    </div>
                </div>
                <Card
                    className="px-6 py-4 grid grid-cols-12 gap-4"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '80ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <div className="flex flex-col col-span-12 md:col-span-6">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <WorkflowIcon size={16} />
                            <span>{t('pages.monitor.ipAddress')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {server?.ip || t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-12 md:col-span-6">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <MonitorIcon size={16} />
                            <span>{t('pages.monitor.hostname')}</span>
                        </div>
                        <div className="font-mono text-lg line-clamp-1">
                            {server?.hostname || t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-6 lg:col-span-2 xl:col-span-2">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <Shell size={16} />
                            <span>{t('pages.monitor.system')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            <img
                                src={`/icons/${getOsIconName(server?.os)}.svg`}
                                className="inline-block h-5 w-5 me-2"
                                alt={'System Icon'}
                            />
                            {server?.os || t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-6 lg:col-span-2 xl:col-span-2">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <Triangle size={16} />
                            <span>{t('pages.monitor.arch')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {server?.arch || t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-6 lg:col-span-6 xl:col-span-4">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <Triangle size={16} />
                            <span>{t('pages.monitor.kernel')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {server?.kernel || t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="xl:col-span-4 " />
                    <div className="flex flex-col col-span-12 2xl:col-span-6">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <CpuIcon size={16} />
                            <span>{t('pages.monitor.cpu')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {server?.cpu_name
                                ? `${server?.cpu_name} (${server?.core_c}C/${server?.core_t}T)`
                                : t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-6 xl:col-span-2">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <ArrowBigUpDash size={16} />
                            <span>{t('pages.monitor.uploadTotal')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {tx ? `${tx.value} ${tx.unit}` : t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-6 xl:col-span-2">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <ArrowBigDownDash size={16} />
                            <span>{t('pages.monitor.downloadTotal')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {rx ? `${rx.value} ${rx.unit}` : t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="hidden xl:block xl:col-span-1" />
                    <div className="flex flex-col col-span-6 xl:col-span-2">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <PercentCircle size={16} />
                            <span>{t('pages.monitor.cpuUsage')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {realTimeStatus
                                ? parseFloat(realTimeStatus.cpu.toFixed(2)) + '%'
                                : t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <MemoryStick size={16} />
                            <span>{t('pages.monitor.memory')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {realTimeStatus
                                ? MemoryUnit(realTimeStatus.mem_used_mb, 'mb')
                                : t('pages.monitor.na')}{' '}
                            /{' '}
                            {realTimeStatus
                                ? MemoryUnit(realTimeStatus.mem_total_mb, 'mb')
                                : t('pages.monitor.na')}{' '}
                            (
                            {realTimeStatus
                                ? parseFloat(
                                      (
                                          (realTimeStatus.mem_used_mb /
                                              realTimeStatus.mem_total_mb) *
                                          100
                                      ).toFixed(2)
                                  ) + '%'
                                : t('pages.monitor.na')}
                            )
                        </div>
                    </div>
                    <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <HardDrive size={16} />
                            <span>{t('pages.monitor.disk')}</span>
                        </div>
                        <div className="space-y-1 font-mono text-sm lg:text-base">
                            {realtimeDisks.length > 0 ? (
                                realtimeDisks.map((disk, index) => (
                                    <div
                                        key={disk.mp}
                                        className="flex flex-wrap items-center gap-x-2"
                                    >
                                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                            {getDiskLabel(index)}
                                        </span>
                                        <span className="text-muted-foreground">{disk.mp}</span>
                                        <span>
                                            {MemoryUnit(disk.used_gb, 'gb')} /{' '}
                                            {MemoryUnit(disk.total_gb, 'gb')} (
                                            {getDiskUsagePercentage(disk)}%)
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-lg">{t('pages.monitor.na')}</div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <HardDrive size={16} />
                            <span>{t('pages.monitor.io')}</span>
                        </div>
                        <div className="font-mono text-lg flex items-center gap-2">
                            <HardDriveUpload className="h-4 w-4" />
                            {realTimeStatus
                                ? MemoryUnit(realTimeStatus.disk_read_kib_s, 'kb') + '/s'
                                : t('pages.monitor.na')}
                            <HardDriveDownload className="h-4 w-4" />
                            {realTimeStatus
                                ? MemoryUnit(realTimeStatus.disk_write_kib_s, 'kb') + '/s'
                                : t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <EthernetPort size={16} />
                            <span>{t('pages.monitor.network')}</span>
                        </div>
                        <div className="font-mono text-lg flex items-center gap-2">
                            <ArrowUp className="h-4 w-4" />
                            {realTimeStatus
                                ? MemoryUnit(realTimeStatus.tx_kib_s, 'kb') + '/s'
                                : t('pages.monitor.na')}
                            <ArrowDown className="h-4 w-4" />
                            {realTimeStatus
                                ? MemoryUnit(realTimeStatus.rx_kib_s, 'kb') + '/s'
                                : t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-6 xl:col-span-2">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <Unplug size={16} />
                            <span>{t('pages.monitor.tcpConnections')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {realTimeStatus?.tcp_total
                                ? realTimeStatus?.tcp_total
                                : t('pages.monitor.na')}
                        </div>
                    </div>
                    <div className="flex flex-col col-span-6 xl:col-span-2">
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                            <Unplug size={16} />
                            <span>{t('pages.monitor.udpConnections')}</span>
                        </div>
                        <div className="font-mono text-lg">
                            {realTimeStatus?.udp_total
                                ? realTimeStatus?.udp_total
                                : t('pages.monitor.na')}
                        </div>
                    </div>
                </Card>
                <div
                    className="flex flex-row justify-between"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '140ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <Select
                        value={timeFrame}
                        onValueChange={(e) => {
                            updateConfig({ defaultTimeFrame: e });
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="real-time">
                                    {t('pages.display.realtime')}
                                </SelectItem>
                                <SelectItem value="1h">1H</SelectItem>
                                <SelectItem value="12h">12H</SelectItem>
                                <SelectItem value="24h">24H</SelectItem>
                                <SelectItem value="7d">7D</SelectItem>
                                <SelectItem value="30d">30D</SelectItem>
                                <SelectItem value="365d">365D</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className="space-x-2">
                        <SettingsDialog>
                            <Button variant={'outline'}>
                                <Settings size={16} />
                            </Button>
                        </SettingsDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    onClick={() => {
                                        updateConfig({ autoRefresh: !autoRefresh });
                                    }}
                                >
                                    {autoRefresh ? (
                                        <RefreshCw size={16} className="text-green-500" />
                                    ) : (
                                        <RefreshCwOff size={16} />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="me-2">
                                {autoRefresh ? (
                                    <p>{t('pages.monitor.autoRefreshOn')}</p>
                                ) : (
                                    <p>{t('pages.monitor.autoRefreshOff')}</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                        <LayoutBtn
                            layout={layout}
                            setLayout={(l) => {
                                updateConfig({ defaultLayout: l });
                            }}
                        />
                    </div>
                </div>
                <div
                    className={cn(
                        'grid gap-4',
                        layout === 'grid-3'
                            ? 'xl:grid-cols-3 lg:grid-cols-2'
                            : layout === 'grid-2'
                              ? 'lg:grid-cols-2'
                              : 'grid-cols-1'
                    )}
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '180ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <MonitorChart
                        data={statuses || []}
                        defaultMode={defaultMode}
                        timeFrame={timeFrame}
                        enableModeSwitch={timeFrame !== 'real-time'}
                        nowTime={nowTime}
                        title={t('pages.monitor.cpuUsage')}
                        description={t('pages.monitor.cpuDescription')}
                        keyName="Usage"
                        keyUnit="%"
                        keyObj="cpu"
                        chartMaxValue={100}
                        chartMaxValueUnit={'other'}
                        loading={chartLoading}
                    />
                    <MonitorChart
                        data={statuses || []}
                        defaultMode={'raw'}
                        enableModeSwitch={false}
                        timeFrame={timeFrame}
                        nowTime={nowTime}
                        title={t('pages.monitor.memoryUsage')}
                        description={t('pages.monitor.memoryDescription')}
                        keyName={'Used'}
                        autoUnit={'mb'}
                        keyObj={'mem_used_mb'}
                        yWidth={38}
                        colorClass={'green'}
                        chartMaxValue={realTimeStatus ? realTimeStatus.mem_total_mb : 0}
                        loading={chartLoading}
                    />
                    <MonitorChart
                        data={statuses || []}
                        defaultMode={defaultMode}
                        enableModeSwitch={timeFrame !== 'real-time'}
                        timeFrame={timeFrame}
                        nowTime={nowTime}
                        title={t('pages.monitor.diskIo')}
                        description={t('pages.monitor.diskIoDescription')}
                        keyName={['Read', 'Write', 'Read IOPS', 'Write IOPS']}
                        keyUnit={['/s', '/s']}
                        autoUnit={'kb'}
                        keyObj={[
                            'disk_read_kib_s',
                            'disk_write_kib_s',
                            'disk_read_iops',
                            'disk_write_iops',
                        ]}
                        yWidth={46}
                        colorClass={'blue-yellow'}
                        loading={chartLoading}
                    />
                    <MonitorChart
                        data={statuses || []}
                        defaultMode={defaultMode}
                        enableModeSwitch={timeFrame !== 'real-time'}
                        timeFrame={timeFrame}
                        nowTime={nowTime}
                        title={t('pages.monitor.bandwidth')}
                        description={t('pages.monitor.bandwidthDescription')}
                        keyName={['Receive', 'Transmit']}
                        keyUnit={['/s', '/s']}
                        autoUnit={'kb'}
                        keyObj={['rx_kib_s', 'tx_kib_s']}
                        yWidth={46}
                        colorClass={'violet-red'}
                        loading={chartLoading}
                    />
                    <MonitorChart
                        data={statuses || []}
                        defaultMode={'raw'}
                        enableModeSwitch={false}
                        timeFrame={timeFrame}
                        nowTime={nowTime}
                        title={t('pages.monitor.swapUsage')}
                        description={t('pages.monitor.swapDescription')}
                        keyName={'Used'}
                        autoUnit={'mb'}
                        keyObj={'swap_used_mb'}
                        yWidth={38}
                        colorClass={'green'}
                        chartMaxValue={realTimeStatus ? realTimeStatus.swap_total_mb : 0}
                        loading={chartLoading}
                    />
                    {diskChartData.length > 0 ? (
                        diskChartData.map(({ disk, label, data }) => (
                            <MonitorChart
                                key={disk.mp}
                                data={data}
                                defaultMode={'raw'}
                                enableModeSwitch={false}
                                timeFrame={timeFrame}
                                nowTime={nowTime}
                                title={t('pages.monitor.diskUsage', { label })}
                                description={t('pages.monitor.filesystemUsage', { mount: disk.mp })}
                                keyName={'Used'}
                                autoUnit={'gb'}
                                keyObj={'used_gb'}
                                yWidth={44}
                                colorClass={'orange'}
                                chartMaxValue={disk.total_gb}
                                chartMaxValueUnit={'gb'}
                                loading={chartLoading}
                            />
                        ))
                    ) : (
                        <MonitorChart
                            data={[]}
                            defaultMode={'raw'}
                            enableModeSwitch={false}
                            timeFrame={timeFrame}
                            nowTime={nowTime}
                            title={t('pages.monitor.diskUsage', { label: 'Disk' })}
                            description={t('pages.monitor.noDiskData')}
                            keyName={'Used'}
                            autoUnit={'gb'}
                            keyObj={'used_gb'}
                            yWidth={44}
                            colorClass={'orange'}
                            chartMaxValue={0}
                            chartMaxValueUnit={'gb'}
                            loading={chartLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Monitor;
