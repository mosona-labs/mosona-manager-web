import type { CategoryType } from '@/api/category';
import type { MonitorType, ServerStatusType } from '@/api/monitor';

import { Trash2, Settings, Package, Terminal, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ServerStatusCard from './card.tsx';

import { formatUptime } from '@/utils/time';
import { ContextMenu } from '@/components/context-menu';
import EditCategory from '@/components/category/edit';
import EditServer from '@/components/server/edit';
import { useSession } from '@/context/useSession';
import { useUser } from '@/context/useUser.tsx';
import { cn } from '@/lib/utils.ts';

import '../components/category.css';
import DeleteServer from '@/components/server/delete.tsx';

const MonitorCard = ({
    server,
    statuses,
    time,
}: {
    server: MonitorType;
    statuses: Record<number, ServerStatusType>;
    time: Date;
}) => {
    const navigator = useNavigate();
    const { createSession } = useSession();

    const { config } = useUser();

    let info;
    if (server.id in statuses) info = statuses[server.id];
    else
        info = {
            cpu: 0,
            mem_total_mb: 0,
            mem_used_mb: 0,
            disk_total_gb: 0,
            disk_used_gb: 0,
            rx_kib_s: 0,
            tx_kib_s: 0,
            rx_total_mb: 0,
            tx_total_mb: 0,
            time: '',
        };

    const [openCategory, setOpenCategory] = useState<boolean>(false);
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);

    return (
        <div key={server.id} className={'h-full'}>
            <ContextMenu
                className={'h-full'}
                items={[
                    {
                        label: 'View Details',
                        icon: <Eye className="h-4 w-4" />,
                        onClick: () => navigator(`/${server.id}/monitor`),
                    },
                    ...(server.allow_terminal
                        ? [
                              {
                                  label: 'Terminal',
                                  icon: <Terminal className="h-4 w-4" />,
                                  onClick: () => {
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
                                  },
                              },
                          ]
                        : []),
                    {
                        separator: true,
                        label: '',
                    },
                    {
                        label: 'Edit',
                        icon: <Settings className="h-4 w-4" />,
                        onClick: () => {
                            setOpenEdit(true);
                        },
                    },
                    {
                        label: 'Category',
                        icon: <Package className="h-4 w-4" />,
                        onClick: () => {
                            setOpenCategory(true);
                        },
                    },
                    {
                        separator: true,
                        label: '',
                    },
                    {
                        label: 'Delete',
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => {
                            setOpenDelete(true);
                        },
                        danger: true,
                    },
                ]}
            >
                <ServerStatusCard
                    key={server.id}
                    layout={config.dashboardLayout}
                    server={{
                        id: server.id,
                        name: server.name,
                        os: server.os,
                        location: server.county,
                        locationName: server.area,
                        status:
                            time.getTime() - new Date(info.time).getTime() < 5 * 1000
                                ? 'online'
                                : 'offline',
                        lastSeen: info.time || '',
                        cpu: statuses[server.id]?.cpu || 0,
                        memory:
                            Math.floor((info.mem_used_mb / info.mem_total_mb) * 100 * 100) / 100 ||
                            0,
                        memory_used: info.mem_used_mb || 0,
                        memory_total: info.mem_total_mb || 0,
                        swap:
                            info.swap_total_mb && info.swap_used_mb
                                ? Math.floor((info.swap_used_mb / info.swap_total_mb) * 100)
                                : 0 || 0,
                        swap_used: info.swap_used_mb || 0,
                        swap_total: info.swap_total_mb || 0,
                        disk:
                            Math.floor((info.disk_used_gb / info.disk_total_gb) * 100 * 100) /
                                100 || 0,
                        disk_used: info.disk_used_gb || 0,
                        disk_total: info.disk_total_gb || 0,
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
                    }}
                />
            </ContextMenu>
            <EditCategory
                open={openCategory}
                onOpenChange={setOpenCategory}
                category_id={server.category}
                server_id={server.id}
            />
            <EditServer open={openEdit} onOpenChange={setOpenEdit} serverID={server.id} />
            <DeleteServer
                open={openDelete}
                onOpenChange={setOpenDelete}
                serverName={server.name}
                serverID={server.id}
            />
        </div>
    );
};

const CategoryCard = ({
    category,
    categoryServerMap,
    statuses,
    time,
}: {
    category: CategoryType;
    categoryServerMap: Record<number, MonitorType[]>;
    statuses: Record<number, ServerStatusType>;
    time: Date;
}) => {
    const { config } = useUser();

    return (
        <div key={category.id}>
            <div className="mt-4">
                <p className="mt-4 opacity-65">{category.name}</p>
            </div>
            <div
                className={cn(
                    config.dashboardLayout === 'list'
                        ? 'grid mt-2 gap-4 grid-cols-1'
                        : config.dashboardLayout === 'list2'
                          ? 'grid mt-2 gap-4 grid-cols-1 md:grid-cols-2'
                          : 'category-grid'
                )}
            >
                {categoryServerMap[category.id]?.map((server) => (
                    <MonitorCard key={server.id} server={server} statuses={statuses} time={time} />
                ))}
            </div>
        </div>
    );
};

export default CategoryCard;
