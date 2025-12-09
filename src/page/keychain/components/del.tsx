import { useState } from 'react';
import { AlertCircleIcon } from 'lucide-react';

import ApiKey, { type KeyType } from '@/api/key.ts';
import { ToastError } from '@/utils/toast.ts';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { useUser } from '@/context/useUser.tsx';

const DelKey = ({
    open,
    onOpenChange,
    item,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: KeyType;
}) => {
    const { refreshKeys } = useUser();

    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = () => {
        setIsLoading(true);
        ApiKey.delete(item.id)
            .then(() => {
                refreshKeys().then();
                onOpenChange(false);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Key</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the key "{item.name}"? This action cannot be
                        undone.
                    </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Attention</AlertTitle>
                    <AlertDescription>
                        <p>
                            If any servers are still using this key, the deletion will fail. Please
                            remove all dependencies beforehand.
                        </p>
                    </AlertDescription>
                </Alert>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <LoadingButton
                        variant="destructive"
                        onClick={handleDelete}
                        isLoading={isLoading}
                    >
                        Delete
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DelKey;
