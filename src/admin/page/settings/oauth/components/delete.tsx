import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button.tsx';
import ApiAdminOAuth, { type OAuthProviderType } from '@/api/admin/oauth.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';

const Delete = ({ item, refresh }: { item: OAuthProviderType; refresh: () => void }) => {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        ApiAdminOAuth.del(item.id)
            .then(() => {
                toast.success('Delete successful', {
                    description: 'The OAuth2 provider has been deleted successfully.',
                });
                setOpen(false);
                refresh();
            })
            .catch(ToastError)
            .finally(() => {
                setIsDeleting(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'ghost'} className={'rounded-none'}>
                    <Trash2Icon />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the OAuth2
                        provider <strong>{item.name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <LoadingButton
                        isLoading={isDeleting}
                        onClick={handleDelete}
                        variant="destructive"
                    >
                        Delete
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Delete;
