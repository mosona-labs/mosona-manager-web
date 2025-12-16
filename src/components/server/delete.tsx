import { useState } from 'react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import ApiServer from '@/api/server.ts';
import { ToastError } from '@/utils/toast.ts';

const DeleteServer = ({
    open,
    onOpenChange,
    serverName,
    serverID,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serverName: string;
    serverID: number;
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>('');

    const onDelete = () => {
        if (name !== serverName) {
            toast.warning('Server name does not match.', {
                description: 'Please type the correct server name to confirm deletion.',
            });
            return;
        }

        setIsLoading(true);
        ApiServer.delete(serverID)
            .then(() => {
                toast.success('Server deleted successfully.', {});
                onOpenChange(false);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Server</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <p>Are you sure you want to delete the server {serverName}?</p>
                    <p>
                        All data associated with this server will be permanently removed. To
                        confirm, please type the server name below.
                    </p>
                    <div className="grid gap-3">
                        <p className={'text-sm font-semibold'}>
                            Please type the server name{' '}
                            <b className={'text-destructive'}>{serverName}</b> to confirm.
                        </p>
                        <Input
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <LoadingButton isLoading={isLoading} variant={'destructive'} onClick={onDelete}>
                        Delete
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteServer;
