import {
    Cpu,
    HardDrive,
    Database,
    Clock,
    ArrowUp,
    ArrowDown,
    ReceiptText,
    ChevronDown,
    HardDriveDownload,
    HardDriveUpload,
    MemoryStick,
    ArrowUpDown,
    ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { MemoryUnit, NetUnit } from '@/utils/unit';
import { osIcons } from '@/utils/icon';
import { useUser } from '@/context/useUser';

interface Server {
    id: number;
    name: string;
    os: string;
    location: string;
    locationName: string;
    status: 'online' | 'warning' | 'offline';
    cpu: number;
    memory: number;
    memory_used: number;
    memory_total: number;
    swap: number;
    swap_used: number;
    swap_total: number;
    disk: number;
    disk_used: number;
    disk_total: number;
    uptime: string;
    networkUp: number;
    networkDown: number;
    networkUpTotal: number;
    networkDownTotal: number;
    diskReadKibS: number;
    diskWriteKibS: number;
    diskReadIOPS: number;
    diskWriteIOPS: number;

    provider?: string | null;
    cycle?: number | null;
    start_time?: string | null;
    end_time?: string | null;
    amount?: string | null;
    bandwidth?: string | null;
    traffic?: string | null;
    note_public?: string | null;
}

const cycleMap: Record<number, string> = {
    1: 'Mo',
    2: 'Qu',
    3: 'Hy',
    4: 'Ye',
};

const STATUS_COLORS = {
    online: 'bg-green-500/30 text-success-foreground',
    warning: 'bg-orange-500/30 text-background',
    offline: 'bg-red-500/30 text-destructive-foreground',
} as const;

const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-red-400/50';
    if (value >= 60) return 'bg-orange-500/60';
    return 'bg-green-500/60';
};

