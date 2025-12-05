import type { UserType } from '@/api/user.ts';

import { useState } from 'react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import ApiAdminUser from '@/api/admin/user.ts';
import { ToastError } from '@/utils/toast.ts';

const Del = ({
    user,
    refresh,
    open,
    setOpen,
}: {
    user: UserType;
    refresh: () => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = () => {
        setIsLoading(true);
        ApiAdminUser.del(user.id)
            .then(() => {
                toast.success('Delete successful', {
                    description: 'The user has been deleted successfully.',
                });
                refresh();
                setOpen(false);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="sm:max-w-[425px]"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Delete User "{user.username}"</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                            <p className={'mt-1 text-destructive'}>
                                This account owns teams, servers and other resources that will also
                                be deleted.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className={'mt-4'}>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <LoadingButton
                            variant={'destructive'}
                            onClick={onDelete}
                            isLoading={isLoading}
                        >
                            Delete
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Del;
