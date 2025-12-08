import { type FormEvent, useState } from 'react';
import { Loader } from 'lucide-react';

import ApiKey, { type KeyType } from '@/api/key.ts';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import { ToastError } from '@/utils/toast.ts';
import DelKey from '@/page/keychain/components/del.tsx';

const EditKey = ({
    open,
    onOpenChange,
    item,
    refresh,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: KeyType;
    refresh: () => void;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [delOpen, setDelOpen] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;

        setIsLoading(true);
        ApiKey.edit(item.id, name)
            .then(() => {
                refresh();
                onOpenChange(false);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Edit Key</DialogTitle>
                            <DialogDescription>
                                For security reasons, you cannot view or modify the contents of a
                                key once it has been added.
                            </DialogDescription>
                        </DialogHeader>
                        <div className={'grid gap-3'}>
                            <Label>Name</Label>
                            <Input
                                defaultValue={item.name}
                                name={'name'}
                                placeholder="Key Name"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant={'destructive'}
                                type={'button'}
                                onClick={() => {
                                    onOpenChange(false);
                                    setDelOpen(true);
                                }}
                            >
                                Delete
                            </Button>
                            <div className={'flex-1'} />
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <LoadingButton type="submit" isLoading={isLoading}>
                                <Loader
                                    className="animate-spin"
                                    style={{ display: isLoading ? 'inline-block' : 'none' }}
                                />
                                Save changes
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/*Delete*/}
            <DelKey open={delOpen} onOpenChange={setDelOpen} item={item} refresh={refresh} />
        </>
    );
};

export default EditKey;