const ServerStatusCard = ({ server }: { server: Server }) => {
    const navigator = useNavigate();

    const { config } = useUser();

    const rx = useMemo(() => NetUnit(server.networkDown, 'kb'), [server.networkDown]);
    const tx = useMemo(() => NetUnit(server.networkUp, 'kb'), [server.networkUp]);

    const rxTotal = useMemo(
        () => NetUnit(server.networkDownTotal, 'mb'),
        [server.networkDownTotal]
    );
    const txTotal = useMemo(() => NetUnit(server.networkUpTotal, 'mb'), [server.networkUpTotal]);

    const diskRead = useMemo(() => NetUnit(server.diskReadKibS, 'kb'), [server.diskReadKibS]);
    const diskWrite = useMemo(() => NetUnit(server.diskWriteKibS, 'kb'), [server.diskWriteKibS]);

    const remainingTime = useMemo(() => {
        if (server.start_time && server.end_time) {
            const startTime = new Date(server.start_time).getTime();
            const endTime = new Date(server.end_time).getTime();
            const currentTime = Date.now();

            const totalDuration = endTime - startTime;
            const remainingDuration = Math.max(endTime - currentTime, 0);

            const progress = Math.min(Math.max((remainingDuration / totalDuration) * 100, 0), 100);

            const days = Math.floor(remainingDuration / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (remainingDuration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((remainingDuration % (1000 * 60 * 60)) / (1000 * 60));

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            if (hours > 0) timeString += `${hours}h `;
            if (minutes > 0) timeString += `${minutes}m`;

            return {
                time: timeString.trim(),
                progress,
            };
        }
        return {
            time: '',
            progress: 0,
        };
    }, [server.start_time, server.end_time]);

    const [showMoreBtn, setShowMoreBtn] = useState(false);
    const [showMore, setShowMore] = useState(false);
    useEffect(() => {
        setShowMore(config.dashboardShowDetails);
    }, [config.dashboardShowDetails]);

    const handleCardClick = useCallback(
        () => navigator(`/${server.id}/monitor`),
        [navigator, server.id]
    );
    const handleToggleMore = useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setShowMore((s) => !s);
    }, []);

    return (
        <Card
            className="border-border bg-card p-5 transition-all hover:border-primary/50 cursor-pointer"
            onClick={handleCardClick}
            onMouseEnter={() => setShowMoreBtn(true)}
            onMouseLeave={() => setShowMoreBtn(false)}
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-2xl flex-shrink-0">
                            <img
                                src={`/icons/${osIcons.includes(server.os.toLowerCase()) ? server.os.toLowerCase() : 'linux'}.svg`}
                                alt={'OS'}
                                className="h-6 w-6"
                            />
                        </div>
                        <div>
                            <h3 className="font-mono text-sm font-semibold text-card-foreground">
                                {server.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                                <Badge className="bg-accent/70 text-accent-foreground gap-1.5">
                                    <img
                                        src={`/flags/${(server.location || 'UN').toLowerCase()}.svg`}
                                        width="16"
                                        height="12"
                                        alt={server.location}
                                    />
                                    {server.locationName || 'Unknown'}
                                </Badge>
                                {server.provider && (
                                    <Badge className="bg-emerald-500/20 text-accent-foreground">
                                        {server.provider}
                                    </Badge>
                                )}
                                {server.amount && (
                                    <Badge className="bg-indigo-500/20 text-accent-foreground">
                                        {server.amount === '0'
                                            ? 'Free'
                                            : server.amount === '-1'
                                              ? 'PAYG'
                                              : server.amount +
                                                (server.cycle
                                                    ? cycleMap[server.cycle]
                                                        ? '/' + cycleMap[server.cycle]
                                                        : ''
                                                    : '')}
                                        {}
                                    </Badge>
                                )}
                                {server.bandwidth && (
                                    <Badge className="bg-violet-500/20 text-accent-foreground">
                                        {server.bandwidth}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <Badge className={cn('text-xs font-medium', STATUS_COLORS[server.status])}>
                        {server.status}
                    </Badge>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                    {/* CPU */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Cpu className="h-3.5 w-3.5" />
                                <span>CPU</span>
                            </div>
                            <span className="font-mono font-medium text-card-foreground">
                                {server.cpu}%
                            </span>
                        </div>
                        <Progress
                            value={server.cpu}
                            className={'h-1.5'}
                            color={getProgressColor(server.cpu)}
                        />
                    </div>

                    {/* Memory */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MemoryStick className="h-3.5 w-3.5" />
                                <span>Memory</span>
                            </div>
                            <span className="font-mono font-medium text-card-foreground">
                                {server.memory}%
                                {showMore && (
                                    <span className="text-muted-foreground">
                                        {' '}
                                        ({MemoryUnit(server.memory_used, 'mb')}/
                                        {MemoryUnit(server.memory_total, 'mb')})
                                    </span>
                                )}
                            </span>
                        </div>
                        <Progress
                            value={server.memory}
                            className={'h-1.5 text-red-500'}
                            color={getProgressColor(server.memory)}
                        />
                    </div>

                    {/* SWAP */}
                    {showMore && server.swap_total > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <MemoryStick className="h-3.5 w-3.5" />
                                    <span>SWAP</span>
                                </div>
                                <span className="font-mono font-medium text-card-foreground">
                                    {server.swap}%
                                    <span className="text-muted-foreground">
                                        {' '}
                                        ({MemoryUnit(server.swap_used, 'mb')}/
                                        {MemoryUnit(server.swap_total, 'mb')})
                                    </span>
                                </span>
                            </div>
                            <Progress
                                value={server.swap}
                                className={'h-1.5 text-red-500'}
                                color={getProgressColor(server.swap)}
                            />
                        </div>
                    )}

                    {/* Disk */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Database className="h-3.5 w-3.5" />
                                <span>Disk</span>
                            </div>
                            <span className="font-mono font-medium text-card-foreground">
                                {server.disk}%
                                {showMore && (
                                    <span className="text-muted-foreground">
                                        {' '}
                                        ({MemoryUnit(server.disk_used, 'gb')}/
                                        {MemoryUnit(server.disk_total, 'gb')})
                                    </span>
                                )}
                            </span>
                        </div>
                        <Progress
                            value={server.disk}
                            className="h-1.5"
                            color={getProgressColor(server.disk)}
                        />
                    </div>

                    {remainingTime.time !== '' && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <ReceiptText className="h-3.5 w-3.5" />
                                    <span>Remaining</span>
                                </div>
                                <span className="font-mono font-medium text-card-foreground">
                                    {remainingTime.time}
                                </span>
                            </div>
                            <Progress
                                value={remainingTime.progress}
                                className="h-1.5"
                                color={getProgressColor(100 - remainingTime.progress)}
                            />
                        </div>
                    )}

                    <div
                        className={cn(
                            'border-t border-border pt-2.5 -mb-1.5 flex flex-col gap-1.5 overflow-hidden transition-all duration-300',
                            showMore ? 'h-18' : 'h-0 border-0 p-0'
                        )}
                    >
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HardDrive className="h-3.5 w-3.5" />
                                <span>I/O</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center gap-1 text-success">
                                    <HardDriveUpload className="h-3 w-3" />
                                    <span className="font-mono">{diskRead.value}</span>
                                    <span className="text-muted-foreground">{diskRead.unit}/s</span>
                                </div>
                                <div className="flex items-center gap-1 text-info ms-3">
                                    <HardDriveDownload className="h-3 w-3" />
                                    <span className="font-mono">{diskWrite.value}</span>
                                    <span className="text-muted-foreground">
                                        {diskWrite.unit}/s
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HardDrive className="h-3.5 w-3.5" />
                                <span>IOPS</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center gap-1 text-success">
                                    <HardDriveUpload className="h-3 w-3" />
                                    <span className="font-mono">{server.diskReadIOPS}</span>
                                    <span className="text-muted-foreground">ps</span>
                                </div>
                                <div className="flex items-center gap-1 text-info ms-3">
                                    <HardDriveDownload className="h-3 w-3" />
                                    <span className="font-mono">{server.diskWriteIOPS}</span>
                                    <span className="text-muted-foreground">ps</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                <span>Bandwidth (Total)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center gap-1 text-success">
                                    <ArrowUp className="h-3 w-3" />
                                    <span className="font-mono">{rxTotal.value}</span>
                                    <span className="text-muted-foreground">{rxTotal.unit}</span>
                                </div>
                                <div className="flex items-center gap-1 text-info ms-3">
                                    <ArrowDown className="h-3 w-3" />
                                    <span className="font-mono">{txTotal.value}</span>
                                    <span className="text-muted-foreground">{txTotal.unit}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div
                    className={cn(
                        'flex items-center justify-between border-t border-border pt-3 text-xs transition-all duration-300`',
                        showMore ? '' : '-mt-3'
                    )}
                    onClick={handleToggleMore}
                >
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-mono">{server.uptime}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center gap-1 text-success">
                            <ArrowUp className="h-3 w-3" />
                            <span className="font-mono">{rx.value}</span>
                            <span className="text-muted-foreground">{rx.unit}/s</span>
                        </div>
                        <div className="flex items-center gap-1 text-info ms-3">
                            <ArrowDown className="h-3 w-3" />
                            <span className="font-mono">{tx.value}</span>
                            <span className="text-muted-foreground">{tx.unit}/s</span>
                        </div>
                        <div
                            className={cn(
                                'bg-accent-foreground rounded-full transition-all overflow-hidden',
                                showMoreBtn ? 'w-3 ms-3' : 'w-0 p-0'
                            )}
                        >
                            {showMore ? (
                                <ChevronUp strokeWidth={4} size={12} className="text-accent" />
                            ) : (
                                <ChevronDown strokeWidth={4} size={12} className="text-accent" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ServerStatusCard;
