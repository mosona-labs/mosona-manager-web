import type { CategoryType } from '@/api/category';
import type { MonitorType, ServerStatusType } from '@/api/monitor';

import { Trash2, Settings, Package, Terminal, Eye, Bell } from 'lucide-react';
import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ServerStatusCard from './card.tsx';

import { cn } from '@/lib/utils.ts';
import { formatUptime } from '@/utils/time';
import { ContextMenu, type ContextMenuItem } from '@/components/context-menu';
import EditCategory from '@/components/category/edit';
import EditServer from '@/components/server/edit';
import { useSession } from '@/context/useSession';
import { useUser } from '@/context/useUser.tsx';
import DeleteServer from '@/components/server/delete.tsx';
import AlertDialog from '@/page/dashboard/components/alerts/alerts.tsx';
import { getDiskLabel, getDiskUsagePercentage, getStatusDisks } from '@/utils/disk.ts';

import '../components/category.css';

// Stable fallback so cards without a status report don't produce new props every render.
const EMPTY_STATUS: ServerStatusType = {
    cpu: 0,
    mem_total_mb: 0,
    mem_used_mb: 0,
    swap_total_mb: 0,
    swap_used_mb: 0,
    disks: [],
    disk_read_kib_s: 0,
    disk_write_kib_s: 0,
    disk_read_iops: 0,
    disk_write_iops: 0,
    rx_kib_s: 0,
    tx_kib_s: 0,
    rx_total_mb: 0,
    tx_total_mb: 0,
    tcp_total: 0,
    udp_total: 0,
    time: '',
};

const ENTER_DELAY_CAP_MS = 900;
const DIALOG_EXIT_MS = 200;
const VIRTUAL_OVERSCAN_PX = 1000;

type DashboardLayout = 'list' | 'list2' | 'grid';
type DialogKind = 'category' | 'edit' | 'delete' | 'alert';
type DialogState = { kind: DialogKind; open: boolean } | null;
type VisibilityCallback = (visible: boolean) => void;
type VisibilityObserverBucket = {
    observer: IntersectionObserver;
    callbacks: Map<Element, VisibilityCallback>;
    stopFallback: () => void;
};

const visibilityObservers = new WeakMap<Element, VisibilityObserverBucket>();

const isNearVirtualViewport = (root: Element, element: Element) => {
    const elementRect = element.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    return (
        elementRect.bottom >= rootRect.top - VIRTUAL_OVERSCAN_PX &&
        elementRect.top <= rootRect.bottom + VIRTUAL_OVERSCAN_PX
    );
};

const observeNearViewport = (
    root: Element,
    element: Element,
    callback: VisibilityCallback
) => {
    let bucket = visibilityObservers.get(root);
    if (!bucket) {
        const callbacks = new Map<Element, VisibilityCallback>();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    callbacks.get(entry.target)?.(entry.isIntersecting);
                }
            },
            {
                root,
                rootMargin: `${VIRTUAL_OVERSCAN_PX}px 0px`,
            }
        );

        // IntersectionObserver can be delayed for background tabs and instant
        // scroll-position restores. Recheck once after scrolling settles; the
        // normal scrolling path remains handled by the browser observer.
        let fallbackTimer: number | null = null;
        const checkAfterScroll = () => {
            if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
            fallbackTimer = window.setTimeout(() => {
                fallbackTimer = null;
                for (const [target, targetCallback] of callbacks) {
                    targetCallback(isNearVirtualViewport(root, target));
                }
            }, 80);
        };
        root.addEventListener('scroll', checkAfterScroll, { passive: true });
        const stopFallback = () => {
            root.removeEventListener('scroll', checkAfterScroll);
            if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
        };

        bucket = { observer, callbacks, stopFallback };
        visibilityObservers.set(root, bucket);
    }

    bucket.callbacks.set(element, callback);
    bucket.observer.observe(element);

    return () => {
        const currentBucket = visibilityObservers.get(root);
        if (!currentBucket) return;
        currentBucket.observer.unobserve(element);
        currentBucket.callbacks.delete(element);
        if (currentBucket.callbacks.size === 0) {
            currentBucket.observer.disconnect();
            currentBucket.stopFallback();
            visibilityObservers.delete(root);
        }
    };
};

