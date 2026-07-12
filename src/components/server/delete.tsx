import { useState } from 'react';
import { toast } from 'sonner';
import { Trans, useTranslation } from 'react-i18next';

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
import { notifyServerMutation } from '@/utils/server-events';

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
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>('');

    const onDelete = () => {
        if (name !== serverName) {
            toast.warning(t('pages.serverForm.deleteNameMismatch'), {
                description: t('pages.serverForm.deleteNameMismatchDesc'),
            });
            return;
        }

        setIsLoading(true);
        ApiServer.delete(serverID)
            .then(() => {
                toast.success(t('pages.serverForm.deleted'), {});
                notifyServerMutation();
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
                    <DialogTitle>{t('pages.serverForm.deleteTitle')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <p>{t('pages.serverForm.deleteConfirm', { name: serverName })}</p>
                    <p>{t('pages.serverForm.deleteWarning')}</p>
                    <div className="grid gap-3">
                        <p className={'text-sm font-semibold'}>
                            <Trans
                                i18nKey="pages.serverForm.deleteTypeHint"
                                values={{ name: serverName }}
                                components={{ b: <b className={'text-destructive'} /> }}
                            />
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
                        <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <LoadingButton isLoading={isLoading} variant={'destructive'} onClick={onDelete}>
                        {t('common.delete')}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteServer;
