import { CheckCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card.tsx';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';

const TestEmail = () => {
    const { t } = useTranslation();
    const [isSending, setIsSending] = useState(false);

    const onSendTestEmail = () => {
        setIsSending(true);
        ApiAdminSettings.testEmail()
            .then(() => {
                toast.success(t('pages.adminEmail.testSent'), {
                    description: t('pages.adminEmail.testSentDesc'),
                });
            })
            .catch(ToastError)
            .finally(() => {
                setIsSending(false);
            });
    };

    return (
        <Card className={'rounded-lg py-3 mb-1'}>
            <CardContent className={'px-4 flex flex-row gap-2 items-center'}>
                <div className={'space-y-0.5 flex-1'}>
                    <h2 className={'flex flex-row items-center gap-3 text-sm'}>
                        <CheckCheckIcon className={'w-4 hidden md:block'} />
                        {t('pages.adminEmail.testHint')}
                    </h2>
                    <p className={'md:ms-7 text-xs text-muted-foreground'}>
                        {t('pages.adminEmail.testHint2')}
                    </p>
                </div>
                <LoadingButton isLoading={isSending} onClick={onSendTestEmail} variant={'outline'}>
                    {t('pages.adminEmail.sendTest')}
                </LoadingButton>
            </CardContent>
        </Card>
    );
};

export default TestEmail;