const getEstimatedCardHeight = (layout: DashboardLayout, showDetails: boolean) => {
    if (layout === 'grid') return showDetails ? 542 : 348;
    if (layout === 'list2') return showDetails ? 238 : 206;
    return showDetails ? 260 : 162;
};

const MonitorCard = memo(
    ({
        server,
        status,
        online,
        mounted,
        index,
        layout,
        showDetails,
        onKeepAliveChange,
    }: {
        server: MonitorType;
        status?: ServerStatusType;
        online: boolean;
        mounted: boolean;
        index: number;
        layout: DashboardLayout;
        showDetails: boolean;
        onKeepAliveChange: (keepAlive: boolean) => void;
    }) => {
        const { t } = useTranslation();
        const navigator = useNavigate();
        const { createSession } = useSession();

        const info = status ?? EMPTY_STATUS;

        const disks = useMemo(
            () =>
                getStatusDisks(info).map((disk, diskIndex) => ({
                    label: getDiskLabel(diskIndex),
                    mountPoint: disk.mp,
                    usage: getDiskUsagePercentage(disk),
                    used: disk.used_gb,
                    total: disk.total_gb,
                })),
            [info]
        );

        const [dialog, setDialog] = useState<DialogState>(null);
        const dialogMounted = dialog !== null;

        const openDialog = useCallback((kind: DialogKind) => {
            setDialog({ kind, open: true });
        }, []);

        const handleDialogOpenChange = useCallback<Dispatch<SetStateAction<boolean>>>((value) => {
            setDialog((current) => {
                if (!current) return current;
                const open = typeof value === 'function' ? value(current.open) : value;
                return current.open === open ? current : { ...current, open };
            });
        }, []);

        useEffect(() => {
            if (!dialog || dialog.open) return;
            const closingDialog = dialog;
            const timer = window.setTimeout(() => {
                setDialog((current) => (current === closingDialog ? null : current));
            }, DIALOG_EXIT_MS);
            return () => window.clearTimeout(timer);
        }, [dialog]);

        useEffect(() => {
            onKeepAliveChange(dialogMounted);
        }, [dialogMounted, onKeepAliveChange]);

        const openTerminal = useCallback(() => {
            createSession(
                {
                    serverId: server.id,
                    name: server.name,
                    os: server.os,
                    terminalConfig: {
                        cols: 80,
                        rows: 24,
                        term: 'xterm-256color',
                    },
                },
                (sessionId) => {
                    navigator(`/session/${sessionId}`);
                }
            );
        }, [createSession, navigator, server.id, server.name, server.os]);

        const menuItems = useMemo<ContextMenuItem[]>(
            () => [
                {
                    label: t('pages.contextMenu.viewDetails'),
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => navigator(`/${server.id}/monitor`),
                },
                ...(server.allow_terminal
                    ? [
                          {
                              label: t('pages.contextMenu.terminal'),
                              icon: <Terminal className="h-4 w-4" />,
                              onClick: openTerminal,
                          },
                      ]
                    : []),
                { separator: true },
                {
                    label: t('pages.contextMenu.notifications'),
                    icon: <Bell className="h-4 w-4" />,
                    onClick: () => openDialog('alert'),
                },
                { separator: true },
                {
                    label: t('pages.contextMenu.edit'),
                    icon: <Settings className="h-4 w-4" />,
                    onClick: () => openDialog('edit'),
                },
                {
                    label: t('pages.contextMenu.category'),
                    icon: <Package className="h-4 w-4" />,
                    onClick: () => openDialog('category'),
                },
                { separator: true },
                {
                    label: t('pages.contextMenu.delete'),
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => openDialog('delete'),
                    danger: true,
                },
            ],
            [t, navigator, server.id, server.allow_terminal, openTerminal, openDialog]
        );

        // Only rebuilt when the inputs actually change (status objects are
        // reference-stabilized by useMonitors), so the memoized card below
        // can skip rendering on unrelated updates.
        const cardServer = useMemo(
            () => ({
                id: server.id,
                name: server.name,
                os: server.os,
                location: server.county,
                locationName: server.area,
                status: online ? ('online' as const) : ('offline' as const),
                lastSeen: info.time || '',
                cpu: info.cpu || 0,
                memory: Math.floor((info.mem_used_mb / info.mem_total_mb) * 100 * 100) / 100 || 0,
                memory_used: info.mem_used_mb || 0,
                memory_total: info.mem_total_mb || 0,
                swap:
                    info.swap_total_mb && info.swap_used_mb
                        ? Math.floor((info.swap_used_mb / info.swap_total_mb) * 100)
                        : 0,
                swap_used: info.swap_used_mb || 0,
                swap_total: info.swap_total_mb || 0,
                disks,
                uptime: formatUptime(server.open_time),
                networkUp: info.rx_kib_s || 0,
                networkDown: info.tx_kib_s || 0,
                networkUpTotal: info.rx_total_mb || 0,
                networkDownTotal: info.tx_total_mb || 0,
                diskReadKibS: info.disk_read_kib_s || 0,
                diskWriteKibS: info.disk_write_kib_s || 0,
                diskReadIOPS: info.disk_read_iops || 0,
                diskWriteIOPS: info.disk_write_iops || 0,
                tcpTotal: info.tcp_total || 0,
                udpTotal: info.udp_total || 0,

                provider: server.provider || null,
                cycle: server.cycle || null,
                start_time: server.start_time || null,
                end_time: server.end_time || null,
                amount: server.amount || null,
                bandwidth: server.bandwidth || null,
                traffic: server.traffic || null,
                note_public: server.note_public || null,
            }),
            [server, info, online, disks]
        );

        return (
            <div
                className="h-full"
                style={{
                    transition: 'opacity 400ms ease, transform 400ms ease',
                    transitionDelay: `${Math.min(160 + index * 70, ENTER_DELAY_CAP_MS)}ms`,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'none' : 'translateY(10px)',
                }}
            >
                <ContextMenu className="h-full" items={menuItems}>
                    <ServerStatusCard
                        server={cardServer}
                        layout={layout}
                        showDetails={showDetails}
                    />
                </ContextMenu>
                {dialog?.kind === 'category' && (
                    <EditCategory
                        open={dialog.open}
                        onOpenChange={handleDialogOpenChange}
                        category_id={server.category}
                        server_id={server.id}
                    />
                )}
                {dialog?.kind === 'edit' && (
                    <EditServer
                        open={dialog.open}
                        onOpenChange={handleDialogOpenChange}
                        serverID={server.id}
                    />
                )}
                {dialog?.kind === 'delete' && (
                    <DeleteServer
                        open={dialog.open}
                        onOpenChange={handleDialogOpenChange}
                        serverName={server.name}
                        serverID={server.id}
                    />
                )}
                {dialog?.kind === 'alert' && (
                    <AlertDialog
                        open={dialog.open}
                        onOpenChange={handleDialogOpenChange}
                        serverID={server.id}
                        serverName={server.name}
                    />
                )}
            </div>
        );
    }
);
MonitorCard.displayName = 'MonitorCard';

