import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        ApiAdminOAuth.del(item.id)
            .then(() => {
                toast.success(t('pages.adminOauth.deleteSuccess'), {
                    description: t('pages.adminOauth.deleteSuccessDesc'),
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
                    <DialogTitle>{t('pages.adminOauth.deleteTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('pages.adminOauth.deleteDesc', { name: item.name })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <LoadingButton
                        isLoading={isDeleting}
                        onClick={handleDelete}
                        variant="destructive"
                    >
                        {t('common.delete')}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Delete;
