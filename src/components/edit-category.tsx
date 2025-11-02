import { useState } from 'react';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Button } from './ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

import { useUser } from '@/context/useUser';
import ApiServer from '@/api/server';
import { ToastError } from '@/utils/toast';

const EditCategory = ({
    open,
    onOpenChange,
    category_id,
    server_id,
}: {
    open: boolean;
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
    category_id: number;
    server_id: number;
}) => {
    const { categories } = useUser();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [value, setValue] = useState<string>(category_id.toString());

    const handleSubmit = () => {
        setIsLoading(true);
        ApiServer.setCategory(server_id, parseInt(value))
            .then(() => {
                onOpenChange(false);
                toast.success('Category updated successfully', {
                    description: `The changes will take effect in 3 seconds.`,
                });
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Change the category information for server ID {server_id}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Category</Label>
                        <Select value={value} onValueChange={setValue}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a fruit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {categories?.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
                        <Loader
                            className="animate-spin"
                            style={{ display: isLoading ? 'inline-block' : 'none' }}
                        />
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategory;
