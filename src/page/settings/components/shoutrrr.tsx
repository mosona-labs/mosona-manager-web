import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import ApiNotification from '@/api/notification.tsx';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';

const ShoutrrrUrlItem = ({
    url,
    onChange,
    onDelete,
}: {
    url: string;
    onChange: (newUrl: string) => void;
    onDelete: () => void;
}) => {
    const { t } = useTranslation();
    const [testing, setTesting] = useState(false);
    const onTest = () => {
        setTesting(true);
        ApiNotification.test(url)
            .then(() => {
                toast.success(t('pages.notification.testSent'), {
                    description: t('pages.notification.testSentDesc'),
                });
            })
            .catch(ToastError)
            .finally(() => {
                setTesting(false);
            });
    };

    return (
        <div className="flex items-center gap-2">
            <Input
                className="flex-1"
                value={url}
                onChange={(e) => onChange(e.target.value)}
                placeholder="generic+https://webhook.site/xxxxxx"
            />
            <LoadingButton isLoading={testing} variant="outline" onClick={onTest}>
                {t('pages.notification.test')}
            </LoadingButton>
            <Button variant="destructive" onClick={onDelete}>
                {t('common.delete')}
            </Button>
        </div>
    );
};

export default ShoutrrrUrlItem;
