import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useSettings } from '@/admin/page/settings/useSettings.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';

const General = () => {
    const { settings, refresh } = useSettings();

    const [domain, setDomain] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSaveChanges = () => {
        setIsSubmitting(true);
        const updates = [];
        if (settings?.domain !== domain) {
            updates.push({
                key: 'domain',
                value: domain.endsWith('/') ? domain.slice(0, -1) : domain,
            });
        }
        if (updates.length === 0) {
            setIsSubmitting(false);
            return;
        }
        ApiAdminSettings.set(updates)
            .then(() => {
                refresh().then(() => {
                    toast.success('Success', {
                        description: 'Settings updated successfully.',
                    });
                    setIsSubmitting(false);
                });
            })
            .catch(ToastError)
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Init
    useEffect(() => {
        if (settings) {
            setDomain(settings.domain);
        }
    }, [settings]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">General</h1>
                    <p className="opacity-65">Manage general settings for your application.</p>
                </div>
            </div>
            <div className={'flex flex-col gap-3'}>
                <div className={'space-y-1.5'}>
                    <Label className={'text-xs'}>Base URL</Label>
                    <Input
                        value={domain}
                        onChange={(e) => {
                            setDomain(e.target.value);
                        }}
                        placeholder={'https://example.com'}
                        className={'max-w-[26rem] w-full'}
                    />
                    <p className={'text-xs text-muted-foreground'}>
                        The base URL of your application. This is used for generating links, oauth
                        and emails.
                    </p>
                </div>
                <div>
                    <LoadingButton
                        onClick={onSaveChanges}
                        isLoading={isSubmitting}
                        variant={'outline'}
                    >
                        Save Changes
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
};

export default General;
