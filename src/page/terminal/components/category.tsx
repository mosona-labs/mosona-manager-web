import type { CategoryType } from '@/api/category';
import type { TerminalType } from '@/api/terminal';

import { Trash2, Settings, Package } from 'lucide-react';
import { useState } from 'react';

import ServerTerminalCard from './card';

import { ContextMenu } from '@/components/context-menu';
import EditCategory from '@/components/edit-category';

import '../components/category.css';

const TerminalCard = ({ server }: { server: TerminalType }) => {
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
                <ServerTerminalCard key={server.id} server={server} />
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
}: {
    category: CategoryType;
    categoryServerMap: Record<number, TerminalType[]>;
}) => {
    return (
        <div key={category.id}>
            <div className="mt-4">
                <p className="mt-4 opacity-65">{category.name}</p>
            </div>
            <div className="category-grid">
                {categoryServerMap[category.id]?.map((server) => (
                    <TerminalCard key={server.id} server={server} />
                ))}
            </div>
        </div>
    );
};

export default CategoryCard;
