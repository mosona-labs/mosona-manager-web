import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Plus, Save, GripVertical, Trash, Loader } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog';

import AddCategory from './add';

import { ToastError } from '@/utils/toast';
import { useUser } from '@/context/useUser';
import ApiCategory, { type CategoryType } from '@/api/category';

const CategoryItem = ({ id, name }: { id: number; name: string }) => {
    const { t } = useTranslation();
    const { refreshCategories } = useUser();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [nameInput, setNameInput] = useState(name);

    const handleDelete = () => {
        setIsDeleting(true);
        ApiCategory.delete(id)
            .then(() => {
                refreshCategories().finally(() => {
                    setIsDeleting(false);
                    toast.success(t('pages.category.deleted'));
                });
            })
            .catch((err) => {
                ToastError(err);
                setIsDeleting(false);
            });
    };

    const handleSave = () => {
        setIsSaving(true);
        ApiCategory.update(id, nameInput)
            .then(() => {
                refreshCategories().finally(() => {
                    setIsSaving(false);
                    toast.success(t('pages.category.updated'));
                });
            })
            .catch((err) => {
                ToastError(err);
                setIsSaving(false);
            });
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-row gap-2 items-center">
            <button
                className="cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-5 w-5 text-gray-400" />
            </button>
            <Input
                placeholder={t('pages.category.namePlaceholder')}
                value={nameInput}
                onChange={(e) => {
                    setNameInput(e.target.value);
                }}
            />
            <Button variant="outline" disabled={isSaving} onClick={handleSave}>
                {isSaving ? <Loader className="animate-spin" /> : <Save />}
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                        <Trash />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('pages.category.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('pages.category.deleteDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
                            <Loader
                                className="animate-spin"
                                style={{ display: isDeleting ? 'inline-block' : 'none' }}
                            />
                            {t('common.continue')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const ManageCategory = ({ children }: { children?: ReactNode }) => {
    const { t } = useTranslation();
    const { categories, refreshCategories } = useUser();
    const [sortedCategories, setSortedCategories] = useState<CategoryType[]>([]);
    useEffect(() => {
        if (categories) {
            setSortedCategories(categories.slice(1));
        }
    }, [categories]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSortedCategories((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                ApiCategory.sort(newItems.map((item) => item.id))
                    .then(() => {
                        refreshCategories().finally(() => {
                            toast.success(t('pages.category.orderUpdated'));
                        });
                    })
                    .catch(ToastError);

                return newItems;
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{t('pages.category.manageTitle')}</DialogTitle>
                    <DialogDescription>{t('pages.category.manageDesc')}</DialogDescription>
                </DialogHeader>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid gap-3">
                        <SortableContext
                            items={sortedCategories.map((c) => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {sortedCategories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    id={category.id}
                                    name={category.name}
                                />
                            ))}
                        </SortableContext>
                        <AddCategory>
                            <Button variant="outline" size={'sm'} className="w-full">
                                <Plus />
                            </Button>
                        </AddCategory>
                    </div>
                </DndContext>
            </DialogContent>
        </Dialog>
    );
};

export default ManageCategory;
