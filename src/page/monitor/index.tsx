import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowBigDownDash,
    ArrowBigUpDash,
    ChevronLeft,
    ClockArrowUp,
    CpuIcon,
    Grid2X2,
    Grid3x2,
    MonitorIcon,
    RefreshCw,
    RefreshCwOff,
    Rows2,
    Shell,
    Triangle,
    WorkflowIcon,
} from 'lucide-react';

import { MonitorChart } from './components/monitor-chart';

import ApiMonitor, { type MonitorDetailType, type ServerStatusType } from '@/api/monitor';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatUptimeDays } from '@/utils/time';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { osIcons } from '@/utils/icon';
import { NetUnit } from '@/utils/unit';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToastError } from '@/utils/toast';

const Monitor = () => {
    const { id } = useParams<{ id: string }>();

    const [server, setServer] = useState<MonitorDetailType>();
    const [stale, setStale] = useState<boolean>(true);
    const [nowTime, setNowTime] = useState<Date>(new Date());

    const [statuses, setStatuses] = useState<ServerStatusType[]>();
    const [status, setStatus] = useState<ServerStatusType>();

    const [layout, setLayout] = useState<'grid-2' | 'grid-3' | 'list'>('grid-2');

    const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
    const autoRefreshRef = useRef<number>(0);

    const [timeFrame, setTimeFrame] = useState<string>('1h');
    const [defaultMode, setDefaultMode] = useState<'avg' | 'max' | 'raw'>('avg');

    const realtime = (id: string) => {
        ApiMonitor.realtime(parseInt(id))
            .then((data) => {
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

        let interval: number;
        if (timeFrame === 'real-time') {
            setDefaultMode('raw');
            setStatuses(undefined);
            realtime(id);
            interval = setInterval(() => {
                realtime(id);
            }, 3000);
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
            }
        } else {
            chart(id, timeFrame);
            if (autoRefresh) {
                autoRefreshRef.current = setInterval(() => {
                    chart(id, timeFrame);
                }, 60000);
            }
        }
        return () => {
            if (interval) clearInterval(interval);
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
        ? NetUnit(status.rx_total_mb, 'mb')
        : {
              value: 0,
              unit: 'MB',
          };
    const tx = status
        ? NetUnit(status.tx_total_mb, 'mb')
        : {
              value: 0,
              unit: 'MB',
          };

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 flex flex-col gap-4">
            <div className="flex flex-col gap-3 items-start md:flex-row justify-between md:items-center">
                <div className="flex flex-row gap-3 items-center">
                    <Button className="w-10 h-10" variant={'ghost'}>
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
                    <Badge className="bg-accent text-accent-foreground px-3 py-1 text-sm">
                        <img
                            src={`https://flagcdn.com/${(server?.county || 'UN').toLowerCase()}.svg`}
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
                    <div className="font-mono text-lg">
                        {statuses && statuses?.length > 0 ? `${tx.value} ${tx.unit}` : 'N/A'}
                    </div>
                </div>
                <div className="flex flex-col col-span-6 xl:col-span-2">
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                        <ArrowBigDownDash size={16} />
                        <span>Download Total</span>
                    </div>
                    <div className="font-mono text-lg">
                        {statuses && statuses?.length > 0 ? `${rx.value} ${rx.unit}` : 'N/A'}
                    </div>
                </div>
            </Card>
            <div className="flex flex-row justify-between">
                <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger className="w-[220px]">
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
                    <Button variant={'outline'} onClick={() => setAutoRefresh(!autoRefresh)}>
                        {autoRefresh ? (
                            <RefreshCw size={16} className="text-green-500" />
                        ) : (
                            <RefreshCwOff size={16} />
                        )}
                    </Button>
                    <Button
                        variant={'outline'}
                        className="hidden md:inline"
                        onClick={() =>
                            setLayout(
                                layout === 'grid-2'
                                    ? 'grid-3'
                                    : layout === 'grid-3'
                                      ? 'list'
                                      : 'grid-2'
                            )
                        }
                    >
                        {layout === 'grid-2' ? (
                            <Grid3x2 size={16} />
                        ) : layout === 'grid-3' ? (
                            <Rows2 size={16} />
                        ) : (
                            <Grid2X2 size={16} />
                        )}
                    </Button>
                </div>
            </div>
            <div
                className={cn(
                    'grid gap-4',
                    layout === 'grid-2'
                        ? 'md:grid-cols-3'
                        : layout === 'grid-3'
                          ? 'grid-cols-1'
                          : 'md:grid-cols-2'
                )}
            >
                <MonitorChart
                    data={statuses || []}
                    defaultMode={defaultMode}
                    timeFrame={timeFrame}
                    enableModeSwitch={timeFrame === 'real-time' ? false : true}
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
                    enableModeSwitch={timeFrame === 'real-time' ? false : true}
                    timeFrame={timeFrame}
                    nowTime={nowTime}
                    title="Disk I/O"
                    description={'Read and write speed of root filesystem'}
                    keyName={['Read', 'Write']}
                    keyUnit={['/s', '/s']}
                    autoUnit={'kb'}
                    keyObj={['disk_read_kib_s', 'disk_write_kib_s']}
                    yWidth={44}
                    colorClass={'blue-yellow'}
                />
                <MonitorChart
                    data={statuses || []}
                    defaultMode={defaultMode}
                    enableModeSwitch={timeFrame === 'real-time' ? false : true}
                    timeFrame={timeFrame}
                    nowTime={nowTime}
                    title="Bandwidth"
                    description={'Network bandwidth usage for all network interfaces'}
                    keyName={['Receive', 'Transmit']}
                    keyUnit={['/s', '/s']}
                    autoUnit={'kb'}
                    keyObj={['rx_kib_s', 'tx_kib_s']}
                    yWidth={44}
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