const VirtualizedMonitorCard = memo(
    ({
        server,
        status,
        online,
        mounted,
        index,
        layout,
        showDetails,
    }: {
        server: MonitorType;
        status?: ServerStatusType;
        online: boolean;
        mounted: boolean;
        index: number;
        layout: DashboardLayout;
        showDetails: boolean;
    }) => {
        const slotRef = useRef<HTMLDivElement>(null);
        const [nearViewport, setNearViewport] = useState(false);
        const [keepAlive, setKeepAlive] = useState(false);
        const [measurement, setMeasurement] = useState<{
            key: string;
            height: number;
        } | null>(null);

        const measurementKey = `${layout}:${showDetails ? 'details' : 'compact'}`;
        const shouldRender = nearViewport || keepAlive;
        const estimatedHeight = getEstimatedCardHeight(layout, showDetails);
        const placeholderHeight =
            measurement?.key === measurementKey ? measurement.height : estimatedHeight;

        useLayoutEffect(() => {
            const element = slotRef.current;
            const root = element?.closest('[data-dashboard-scroll-root]');
            if (!element || !root || typeof IntersectionObserver === 'undefined') {
                setNearViewport(true);
                return;
            }

            setNearViewport(isNearVirtualViewport(root, element));

            return observeNearViewport(root, element, (visible) => {
                setNearViewport((current) => (current === visible ? current : visible));
            });
        }, [measurementKey]);

        useLayoutEffect(() => {
            const element = slotRef.current;
            if (!shouldRender || !element) return;

            const updateMeasurement = () => {
                const height = Math.ceil(element.getBoundingClientRect().height);
                if (height <= 0) return;
                setMeasurement((current) =>
                    current?.key === measurementKey && current.height === height
                        ? current
                        : { key: measurementKey, height }
                );
            };

            updateMeasurement();
            if (typeof ResizeObserver === 'undefined') return;
            const observer = new ResizeObserver(updateMeasurement);
            observer.observe(element);
            return () => observer.disconnect();
        }, [measurementKey, shouldRender]);

        return (
            <div
                ref={slotRef}
                data-virtual-card
                data-rendered={shouldRender ? 'true' : 'false'}
                aria-hidden={shouldRender ? undefined : true}
                className="min-w-0"
                style={shouldRender ? undefined : { height: `${placeholderHeight}px` }}
            >
                {shouldRender && (
                    <MonitorCard
                        server={server}
                        status={status}
                        online={online}
                        mounted={mounted}
                        index={index}
                        layout={layout}
                        showDetails={showDetails}
                        onKeepAliveChange={setKeepAlive}
                    />
                )}
            </div>
        );
    }
);
VirtualizedMonitorCard.displayName = 'VirtualizedMonitorCard';

