import {
    ArrowDown,
    ArrowLeftRight,
    ArrowUp,
    ArrowUpDown,
    Cpu,
    HardDrive,
    Plus,
    Server,
    Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CategoryCard from './components/category';
import useMonitors from './hook/hook.ts';
import DetailBtn from './components/detail-btn';
import SkeletonCard from './components/skeleton-card.tsx';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import AddServer from '@/components/server/add';
import { useUser } from '@/context/useUser';
import AddCategory from '@/components/category/add';
import ManageCategory from '@/components/category/manage';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import LayoutBtn from '@/page/dashboard/components/layout-btn.tsx';
import { MemoryUnit } from '@/utils/unit.ts';

const Dashboard = () => {
    const navigator = useNavigate();
    const { categories } = useUser();
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    const {
        isLoading,
        time,
        statuses,
        total,
        online,
        avgCpu,
        avgMemory,
        sumRX,
        sumTX,
        categoryServerMap,
        categoryFilter,
        setCategoryFilter,
    } = useMonitors();

    useEffect(() => {
        let fadeInTimer: number | undefined;
        let fadeOutTimer: number | undefined;

        if (isLoading) {
            setShowSkeleton(true);
            setMounted(false);
        } else {
            fadeInTimer = window.setTimeout(() => setMounted(true), 60);
            fadeOutTimer = window.setTimeout(() => setShowSkeleton(false), 420);
        }

        return () => {
            if (fadeInTimer) window.clearTimeout(fadeInTimer);
            if (fadeOutTimer) window.clearTimeout(fadeOutTimer);
        };
    }, [isLoading]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 relative">
            {showSkeleton ? (
                <div
                    className="absolute inset-5 z-40 pointer-events-none overflow-hidden transition-opacity duration-400"
                    style={{ opacity: isLoading ? 1 : 0 }}
                >
                    <div className="flex flex-row justify-between items-center mb-3">
                        <div>
                            <div className="h-8 w-40 rounded bg-muted-foreground/10 animate-pulse" />
                            <div className="mt-2 h-4 w-64 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="hidden h-10 w-36 rounded bg-muted-foreground/8 animate-pulse lg:block" />
                            <div className="h-10 w-28 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                    </div>

                    <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Card
                                key={index}
                                className="border-border bg-card p-4 rounded-xl animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted-foreground/10" />
                                    <div>
                                        <div className="mb-2 h-3 w-24 rounded bg-muted-foreground/10" />
                                        <div className="h-6 w-20 rounded bg-muted-foreground/8" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
                        <div className="flex flex-col sm:flex-row justify-between lg:justify-start gap-2">
                            <div className="h-10 w-full sm:w-72 rounded bg-muted-foreground/8 animate-pulse" />
                            <div className="flex flex-row justify-between">
                                <div className="h-10 w-24 rounded bg-muted-foreground/8 animate-pulse" />
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-row justify-end gap-2">
                            <div className="h-10 w-28 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="mt-4 h-4 w-32 rounded bg-muted-foreground/8 animate-pulse" />
                        <div className="category-grid mt-2">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <SkeletonCard key={index} layout="grid" />
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            <div
                style={{
                    transition: 'opacity 400ms ease',
                    opacity: mounted ? 1 : 0,
                }}
            >
                <div
                    className="flex flex-row justify-between items-center mb-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(6px)',
                    }}
                >
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

                {/* Overview */}
                <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
                    <Card
                        className="border-border bg-card p-4"
                        style={{
                            transition: 'opacity 400ms ease, transform 400ms ease',
                            transitionDelay: '0ms',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(6px)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Server className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Total Servers
                                </p>
                                <p className="text-xl md:text-2xl font-semibold text-card-foreground">
                                    {isLoading ? '--' : online} / {isLoading ? '--' : total}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className="border-border bg-card p-4"
                        style={{
                            transition: 'opacity 400ms ease, transform 400ms ease',
                            transitionDelay: '80ms',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(6px)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-chart-1/10 p-2">
                                <Cpu className="h-5 w-5 text-chart-1" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">Avg CPU</p>
                                <p className="text-xl md:text-2xl font-semibold text-card-foreground">
                                    {isLoading ? '--' : avgCpu.toFixed(2) + '%'}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className="border-border bg-card p-4"
                        style={{
                            transition: 'opacity 400ms ease, transform 400ms ease',
                            transitionDelay: '160ms',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(6px)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-chart-3/10 p-2">
                                <HardDrive className="h-5 w-5 text-chart-3" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Avg Memory
                                </p>
                                <p className="text-xl md:text-2xl font-semibold text-card-foreground">
                                    {isLoading ? '--' : avgMemory.toFixed(2) + '%'}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className="border-border bg-card p-4"
                        style={{
                            transition: 'opacity 400ms ease, transform 400ms ease',
                            transitionDelay: '240ms',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(6px)',
                        }}
                    >
                        <div className="flex items-center h-full gap-3">
                            <div className="rounded-lg bg-chart-2/10 p-2">
                                <ArrowUpDown className="h-5 w-5 text-chart-2" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Network Traffic
                                </p>
                                <p className="text-xs sm:text-sm lg:text-lg font-semibold text-card-foreground flex flex-col mt-1 -mb-1 sm:my-0 sm:flex-row sm:items-center sm:gap-1 h-[2rem]">
                                    <div className={'flex flex-row items-center gap-1'}>
                                        <ArrowUp className="h-3 w-3 lg:h-4 lg:w-4" />
                                        {isLoading ? '--' : MemoryUnit(sumTX, 'kb') + '/s'}
                                    </div>
                                    <div className={'flex flex-row items-center gap-1'}>
                                        <ArrowDown className="h-3 w-3 lg:h-4 lg:w-4" />
                                        {isLoading ? '--' : MemoryUnit(sumRX, 'kb') + '/s'}
                                    </div>
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Config */}
                <div
                    className="mt-4 flex flex-col gap-2 lg:flex-row justify-between lg:items-center"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '120ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <div className="flex flex-col sm:flex-row justify-between lg:justify-start gap-2">
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
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'ghost'}
                                            className={cn(
                                                categoryFilter &&
                                                    categories
                                                        .slice(4)
                                                        .some((c) => c.id === categoryFilter)
                                                    ? 'bg-accent'
                                                    : ''
                                            )}
                                        >
                                            ...
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-40 mt-2 p-0 bg-background">
                                        <div className="space-y-2">
                                            {categories.slice(4).map((item) => (
                                                <Button
                                                    key={item.id}
                                                    variant={'ghost'}
                                                    className={cn(
                                                        'w-full justify-start',
                                                        categoryFilter == item.id ? 'bg-accent' : ''
                                                    )}
                                                    onClick={() => setCategoryFilter(item.id)}
                                                >
                                                    {item.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </ButtonGroup>
                        <div className={'flex flex-row justify-between'}>
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
                            <ButtonGroup className={'sm:hidden'}>
                                <LayoutBtn />
                                <DetailBtn />
                            </ButtonGroup>
                        </div>
                    </div>
                    <div className="flex-row justify-end gap-2 hidden sm:flex">
                        <ButtonGroup>
                            <LayoutBtn />
                            <DetailBtn />
                        </ButtonGroup>
                    </div>
                </div>

                {/* Server */}
                {categoryFilter == null
                    ? categories?.map((category) =>
                          categoryServerMap[category.id] ? (
                              <CategoryCard
                                  key={category.id}
                                  category={category}
                                  categoryServerMap={categoryServerMap}
                                  statuses={statuses}
                                  time={time}
                                  mounted={mounted}
                              />
                          ) : (
                              <div
                                  key={category.id}
                                  style={{
                                      transition: 'opacity 400ms ease, transform 400ms ease',
                                      opacity: mounted ? 1 : 0,
                                      transform: mounted ? 'none' : 'translateY(8px)',
                                  }}
                              >
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
                    : categories
                          ?.filter((c) => c.id === categoryFilter)
                          .map((category) =>
                              categoryServerMap[category.id] ? (
                                  <CategoryCard
                                      key={category.id}
                                      category={category}
                                      categoryServerMap={categoryServerMap}
                                      statuses={statuses}
                                      time={time}
                                      mounted={mounted}
                                  />
                              ) : (
                                  <div
                                      key={category.id}
                                      style={{
                                          transition: 'opacity 400ms ease, transform 400ms ease',
                                          opacity: mounted ? 1 : 0,
                                          transform: mounted ? 'none' : 'translateY(8px)',
                                      }}
                                  >
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
                          )}
            </div>
        </div>
    );
};

export default Dashboard;
