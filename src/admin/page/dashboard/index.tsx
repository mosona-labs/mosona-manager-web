import { Briefcase, Server, User, Voicemail } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useUser } from '@/context/useUser.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import ApiAdmin, { type SystemUsageStats } from '@/api/admin/admin.ts';
import { MonitorChart } from '@/page/monitor/components/monitor-chart.tsx';
import { ToastError } from '@/utils/toast.ts';

const numberFormatter = (num: number) => {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(2) + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(2) + 'K';
    } else {
        return num.toString();
    }
};

const Dashboard = () => {
    const { user, config } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    const [nowTime, setNowTime] = useState<Date>(new Date());
    const [data, setData] = useState({
        users: 0,
        teams: 0,
        servers: 0,
        records: 0,
    });
    const [system, setSystem] = useState<SystemUsageStats[]>([]);

    const load = () => {
        ApiAdmin.getDashboardStats()
            .then((res) => {
                setData(res.data);
                setSystem(res.data.system);
                setNowTime(new Date());
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };
    useEffect(() => {
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Hello, {user?.username}!</h1>
                    <p className="opacity-65">Overview of your system dashboard.</p>
                </div>
            </div>
            <div className={'flex flex-col gap-4'}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-1">
                    <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-card-foreground">
                                Total Users
                            </CardTitle>
                            <User className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {!isLoading ? numberFormatter(data.users) : '--'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-card-foreground">
                                Total Teams
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-chart-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {!isLoading ? numberFormatter(data.teams) : '--'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-card-foreground">
                                Total Servers
                            </CardTitle>
                            <Server className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {!isLoading ? numberFormatter(data.servers) : '--'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-card-foreground">
                                Total Records
                            </CardTitle>
                            <Voicemail className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {!isLoading ? numberFormatter(data.records) : '--'}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className={'grid gap-4 md:grid-cols-1 xl:grid-cols-2'}>
                    <div className={'relative'}>
                        <div
                            className={
                                'absolute w-full h-full flex items-center justify-center text-6xl font-bold text-foreground/20 top-0 left-0 pointer-events-none'
                            }
                        >
                            {system.length > 0 ? system[system.length - 1].cpu_usage : '0.00'}%
                        </div>
                        <MonitorChart
                            data={system || []}
                            defaultMode={config.defaultMonitorMode}
                            enableModeSwitch={true}
                            timeFrame={'24h'}
                            windowSize={60}
                            nowTime={nowTime}
                            title="CPU Usage"
                            description="System-wide CPU overview"
                            keyName="Usage"
                            keyUnit="%"
                            keyObj="cpu_usage"
                        />
                    </div>
                    <div className={'relative'}>
                        <div
                            className={
                                'absolute w-full h-full flex items-center justify-center text-6xl font-bold text-foreground/20 top-0 left-0 pointer-events-none'
                            }
                        >
                            {system.length > 0 ? system[system.length - 1].memory : '0.00'}%
                        </div>
                        <MonitorChart
                            data={system || []}
                            defaultMode={'raw'}
                            enableModeSwitch={false}
                            timeFrame={'24h'}
                            windowSize={10}
                            nowTime={nowTime}
                            title="Memory Usage"
                            description="System memory consumption overview"
                            keyName="Usage"
                            keyUnit="%"
                            keyObj="memory"
                            colorClass={'green'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