const CategoryCard = ({
    category,
    categoryServerMap,
    statuses,
    onlineIds,
    mounted,
}: {
    category: CategoryType;
    categoryServerMap: Record<number, MonitorType[]>;
    statuses: Record<number, ServerStatusType>;
    onlineIds: Set<number>;
    mounted: boolean;
}) => {
    const { config } = useUser();
    const layout = config.dashboardLayout;
    const showDetails = config.dashboardShowDetails;

    return (
        <>
            <div
                className="mt-4"
                style={{
                    transition: 'opacity 400ms ease, transform 400ms ease',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'none' : 'translateY(8px)',
                }}
            >
                <p className="mt-4 opacity-65">{category.name}</p>
            </div>
            <div
                className={cn(
                    layout === 'list'
                        ? 'grid mt-2 gap-4 grid-cols-1'
                        : layout === 'list2'
                          ? 'grid mt-2 gap-4 grid-cols-1 md:grid-cols-2'
                          : 'category-grid'
                )}
            >
                {categoryServerMap[category.id]?.map((server, index) => (
                    <VirtualizedMonitorCard
                        key={server.id}
                        server={server}
                        status={statuses[server.id]}
                        online={onlineIds.has(server.id)}
                        mounted={mounted}
                        index={index}
                        layout={layout}
                        showDetails={showDetails}
                    />
                ))}
            </div>
        </>
    );
};

export default CategoryCard;
