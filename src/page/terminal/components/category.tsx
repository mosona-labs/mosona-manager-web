import type { CategoryType } from '@/api/category';
import type { TerminalType } from '@/api/terminal';

import { Trash2, Settings, Package } from 'lucide-react';
import { useState } from 'react';

import ServerTerminalCard from './card';

import { ContextMenu } from '@/components/context-menu';
import EditCategory from '@/components/category/edit';
import EditServer from '@/components/server/edit';

import '../components/category.css';

const TerminalCard = ({ server }: { server: TerminalType }) => {
    const [openCategory, setOpenCategory] = useState<boolean>(false);

    const [openEdit, setOpenEdit] = useState<boolean>(false);

    return (
        <div>
            <ContextMenu
                items={[
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
                        onClick: () => console.log('刪除'),
                        danger: true,
                    },
                ]}
            >
                <ServerTerminalCard
                    key={server.id}
                    server={server}
                    openEdit={() => setOpenEdit(true)}
                />
            </ContextMenu>
            <EditCategory
                open={openCategory}
                onOpenChange={setOpenCategory}
                category_id={server.category}
                server_id={server.id}
            />
            <EditServer open={openEdit} onOpenChange={setOpenEdit} serverID={server.id} />
        </div>
    );
};

const CategoryCard = ({
    category,
    categoryServerMap,
    filter,
}: {
    category: CategoryType;
    categoryServerMap: Record<number, TerminalType[]>;
    filter: string;
}) => {
    const filterServer = (server: TerminalType): boolean => {
        if (!filter) return true;
        const lowerFilter = filter.toLowerCase();
        return (
            server.name.toLowerCase().includes(lowerFilter) ||
            server.address.toLowerCase().includes(lowerFilter)
        );
    };

    const filteredServers = categoryServerMap[category.id]?.filter(filterServer) || [];

    return (
        <div key={category.id}>
            <div className="mt-4">
                <p className="mt-4 opacity-65">{category.name}</p>
            </div>
            <div className="category-terminal-grid">
                {filteredServers.length ? (
                    filteredServers.map((server) => (
                        <TerminalCard key={server.id} server={server} />
                    ))
                ) : (
                    <div className="col-span-full">
                        <p className="text-sm text-muted-foreground/50">
                            No servers in this category.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;
