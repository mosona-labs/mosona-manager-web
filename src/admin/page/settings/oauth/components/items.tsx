import { GripVerticalIcon, LoaderCircle } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx';
import ApiAdminOAuth, { type OAuthProviderType } from '@/api/admin/oauth.ts';
import { ToastError } from '@/utils/toast.ts';
import Edit from '@/admin/page/settings/oauth/components/edit.tsx';
import Delete from '@/admin/page/settings/oauth/components/delete.tsx';

const OAuthItem = ({ item, refresh }: { item: OAuthProviderType; refresh: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell className={'cursor-grab'} {...attributes} {...listeners}>
                <GripVerticalIcon className={'h-5 w-5 text-muted-foreground'} />
            </TableCell>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.is_enabled ? 'Yes' : 'No'}</TableCell>
            <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
            <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
            <TableCell className={'p-0 text-end'}>
                <Edit item={item} refresh={refresh} />
                <Delete item={item} refresh={refresh} />
            </TableCell>
        </TableRow>
    );
};

const OAuthItems = ({
    items,
    isLoading,
    refresh,
}: {
    items: OAuthProviderType[];
    isLoading: boolean;
    refresh: () => void;
}) => {
    const [sortedItems, setSortedItems] = useState(items);
    useEffect(() => {
        setSortedItems(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setSortedItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);

                ApiAdminOAuth.sort(newArray.map((item) => item.id))
                    .then(() => {
                        toast.success('Reorder successful', {
                            description: 'The OAuth providers have been reordered successfully.',
                        });
                    })
                    .catch(ToastError);

                return newArray;
            });
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
                items={sortedItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead className="min-w-[140px]">Name</TableHead>
                            <TableHead className="min-w-[40px]">Enabled</TableHead>
                            <TableHead className="min-w-[120px]">Updated</TableHead>
                            <TableHead className="min-w-[120px]">Created</TableHead>
                            <TableHead className="text-right min-w-[40px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">
                                    <LoaderCircle className={'mx-auto mb-2 animate-spin'} />
                                    Loading
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedItems.map((item) => (
                                <OAuthItem key={item.id} item={item} refresh={refresh} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </SortableContext>
            <DragOverlay />
        </DndContext>
    );
};

export default OAuthItems;
