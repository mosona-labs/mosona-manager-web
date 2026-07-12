import type { UserType } from '@/api/user.ts';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = () => {
        setIsLoading(true);
        ApiAdminUser.del(user.id)
            .then(() => {
                toast.success(t('pages.adminUsers.deleteSuccess'), {
                    description: t('pages.adminUsers.deleteSuccessDesc'),
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
                        <DialogTitle>
                            {t('pages.adminUsers.deleteTitle', { name: user.username })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('pages.adminUsers.deleteDesc')}
                            <p className={'mt-1 text-destructive'}>
                                {t('pages.adminUsers.deleteWarning')}
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className={'mt-4'}>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <LoadingButton
                            variant={'destructive'}
                            onClick={onDelete}
                            isLoading={isLoading}
                        >
                            {t('common.delete')}
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Del;
