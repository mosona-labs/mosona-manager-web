import { TvMinimal } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import { useUser } from '@/context/useUser.tsx';
import EnableCard from '@/components/enable-card.tsx';

const DisplaySettings = () => {
    const { config, updateConfig } = useUser();

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <TvMinimal className="h-5 w-5 text-primary" />
                    Display Settings
                </CardTitle>
                <CardDescription>
                    Customize the appearance and layout of the application.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 w-full">
                <div className="grid gap-3">
                    <Label>Layout for Graphs</Label>
                    <Select
                        value={config.defaultLayout}
                        onValueChange={(e) => {
                            updateConfig({ defaultLayout: e as 'grid-3' | 'grid-2' | 'list' });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="grid-3">3-Column Grid Layout</SelectItem>
                                <SelectItem value="grid-2">2-Column Grid Layout</SelectItem>
                                <SelectItem value="list">List Layout</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-3">
                    <Label>Timeframe for Graphs</Label>
                    <Select
                        value={config.defaultTimeFrame}
                        onValueChange={(e) => {
                            updateConfig({ defaultTimeFrame: e });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Timeframe</SelectLabel>
                                <SelectItem value="1h">1H</SelectItem>
                                <SelectItem value="12h">12H</SelectItem>
                                <SelectItem value="24h">24H</SelectItem>
                                <SelectItem value="7d">7D</SelectItem>
                                <SelectItem value="30d">30D</SelectItem>
                                <SelectItem value="365d">365D</SelectItem>
                                <SelectLabel>Special</SelectLabel>
                                <SelectItem value="real-time">Real-Time (3M)</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-3">
                    <Label>Aggregation Mode for Graphs</Label>
                    <Select
                        value={config.defaultMonitorMode}
                        onValueChange={(e) => {
                            updateConfig({ defaultMonitorMode: e as 'avg' | 'max' | 'raw' });
                        }}
                    >
                        <SelectTrigger className="w-full">
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
                </div>
                <EnableCard
                    value={config.autoRefresh}
                    onChange={(v) => {
                        updateConfig({ autoRefresh: v });
                    }}
                    title={'Enable Auto Refresh for Graphs'}
                    description={
                        'Automatically refresh graphs at regular intervals to display the most recent data.'
                    }
                />
                <div className={'border-t my-1'} />
                <div className="grid gap-3">
                    <Label>Layout for Dashboard</Label>
                    <Select
                        value={config.dashboardLayout}
                        onValueChange={(e) => {
                            updateConfig({ dashboardLayout: e as 'grid' | 'list' | 'list2' });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="grid">Grid Layout</SelectItem>
                                <SelectItem value="list">1-Column List Layout</SelectItem>
                                <SelectItem value="list2">
                                    2-Column List Layout (Compact)
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <EnableCard
                    value={config.dashboardShowDetails}
                    onChange={(v) => {
                        updateConfig({ dashboardShowDetails: v });
                    }}
                    title={'Always Show Details on Dashboard'}
                    description={
                        'Show monitor details such as status, I/O, IOPS, Connections on the dashboard.'
                    }
                />
            </CardContent>
        </Card>
    );
};

export default DisplaySettings;
