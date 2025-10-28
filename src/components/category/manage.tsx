import { Plus, Save, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

import { useUser } from '@/context/useUser';
import ApiCategory from '@/api/category';
import { ToastError } from '@/utils/toast';

const CategoryItem = ({ id, name }: { id: number; name: string }) => {
    const { refresh } = useUser();

    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [nameInput, setNameInput] = useState(name);

    const handleDelete = () => {
        setIsDeleting(true);
        ApiCategory.delete(id)
            .then(() => {
                refresh().finally(() => {
                    setIsDeleting(false);
                    toast.success('Category deleted successfully');
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
                refresh().finally(() => {
                    setIsSaving(false);
                    toast.success('Category updated successfully');
                });
            })
            .catch((err) => {
                ToastError(err);
                setIsSaving(false);
            });
    };

    return (
        <div className="flex flex-row gap-2 items-center">
            <Input
                placeholder="Category Name"
                value={nameInput}
                onChange={(e) => {
                    setNameInput(e.target.value);
                }}
            />
            <Button variant="outline" disabled={isSaving} onClick={handleSave}>
                <Save />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                        <Trash />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete this category?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All servers under this category will be
                            moved to the default category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const ManageCategory = ({ children }: { children?: React.ReactNode }) => {
    const { categories } = useUser();

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Manage Category</DialogTitle>
                    <DialogDescription>Manage your existing categories here.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                    {categories?.slice(1).map((category) => (
                        <CategoryItem key={category.id} id={category.id} name={category.name} />
                    ))}
                    <AddCategory>
                        <Button variant="outline" size={'sm'} className="w-full">
                            <Plus />
                        </Button>
                    </AddCategory>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ManageCategory;
