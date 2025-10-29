import type { CategoryType } from '@/api/category';
import type { MonitorType, ServerStatusType } from '@/api/monitor';

import { Trash2, Settings, Package } from 'lucide-react';
import { useState } from 'react';

import ServerStatusCard from './card';

import { formatUptime } from '@/utils/time';
import { ContextMenu } from '@/components/context-menu';
import EditCategory from '@/components/edit-category';

const MonitorCard = ({
    server,
    statuses,
    time,
}: {
    server: MonitorType;
    statuses: Record<number, ServerStatusType>;
    time: Date;
}) => {
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

    return (
        <div key={server.id}>
            <ContextMenu
                items={[
                    {
                        label: 'Edit',
                        icon: <Settings className="h-4 w-4" />,
                        onClick: () => console.log('編輯'),
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
                        onClick: () => console.log('刪除'),
                        danger: true,
                    },
                ]}
            >
                <ServerStatusCard
                    key={server.id}
                    server={{
                        id: 1,
                        name: server.name,
                        os: server.os,
                        location: server.county,
                        locationName: server.area,
                        status:
                            time.getTime() - new Date(info.time).getTime() < 5 * 1000
                                ? 'online'
                                : 'offline',
                        cpu: statuses[server.id]?.cpu || 0,
                        memory:
                            Math.floor((info.mem_used_mb / info.mem_total_mb) * 100 * 100) / 100 ||
                            0,
                        disk:
                            Math.floor((info.disk_used_gb / info.disk_total_gb) * 100 * 100) /
                                100 || 0,
                        uptime: formatUptime(server.open_time, time),
                        networkUp: info.rx_kib_s || 0,
                        networkDown: info.tx_kib_s || 0,
                    }}
                />
            </ContextMenu>
            <EditCategory
                open={openCategory}
                onOpenChange={setOpenCategory}
                category_id={server.category}
                server_id={server.id}
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
    return (
        <div key={category.id}>
            <div className="mt-4">
                <p className="mt-4 opacity-65">{category.name}</p>
            </div>
            <div className="mt-2 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {categoryServerMap[category.id]?.map((server) => (
                    <MonitorCard key={server.id} server={server} statuses={statuses} time={time} />
                ))}
            </div>
        </div>
    );
};

export default CategoryCard;
