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
import { useUser } from '@/context/useUser.tsx';
import IsRequired from '@/components/required.tsx';
import { Badge } from '@/components/ui/badge.tsx';

const EditKey = ({
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
    const [delOpen, setDelOpen] = useState(false);

    const [emptyPassword, setEmptyPassword] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const password = emptyPassword ? '!msn!empty!' : (formData.get('password') as string);

        setIsLoading(true);
        ApiKey.edit(item.id, name, password)
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
                            <Label>
                                Name
                                <IsRequired />
                            </Label>
                            <Input
                                defaultValue={item.name}
                                name={'name'}
                                placeholder="Key Name"
                                required
                            />
                        </div>
                        <div className={'grid gap-3'}>
                            <div className={'flex flex-row items-center gap-2'}>
                                <Label>Password</Label>
                                <Badge
                                    className={'cursor-pointer select-none'}
                                    variant={emptyPassword ? 'default' : 'outline'}
                                    onClick={() => {
                                        setEmptyPassword(!emptyPassword);
                                    }}
                                >
                                    Reset to empty
                                </Badge>
                            </div>
                            <Input
                                type={'password'}
                                name={'password'}
                                placeholder="Empty to keep key's current password"
                                disabled={emptyPassword}
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
            <DelKey open={delOpen} onOpenChange={setDelOpen} item={item} />
        </>
    );
};

export default EditKey;
