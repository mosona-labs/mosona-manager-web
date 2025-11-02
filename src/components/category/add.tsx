import { useState } from 'react';
import { Loader } from 'lucide-react';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';

import { useUser } from '@/context/useUser';
import ApiCategory from '@/api/category';
import { ToastError } from '@/utils/toast';

const AddCategory = ({ children }: { children?: React.ReactNode }) => {
    const { categories, refresh } = useUser();

    const [open, setOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');

    const isCategoryNameExists = categories?.some(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    const [isLoading, setIsLoading] = useState(false);
    const handleCreate = () => {
        setIsLoading(true);
        ApiCategory.create(categoryName)
            .then(() => {
                setCategoryName('');
                setOpen(false);
                refresh();
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>
                        Add a new category to organize your servers.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            className="mt-2"
                            value={categoryName}
                            onChange={(e) => {
                                setCategoryName(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key == 'Enter') {
                                    handleCreate();
                                }
                            }}
                        />
                        {isCategoryNameExists && (
                            <p className="text-sm text-red-500/80">Category name already exists.</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        disabled={isCategoryNameExists || !categoryName || isLoading}
                        onClick={handleCreate}
                    >
                        <Loader
                            className="animate-spin"
                            style={{ display: isLoading ? 'inline-block' : 'none' }}
                        />
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddCategory;
