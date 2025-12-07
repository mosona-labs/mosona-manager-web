import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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
import { osIcons } from '@/utils/icon';
import { MemoryUnit, NetUnit } from '@/utils/unit';
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

const Monitor = () => {
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const { config, updateConfig } = useUser();

    const [server, setServer] = useState<MonitorDetailType>();
    const [stale, setStale] = useState<boolean>(true);
    const [realTimeStatus, setRealTimeStatus] = useState<ServerStatusType>();
    const [nowTime, setNowTime] = useState<Date>(new Date());

    const [statuses, setStatuses] = useState<ServerStatusType[]>();
    const [status, setStatus] = useState<ServerStatusType>();

    const [layout, setLayout] = useState<'grid-2' | 'grid-3' | 'list'>(config.defaultLayout);

    const [autoRefresh, setAutoRefresh] = useState<boolean>(config.autoRefresh);
    const autoRefreshRef = useRef<number>(0);

    const [timeFrame, setTimeFrame] = useState<string>(config.defaultTimeFrame);
    const [defaultMode, setDefaultMode] = useState<'avg' | 'max' | 'raw'>(
        config.defaultMonitorMode
    );

    // Config
    useEffect(() => {
        if (config) {
            setLayout(config.defaultLayout);
            setAutoRefresh(config.autoRefresh);
            setTimeFrame(config.defaultTimeFrame);
            setDefaultMode(config.defaultMonitorMode);
        }
    }, [config]);

    const realTimeChart = useRef<boolean>(false);
    const realtime = (id: string) => {
        ApiMonitor.realtime(parseInt(id))
            .then((data) => {
                setRealTimeStatus(data.data);

                if (realTimeChart.current)
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
            })
            .catch(ToastError);
    };

    const chart = (id: string, time_frame: string) => {
        ApiMonitor.chart(parseInt(id), time_frame)
            .then((data) => {
                setStatuses(data.data);
                if (data.data.length > 0) setStatus(data.data[data.data.length - 1]);
            })
            .catch((err) => {
                console.error('Failed to fetch monitor chart data:', err);
            })
            .catch(ToastError);
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
            })
            .catch(ToastError);

        realtime(id);
        let interval: number;
        interval = setInterval(() => {
            realtime(id);
        }, 3000);

        if (timeFrame === 'real-time') {
            setDefaultMode('raw');
            setStatuses(undefined);

            realTimeChart.current = true;
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
            }
        } else {
            realTimeChart.current = false;
            setDefaultMode(config.defaultMonitorMode);
            chart(id, timeFrame);
            if (autoRefresh) {
                autoRefreshRef.current = setInterval(() => {
                    chart(id, timeFrame);
                }, 60000);
            }
        }
        return () => {
            if (interval) clearInterval(interval);
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
            }
        };
    }, [id, timeFrame]);

    useEffect(() => {
        return () => {
            if (autoRefreshRef.current && autoRefresh) {
                clearInterval(autoRefreshRef.current);
            } else {
                autoRefreshRef.current = setInterval(() => {
                    if (id && timeFrame !== 'real-time') {
                        chart(id, timeFrame);
                    }
                }, 60000);
            }
        };
    }, [autoRefresh]);

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

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 flex flex-col gap-4">
            <div className="flex flex-col gap-3 items-start md:flex-row justify-between md:items-center">
                <div className="flex flex-row gap-3 items-center">
                    <Button
                        className="w-10 h-10"
                        variant={'ghost'}
                        onClick={() => {
                            if (window.history.length > 1) navigate(-1);
                            else navigate('/');
                        }}
                    >
                        <ChevronLeft size={100} />
                    </Button>
                    <h1 className="text-2xl font-bold">{server?.name}</h1>
                </div>
                <div className="flex flex-row gap-2">
                    <Badge
                        className={cn(
                            'bg-accent text-accent-foreground px-3 py-1 text-sm',
                            !stale ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
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
            <Card className="px-6 py-4 grid grid-cols-12 gap-4">
                <div className="flex flex-col col-span-12 md:col-span-6">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <WorkflowIcon size={16} />
                        <span>IP Address</span>
                    </div>
                    <div className="font-mono text-lg">{server?.ip || 'N/A'}</div>
                </div>
                <div className="flex flex-col col-span-12 md:col-span-6">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <MonitorIcon size={16} />
                        <span>Hostname</span>
                    </div>
                    <div className="font-mono text-lg line-clamp-1">
                        {server?.hostname || 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-6 lg:col-span-2 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <Shell size={16} />
                        <span>System</span>
                    </div>
                    <div className="font-mono text-lg">
                        <img
                            src={`/icons/${osIcons.includes(server?.os?.toLowerCase() || '') ? server?.os?.toLowerCase() : 'linux'}.svg`}
                            className="inline-block h-5 w-5 mr-2"
                        />
                        {server?.os || 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-6 lg:col-span-2 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <Triangle size={16} />
                        <span>Arch</span>
                    </div>
                    <div className="font-mono text-lg">{server?.arch || 'N/A'}</div>
                </div>
                <div className="flex flex-col col-span-6 lg:col-span-6 xl:col-span-4">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <Triangle size={16} />
                        <span>Kernel</span>
                    </div>
                    <div className="font-mono text-lg">{server?.kernel || 'N/A'}</div>
                </div>
                <div className="xl:col-span-4 " />
                <div className="flex flex-col col-span-12 2xl:col-span-6">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <CpuIcon size={16} />
                        <span>CPU</span>
                    </div>
                    <div className="font-mono text-lg">
                        {server?.cpu_name
                            ? `${server?.cpu_name} (${server?.core_c}C/${server?.core_t}T)`
                            : 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-6 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <ArrowBigUpDash size={16} />
                        <span>Upload Total</span>
                    </div>
                    <div className="font-mono text-lg">{tx ? `${tx.value} ${tx.unit}` : 'N/A'}</div>
                </div>
                <div className="flex flex-col col-span-6 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <ArrowBigDownDash size={16} />
                        <span>Download Total</span>
                    </div>
                    <div className="font-mono text-lg">{rx ? `${rx.value} ${rx.unit}` : 'N/A'}</div>
                </div>
                <div className="hidden xl:block xl:col-span-1" />
                <div className="flex flex-col col-span-6 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <PercentCircle size={16} />
                        <span>CPU Usage</span>
                    </div>
                    <div className="font-mono text-lg">
                        {realTimeStatus ? realTimeStatus.cpu + '%' : 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <MemoryStick size={16} />
                        <span>Memory</span>
                    </div>
                    <div className="font-mono text-lg">
                        {realTimeStatus ? MemoryUnit(realTimeStatus.mem_used_mb, 'mb') : 'N/A'} /{' '}
                        {realTimeStatus ? MemoryUnit(realTimeStatus.mem_total_mb, 'mb') : 'N/A'} (
                        {realTimeStatus
                            ? parseFloat(
                                  (
                                      (realTimeStatus.mem_used_mb / realTimeStatus.mem_total_mb) *
                                      100
                                  ).toFixed(2)
                              ) + '%'
                            : 'N/A'}
                        )
                    </div>
                </div>
                <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <HardDrive size={16} />
                        <span>Disk</span>
                    </div>
                    <div className="font-mono text-lg">
                        {realTimeStatus ? MemoryUnit(realTimeStatus.disk_used_gb, 'gb') : 'N/A'} /{' '}
                        {realTimeStatus ? MemoryUnit(realTimeStatus.disk_total_gb, 'gb') : 'N/A'} (
                        {realTimeStatus
                            ? parseFloat(
                                  (
                                      (realTimeStatus.disk_used_gb / realTimeStatus.disk_total_gb) *
                                      100
                                  ).toFixed(2)
                              ) + '%'
                            : 'N/A'}
                        )
                    </div>
                </div>
                <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <HardDrive size={16} />
                        <span>I/O</span>
                    </div>
                    <div className="font-mono text-lg flex items-center gap-2">
                        <HardDriveUpload className="h-3 w-3" />
                        {realTimeStatus
                            ? MemoryUnit(realTimeStatus.disk_read_kib_s, 'kb') + '/s'
                            : 'N/A'}
                        <HardDriveDownload className="h-3 w-3" />
                        {realTimeStatus
                            ? MemoryUnit(realTimeStatus.disk_write_kib_s, 'kb') + '/s'
                            : 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-3">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <EthernetPort size={16} />
                        <span>Network</span>
                    </div>
                    <div className="font-mono text-lg flex items-center gap-2">
                        <ArrowUp className="h-3 w-3" />
                        {realTimeStatus ? MemoryUnit(realTimeStatus.rx_kib_s, 'kb') + '/s' : 'N/A'}
                        <ArrowDown className="h-3 w-3" />
                        {realTimeStatus ? MemoryUnit(realTimeStatus.tx_kib_s, 'kb') + '/s' : 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-6 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <Unplug size={16} />
                        <span>TCP Connections</span>
                    </div>
                    <div className="font-mono text-lg">
                        {realTimeStatus?.tcp_total ? realTimeStatus?.tcp_total : 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-6 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <Unplug size={16} />
                        <span>UDP Connections</span>
                    </div>
                    <div className="font-mono text-lg">
                        {realTimeStatus?.udp_total ? realTimeStatus?.udp_total : 'N/A'}
                    </div>
                </div>
            </Card>
            <div className="flex flex-row justify-between">
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
                            <SelectItem value="real-time">Real-Time (3M)</SelectItem>
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
                    <Button variant={'outline'}>
                        <Settings size={16} />
                    </Button>
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
                            {autoRefresh ? <p>Auto-refresh is ON</p> : <p>Auto-refresh is OFF</p>}
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
            >
                <MonitorChart
                    data={statuses || []}
                    defaultMode={defaultMode}
                    timeFrame={timeFrame}
                    enableModeSwitch={timeFrame !== 'real-time'}
                    nowTime={nowTime}
                    title="CPU Usage"
                    description="System-wide CPU utilization overview"
                    keyName="Usage"
                    keyUnit="%"
                    keyObj="cpu"
                />
                <MonitorChart
                    data={statuses || []}
                    defaultMode={'raw'}
                    enableModeSwitch={false}
                    timeFrame={timeFrame}
                    nowTime={nowTime}
                    title="Memory Usage"
                    description="System memory consumption overview"
                    keyName={'Used'}
                    autoUnit={'mb'}
                    keyObj={'mem_used_mb'}
                    yWidth={38}
                    colorClass={'green'}
                />
                <MonitorChart
                    data={statuses || []}
                    defaultMode={'raw'}
                    enableModeSwitch={false}
                    timeFrame={timeFrame}
                    nowTime={nowTime}
                    title="Disk Usage"
                    description="Usage of root filesystem"
                    keyName={'Used'}
                    autoUnit={'gb'}
                    keyObj={'disk_used_gb'}
                    yWidth={44}
                    colorClass={'orange'}
                />
                <MonitorChart
                    data={statuses || []}
                    defaultMode={defaultMode}
                    enableModeSwitch={timeFrame !== 'real-time'}
                    timeFrame={timeFrame}
                    nowTime={nowTime}
                    title="Disk I/O"
                    description={'Read and write speed of root filesystem'}
                    keyName={['Read', 'Write']}
                    keyUnit={['/s', '/s']}
                    autoUnit={'kb'}
                    keyObj={['disk_read_kib_s', 'disk_write_kib_s']}
                    yWidth={46}
                    colorClass={'blue-yellow'}
                />
                <MonitorChart
                    data={statuses || []}
                    defaultMode={defaultMode}
                    enableModeSwitch={timeFrame !== 'real-time'}
                    timeFrame={timeFrame}
                    nowTime={nowTime}
                    title="Bandwidth"
                    description={'Network bandwidth usage for all network interfaces'}
                    keyName={['Receive', 'Transmit']}
                    keyUnit={['/s', '/s']}
                    autoUnit={'kb'}
                    keyObj={['rx_kib_s', 'tx_kib_s']}
                    yWidth={46}
                    colorClass={'violet-red'}
                />
                <MonitorChart
                    data={statuses || []}
                    defaultMode={'raw'}
                    enableModeSwitch={false}
                    timeFrame={timeFrame}
                    nowTime={nowTime}
                    title="Swap Usage"
                    description={'Amount of swap space used'}
                    keyName={'Used'}
                    autoUnit={'mb'}
                    keyObj={'swap_used_mb'}
                    yWidth={38}
                    colorClass={'green'}
                />
            </div>
        </div>
    );
};

export default Monitor;
