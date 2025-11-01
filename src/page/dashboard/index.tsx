import {
    ArrowLeftRight,
    Cpu,
    HardDrive,
    LayoutGrid,
    LoaderCircle,
    Monitor,
    Plus,
    Server,
    Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CategoryCard from './components/category';
import useMonitors from './hook';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import AddServer from '@/components/add-server';
import { useUser } from '@/context/useUser';
import AddCategory from '@/components/category/add';
import ManageCategory from '@/components/category/manage';
import { cn } from '@/lib/utils';

const Dashboard = () => {
    const navigator = useNavigate();
    const { categories } = useUser();

    const {
        isLoading,
        time,
        statuses,
        total,
        online,
        avgCpu,
        avgMemory,
        categoryServerMap,
        categoryFilter,
        setCategoryFilter,
    } = useMonitors();

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
                                <p className="text-2xl font-semibold text-card-foreground">
                                    {isLoading ? '--' : total}
                                </p>
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
                                <p className="text-2xl font-semibold text-card-foreground">
                                    {isLoading ? '--' : online}
                                </p>
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
                                    {isLoading ? '--' : avgCpu.toFixed(2) + '%'}
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
                                <p className="text-2xl font-semibold text-card-foreground">
                                    {isLoading ? '--' : avgMemory.toFixed(2) + '%'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Config */}
                <div className="mt-4 flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
                    <div className="flex flex-row justify-between lg:justify-start gap-2">
                        <ButtonGroup className="border rounded-lg">
                            <Button
                                variant={'ghost'}
                                className={categoryFilter == null ? 'bg-accent' : ''}
                                onClick={() => setCategoryFilter(null)}
                            >
                                All
                            </Button>
                            {categories
                                ?.slice(1)
                                .slice(0, 3)
                                ?.map((category, index) => (
                                    <Button
                                        key={category.id}
                                        variant={'ghost'}
                                        className={cn(
                                            index < categories.length - 1 ? 'border-e' : undefined,
                                            categoryFilter == category.id ? 'bg-accent' : ''
                                        )}
                                        onClick={() => setCategoryFilter(category.id)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            {categories && categories.length > 4 && (
                                <Button variant={'ghost'}>...</Button>
                            )}
                        </ButtonGroup>
                        <ButtonGroup className="border rounded-lg">
                            <ManageCategory>
                                <Button variant={'ghost'} className="border-e">
                                    <Settings />
                                </Button>
                            </ManageCategory>
                            <AddCategory>
                                <Button variant={'ghost'}>
                                    <Plus />
                                </Button>
                            </AddCategory>
                        </ButtonGroup>
                    </div>
                    <div className="flex flex-row justify-end gap-2">
                        <ButtonGroup>
                            <Button variant="outline">
                                <LayoutGrid />
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>

                {/* Server */}
                {isLoading ? (
                    <div className="mt-4">
                        <LoaderCircle className="animate-spin text-muted-foreground" size={48} />
                    </div>
                ) : categoryFilter == null ? (
                    categories?.map((category) =>
                        categoryServerMap[category.id] ? (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                categoryServerMap={categoryServerMap}
                                statuses={statuses}
                                time={time}
                            />
                        ) : (
                            <div key={category.id}>
                                <div className="mt-4">
                                    <p className="mt-4 opacity-65">{category.name}</p>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-muted-foreground/50">
                                        No servers in this category.
                                    </p>
                                </div>
                            </div>
                        )
                    )
                ) : (
                    categories
                        ?.filter((c) => c.id === categoryFilter)
                        .map((category) =>
                            categoryServerMap[category.id] ? (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    categoryServerMap={categoryServerMap}
                                    statuses={statuses}
                                    time={time}
                                />
                            ) : (
                                <div key={category.id}>
                                    <div className="mt-4">
                                        <p className="mt-4 opacity-65">{category.name}</p>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-sm text-muted-foreground/50">
                                            No servers in this category.
                                        </p>
                                    </div>
                                </div>
                            )
                        )
                )}
            </div>
        </div>
    );
};

export default Dashboard;
