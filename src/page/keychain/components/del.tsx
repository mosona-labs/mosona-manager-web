import { useState } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                    <DialogTitle>{t('pages.keychain.deleteTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('pages.keychain.deleteDescription', { name: item.name })}
                    </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>{t('pages.keychain.attention')}</AlertTitle>
                    <AlertDescription>
                        <p>{t('pages.keychain.deleteWarning')}</p>
                    </AlertDescription>
                </Alert>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={isLoading}>
                            {t('common.cancel')}
                        </Button>
                    </DialogClose>
                    <LoadingButton
                        variant="destructive"
                        onClick={handleDelete}
                        isLoading={isLoading}
                    >
                        {t('common.delete')}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DelKey;
