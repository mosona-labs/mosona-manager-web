import {
    ArrowDown,
    ArrowLeftRight,
    ArrowUp,
    ArrowUpDown,
    Cpu,
    Database,
    HardDrive,
    MemoryStick,
    Plus,
    Server,
    Settings,
    StretchHorizontal,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
import { AlertProvider } from '@/page/dashboard/hook/useAlert.tsx';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import LayoutBtn from '@/page/dashboard/components/layout-btn.tsx';
import { MemoryUnit } from '@/utils/unit.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

const Dashboard = () => {
    const { t } = useTranslation();
    const navigator = useNavigate();
    const { categories } = useUser();
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [showAllOverviewCards, setShowAllOverviewCards] = useState(false);
    const [visibleCategoryCount, setVisibleCategoryCount] = useState(0);
    const categoryControlsRef = useRef<HTMLDivElement>(null);
    const categoryMeasureRef = useRef<HTMLDivElement>(null);

    const {
        isLoading,
        servers,
        statuses,
        onlineIds,
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

    const isDefaultCategory = (categoryName: string) =>
        categoryName.trim().toLowerCase() === 'default';

    const dashboardCategories = useMemo(() => categories?.slice(1) ?? [], [categories]);
    const visibleCategories = useMemo(
        () => dashboardCategories.slice(0, visibleCategoryCount),
        [dashboardCategories, visibleCategoryCount]
    );
    const overflowCategories = useMemo(
        () => dashboardCategories.slice(visibleCategoryCount),
        [dashboardCategories, visibleCategoryCount]
    );

    const extraOverviewStats = useMemo(() => {
        let totalCpuCores = 0;
        let hasCpuCores = false;
        let totalMemoryMb = 0;
        let totalStorageGb = 0;
        let totalBandwidthRxMb = 0;
        let totalBandwidthTxMb = 0;

        for (const server of servers) {
            if (categoryFilter !== null && server.category !== categoryFilter) continue;

            const coreCount = server.core_t ?? server.core_c;
            if (typeof coreCount === 'number') {
                totalCpuCores += coreCount;
                hasCpuCores = true;
            }

            const status = statuses[server.id];
            if (!status) continue;

            totalMemoryMb += status.mem_total_mb || 0;
            totalStorageGb +=
                status.disks?.reduce((sum, disk) => sum + (disk.total_gb || 0), 0) || 0;
            totalBandwidthRxMb += status.rx_total_mb || 0;
            totalBandwidthTxMb += status.tx_total_mb || 0;
        }

        return {
            totalCpuCores: hasCpuCores ? totalCpuCores.toString() : '--',
            totalMemory: MemoryUnit(totalMemoryMb, 'mb'),
            totalStorage: MemoryUnit(totalStorageGb, 'gb'),
            totalBandwidthRx: MemoryUnit(totalBandwidthRxMb, 'mb'),
            totalBandwidthTx: MemoryUnit(totalBandwidthTxMb, 'mb'),
        };
    }, [servers, statuses, categoryFilter]);

    useLayoutEffect(() => {
        const controls = categoryControlsRef.current;
        const measureRoot = categoryMeasureRef.current;
        if (!controls || !measureRoot) return;

        const measure = () => {
            const availableWidth = controls.getBoundingClientRect().width;
            const allButton = measureRoot.querySelector<HTMLButtonElement>(
                '[data-category-measure="all"]'
            );
            const moreButton = measureRoot.querySelector<HTMLButtonElement>(
                '[data-category-measure="more"]'
            );
            const categoryButtons = Array.from(
                measureRoot.querySelectorAll<HTMLButtonElement>(
                    '[data-category-measure="category"]'
                )
            );

            if (!availableWidth || !allButton || !moreButton) {
                setVisibleCategoryCount(dashboardCategories.length);
                return;
            }

            let usedWidth = allButton.getBoundingClientRect().width;
            let nextVisibleCount = 0;
            const moreWidth = moreButton.getBoundingClientRect().width;

            for (const categoryButton of categoryButtons) {
                const categoryWidth = categoryButton.getBoundingClientRect().width;
                const hasOverflowAfterThis = nextVisibleCount + 1 < dashboardCategories.length;
                const requiredWidth =
                    usedWidth + categoryWidth + (hasOverflowAfterThis ? moreWidth : 0);

                if (requiredWidth > availableWidth) {
                    break;
                }

                usedWidth += categoryWidth;
                nextVisibleCount++;
            }

            setVisibleCategoryCount(nextVisibleCount);
        };

        measure();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(controls);

        return () => resizeObserver.disconnect();
    }, [dashboardCategories]);

    const extraOverviewCards = [
        {
            label: t('pages.dashboard.totalStorage'),
            value: extraOverviewStats.totalStorage,
            icon: <Database className="h-3 w-3 md:h-5 md:w-5 text-chart-4" />,
            iconClassName: 'bg-chart-4/10',
        },
        {
            label: t('pages.dashboard.totalCpuCores'),
            value: extraOverviewStats.totalCpuCores,
            icon: <Cpu className="h-3 w-3 md:h-5 md:w-5 text-chart-1" />,
            iconClassName: 'bg-chart-1/10',
        },
        {
            label: t('pages.dashboard.totalMemory'),
            value: extraOverviewStats.totalMemory,
            icon: <MemoryStick className="h-3 w-3 md:h-5 md:w-5 text-chart-3" />,
            iconClassName: 'bg-chart-3/10',
        },
        {
            label: t('pages.dashboard.totalBandwidth'),
            value: '',
            icon: <ArrowUpDown className="h-3 w-3 md:h-5 md:w-5 text-chart-2" />,
            iconClassName: 'bg-chart-2/10',
            bandwidthTotal: true,
        },
    ];

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
        <div
            data-dashboard-scroll-root
            className="w-full p-5 h-full overflow-y-auto pb-24 relative"
        >
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
                        <h1 className="text-2xl font-bold">{t('pages.dashboard.title')}</h1>
                        <p className="opacity-65">{t('pages.dashboard.description')}</p>
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
                                <Server className="h-3 w-3 md:h-5 md:w-5  text-primary" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {t('pages.dashboard.totalServers')}
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
                                <Cpu className="h-3 w-3 md:h-5 md:w-5  text-chart-1" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {t('pages.dashboard.avgCpu')}
                                </p>
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
                                <HardDrive className="h-3 w-3 md:h-5 md:w-5  text-chart-3" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {t('pages.dashboard.avgMemory')}
                                </p>
                                <p className="text-xl md:text-2xl font-semibold text-card-foreground">
                                    {isLoading ? '--' : avgMemory.toFixed(2) + '%'}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className="border-border bg-card p-4 overflow-hidden"
                        style={{
                            transition: 'opacity 400ms ease, transform 400ms ease',
                            transitionDelay: '240ms',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(6px)',
                        }}
                    >
                        <div className="flex items-center h-full gap-3">
                            <div className="rounded-lg bg-chart-2/10 p-2">
                                <ArrowUpDown className="h-3 w-3 md:h-5 md:w-5 text-chart-2" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                                    {t('pages.dashboard.networkTraffic')}
                                </p>
                                <div className="text-xs 2xl:text-sm font-semibold text-card-foreground flex flex-col mt-1 -mb-1 2xl:my-0 2xl:flex-row 2xl:items-center 2xl:gap-1 h-[2rem]">
                                    <div className={'flex flex-row items-center gap-1'}>
                                        <ArrowUp className="h-3 w-3 2xl:h-4 2xl:w-4" />
                                        {isLoading ? '--' : MemoryUnit(sumTX, 'kb') + '/s'}
                                    </div>
                                    <div className={'flex flex-row items-center gap-1'}>
                                        <ArrowDown className="h-3 w-3 2xl:h-4 2xl:w-4" />
                                        {isLoading ? '--' : MemoryUnit(sumRX, 'kb') + '/s'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div
                    className={cn(
                        'overflow-hidden transition-[max-height,opacity,transform,margin-top] duration-200 ease-out',
                        showAllOverviewCards
                            ? 'mt-4 max-h-80 opacity-100 translate-y-0'
                            : 'mt-0 max-h-0 opacity-0 -translate-y-2'
                    )}
                >
                    <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
                        {extraOverviewCards.map((item, index) => (
                            <Card
                                key={item.label}
                                className="border-border bg-card p-4"
                                style={{
                                    transition: 'opacity 200ms ease, transform 200ms ease',
                                    transitionDelay: showAllOverviewCards
                                        ? `${index * 35}ms`
                                        : '0ms',
                                    opacity: mounted && showAllOverviewCards ? 1 : 0,
                                    transform:
                                        mounted && showAllOverviewCards
                                            ? 'none'
                                            : 'translateY(-6px)',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn('rounded-lg p-2', item.iconClassName)}>
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs md:text-sm text-muted-foreground">
                                            {item.label}
                                        </p>
                                        {item.bandwidthTotal ? (
                                            <div className="text-xs 2xl:text-sm font-semibold text-card-foreground flex flex-col mt-1 -mb-1 2xl:my-0 2xl:flex-row 2xl:items-center 2xl:gap-1 h-[2rem]">
                                                <div className="flex flex-row items-center gap-1">
                                                    <ArrowUp className="h-3 w-3 2xl:h-4 2xl:w-4" />
                                                    {isLoading
                                                        ? '--'
                                                        : extraOverviewStats.totalBandwidthTx}
                                                </div>
                                                <div className="flex flex-row items-center gap-1">
                                                    <ArrowDown className="h-3 w-3 2xl:h-4 2xl:w-4" />
                                                    {isLoading
                                                        ? '--'
                                                        : extraOverviewStats.totalBandwidthRx}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="truncate text-xl md:text-2xl font-semibold text-card-foreground">
                                                {isLoading ? '--' : item.value}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
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
                    <div className="flex min-w-0 flex-col sm:flex-row justify-between lg:justify-start gap-2 lg:flex-1">
                        <div ref={categoryControlsRef} className="min-w-0 max-w-full sm:flex-1">
                            <ButtonGroup className="max-w-full overflow-hidden border rounded-lg">
                                <Button
                                    variant={'ghost'}
                                    className={categoryFilter == null ? 'bg-accent' : ''}
                                    onClick={() => setCategoryFilter(null)}
                                >
                                    All
                                </Button>
                                {visibleCategories.map((category, index) => (
                                    <Button
                                        key={category.id}
                                        variant={'ghost'}
                                        className={cn(
                                            index < visibleCategories.length - 1 ||
                                                overflowCategories.length > 0
                                                ? 'border-e'
                                                : undefined,
                                            categoryFilter == category.id ? 'bg-accent' : ''
                                        )}
                                        onClick={() => setCategoryFilter(category.id)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                                {overflowCategories.length > 0 && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'ghost'}
                                                className={cn(
                                                    categoryFilter &&
                                                        overflowCategories.some(
                                                            (c) => c.id === categoryFilter
                                                        )
                                                        ? 'bg-accent'
                                                        : ''
                                                )}
                                            >
                                                ...
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40 mt-2 p-0 bg-background">
                                            <div className="space-y-2">
                                                {overflowCategories.map((item) => (
                                                    <Button
                                                        key={item.id}
                                                        variant={'ghost'}
                                                        className={cn(
                                                            'w-full justify-start',
                                                            categoryFilter == item.id
                                                                ? 'bg-accent'
                                                                : ''
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
                            <div
                                ref={categoryMeasureRef}
                                className="fixed -left-[9999px] top-0 pointer-events-none opacity-0"
                                aria-hidden="true"
                            >
                                <ButtonGroup className="border rounded-lg">
                                    <Button variant={'ghost'} data-category-measure="all">
                                        All
                                    </Button>
                                    {dashboardCategories.map((category) => (
                                        <Button
                                            key={category.id}
                                            variant={'ghost'}
                                            data-category-measure="category"
                                        >
                                            {category.name}
                                        </Button>
                                    ))}
                                    <Button variant={'ghost'} data-category-measure="more">
                                        ...
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </div>
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
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setShowAllOverviewCards((visible) => !visible)
                                            }
                                        >
                                            <StretchHorizontal />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="me-2">
                                        {showAllOverviewCards ? (
                                            <p>{t('pages.dashboard.hideOverview')}</p>
                                        ) : (
                                            <p>{t('pages.dashboard.showOverview')}</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                                <LayoutBtn />
                                <DetailBtn />
                            </ButtonGroup>
                        </div>
                    </div>
                    <div className="flex-row justify-end gap-2 hidden sm:flex">
                        <ButtonGroup>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowAllOverviewCards((visible) => !visible)
                                        }
                                    >
                                        <StretchHorizontal />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="me-2">
                                    {showAllOverviewCards ? (
                                        <p>{t('pages.dashboard.hideOverview')}</p>
                                    ) : (
                                        <p>{t('pages.dashboard.showOverview')}</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                            <LayoutBtn />
                            <DetailBtn />
                        </ButtonGroup>
                    </div>
                </div>

                {/* Server */}
                <AlertProvider>
                    {categories
                        ?.filter((c) => categoryFilter == null || c.id === categoryFilter)
                        .map((category) => {
                            const hasServers = !!categoryServerMap[category.id];

                            if (
                                categoryFilter == null &&
                                !hasServers &&
                                isDefaultCategory(category.name)
                            )
                                return null;

                            return hasServers ? (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    categoryServerMap={categoryServerMap}
                                    statuses={statuses}
                                    onlineIds={onlineIds}
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
                            );
                        })}
                </AlertProvider>
            </div>
        </div>
    );
};

export default Dashboard;
