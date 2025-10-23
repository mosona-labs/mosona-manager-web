import { ArrowLeftRight, Cpu, HardDrive, LayoutGrid, Monitor, Server, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ServerStatusCard from './card';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import AddServer from '@/components/add-server';

const Dashboard = () => {
    const navigator = useNavigate();

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="opacity-65">Monitor your infrastructure in real-time</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Button
                        className="lg:flex hidden"
                        variant={'outline'}
                        onClick={() => navigator('/terminal')}
                    >
                        <ArrowLeftRight />
                        Terminal Mode
                    </Button>
                    <AddServer />
                </div>
            </div>
            <div>
                {/* Overview */}
                <div className="grid gap-4 lg:grid-cols-4">
                    <Card className="border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Server className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Servers</p>
                                <p className="text-2xl font-semibold text-card-foreground">NaN</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-chart-2/10 p-2">
                                <Monitor className="h-5 w-5 text-chart-2" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Online</p>
                                <p className="text-2xl font-semibold text-card-foreground">NaN</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-chart-1/10 p-2">
                                <Cpu className="h-5 w-5 text-chart-1" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg CPU</p>
                                <p className="text-2xl font-semibold text-card-foreground">
                                    {Math.round(NaN)}%
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-chart-3/10 p-2">
                                <HardDrive className="h-5 w-5 text-chart-3" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Memory</p>
                                <p className="text-2xl font-semibold text-card-foreground">NaN %</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Config */}
                <div className="mt-4 flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-3">
                        <ButtonGroup className="border rounded-lg">
                            <Button variant={'ghost'} className="bg-accent">
                                All
                            </Button>
                            <Button variant={'ghost'} className="border-e">
                                Category 1
                            </Button>
                            <Button variant={'ghost'}>Category 2</Button>
                        </ButtonGroup>
                    </div>
                    <ButtonGroup>
                        <Button variant="outline">
                            <LayoutGrid />
                        </Button>
                        <Button variant="outline">
                            <SortAsc />
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Server */}
                <div className="mt-4">
                    <p className="mt-4 opacity-65">Category 1</p>
                </div>
                <div className="mt-2 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                    <ServerStatusCard
                        server={{
                            id: 1,
                            name: 'web-prod-01',
                            os: 'ubuntu',
                            location: 'US',
                            locationName: 'San Francisco',
                            status: 'online',
                            cpu: 45,
                            memory: 68,
                            disk: 52,
                            uptime: '45d 12h 34m',
                            networkUp: 125.4,
                            networkDown: 89.2,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
