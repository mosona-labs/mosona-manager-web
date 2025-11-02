import { Cpu, HardDrive, Database, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { NetUnit } from '@/utils/unit';
import { osIcons } from '@/utils/icon';

interface Server {
    id: number;
    name: string;
    os: string;
    location: string;
    locationName: string;
    status: 'online' | 'warning' | 'offline';
    cpu: number;
    memory: number;
    disk: number;
    uptime: string;
    networkUp: number;
    networkDown: number;
}

interface ServerCardProps {
    server: Server;
}

const ServerStatusCard = ({ server }: ServerCardProps) => {
    const navigator = useNavigate();

    const statusColors = {
        online: 'bg-green-500/30 text-success-foreground',
        warning: 'bg-orange-500/30 text-background',
        offline: 'bg-red-500/30 text-destructive-foreground',
    };

    const getProgressColor = (value: number) => {
        if (value >= 80) return 'bg-red-400/50';
        if (value >= 60) return 'bg-orange-500/60';
        return 'bg-green-500/60';
    };

    const { value: rxValue, unit: rxUnit } = NetUnit(server.networkDown, 'kb');
    const { value: txValue, unit: txUnit } = NetUnit(server.networkUp, 'kb');

    return (
        <Card
            className="border-border bg-card p-5 transition-all hover:border-primary/50 cursor-pointer"
            onClick={() => {
                navigator(`/${server.id}/monitor`);
            }}
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-2xl">
                            <img
                                src={`/icons/${osIcons.includes(server.os.toLowerCase()) ? server.os.toLowerCase() : 'linux'}.svg`}
                                className="p-2"
                            />
                        </div>
                        <div>
                            <h3 className="font-mono text-sm font-semibold text-card-foreground">
                                {server.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge className="bg-accent/50 text-accent-foreground gap-1.5">
                                    <img
                                        src={`/flags/${(server.location || 'UN').toLowerCase()}.svg`}
                                        width="16"
                                        height="12"
                                        alt={server.location}
                                    />
                                    {server.locationName || 'Unknown'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Badge className={cn('text-xs font-medium', statusColors[server.status])}>
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
                                <HardDrive className="h-3.5 w-3.5" />
                                <span>Memory</span>
                            </div>
                            <span className="font-mono font-medium text-card-foreground">
                                {server.memory}%
                            </span>
                        </div>
                        <Progress
                            value={server.memory}
                            className={'h-1.5 text-red-500'}
                            color={getProgressColor(server.memory)}
                        />
                    </div>

                    {/* Disk */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Database className="h-3.5 w-3.5" />
                                <span>Disk</span>
                            </div>
                            <span className="font-mono font-medium text-card-foreground">
                                {server.disk}%
                            </span>
                        </div>
                        <Progress
                            value={server.disk}
                            className="h-1.5"
                            color={getProgressColor(server.disk)}
                        />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-mono">{server.uptime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-success">
                            <ArrowUp className="h-3 w-3" />
                            <span className="font-mono">{rxValue}</span>
                            <span className="text-muted-foreground">{rxUnit}/s</span>
                        </div>
                        <div className="flex items-center gap-1 text-info">
                            <ArrowDown className="h-3 w-3" />
                            <span className="font-mono">{txValue}</span>
                            <span className="text-muted-foreground">{txUnit}/s</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ServerStatusCard;
