import { CheckCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card.tsx';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';

const TestEmail = () => {
    const [isSending, setIsSending] = useState(false);

    const onSendTestEmail = () => {
        setIsSending(true);
        ApiAdminSettings.testEmail()
            .then(() => {
                toast.success('Test email sent', {
                    description: 'A test email has been sent to your email address.',
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
                        Try to send a test email after saving changes to verify the settings.
                    </h2>
                    <p className={'md:ms-7 text-xs text-muted-foreground'}>
                        Click the "Send Test Email" button below to send a test email to your email
                        address.
                    </p>
                </div>
                <LoadingButton isLoading={isSending} onClick={onSendTestEmail} variant={'outline'}>
                    Send Test Email
                </LoadingButton>
            </CardContent>
        </Card>
    );
};

export default TestEmail;
