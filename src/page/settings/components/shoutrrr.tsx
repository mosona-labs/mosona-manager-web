import { toast } from 'sonner';
import { useState } from 'react';

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
    const [testing, setTesting] = useState(false);
    const onTest = () => {
        setTesting(true);
        ApiNotification.test(url)
            .then(() => {
                toast.success('Test notification sent successfully.', {
                    description: 'Please check your notification receiver.',
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
                Test
            </LoadingButton>
            <Button variant="destructive" onClick={onDelete}>
                Delete
            </Button>
        </div>
    );
};

export default ShoutrrrUrlItem;
