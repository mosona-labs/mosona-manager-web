import { useEffect, useState } from 'react';

import { useSettings } from '@/admin/page/settings/useSettings.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import EnableCard from '@/components/enable-card.tsx';
import TestEmail from '@/admin/page/settings/email/components/test.tsx';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';

const Email = () => {
    const { settings, refresh } = useSettings();

    const [emailProvider, setEmailProvider] = useState('smtp');
    // SMTP
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUsername, setSmtpUsername] = useState('');
    const [smtpPassword, setSmtpPassword] = useState('');
    const [smtpEncryption, setSmtpEncryption] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSaveChanges = () => {
        setIsSubmitting(true);
        const updates = [
            { key: 'email_provider', value: emailProvider },
            // SMTP
            { key: 'smtp_host', value: smtpHost },
            { key: 'smtp_port', value: smtpPort === '' ? '0' : smtpPort },
            { key: 'smtp_username', value: smtpUsername },
            { key: 'smtp_password', value: smtpPassword },
            { key: 'smtp_tls', value: String(smtpEncryption) },
        ];
        ApiAdminSettings.set(updates)
            .then(() => {
                refresh().finally(() => {
                    setIsSubmitting(false);
                });
            })
            .catch((err) => {
                ToastError(err);
                setIsSubmitting(false);
            });
    };

    // Init
    useEffect(() => {
        if (settings) {
            setEmailProvider(settings.email_provider || 'smtp');
            // SMTP
            setSmtpHost(settings.smtp_host);
            setSmtpPort(settings.smtp_port === 0 ? '' : String(settings.smtp_port));
            setSmtpUsername(settings.smtp_username);
            setSmtpPassword(settings.smtp_password);
            setSmtpEncryption(settings.smtp_tls);
        }
    }, [settings]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Email</h1>
                    <p className="opacity-65">Manage email settings for your application.</p>
                </div>
            </div>
            <div className={'flex flex-col gap-3'}>
                <TestEmail />
                <div className={'space-y-1.5'}>
                    <Label className={'text-xs'}>Email Provider</Label>
                    <Select
                        value={emailProvider}
                        onValueChange={(e) => {
                            setEmailProvider(e);
                        }}
                    >
                        <SelectTrigger className="max-w-[26rem] w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="smtp">SMTP</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                {/*SMTP*/}
                {emailProvider === 'smtp' && (
                    <>
                        <div className={'space-y-1.5'}>
                            <Label className={'text-xs'}>SMTP Host</Label>
                            <Input
                                value={smtpHost}
                                onChange={(e) => {
                                    setSmtpHost(e.target.value);
                                }}
                                placeholder={'smtp.example.com'}
                                className={'max-w-[26rem] w-full'}
                            />
                        </div>
                        <div className={'space-y-1.5'}>
                            <Label className={'text-xs'}>SMTP Port</Label>
                            <Input
                                type={'number'}
                                step={1}
                                value={smtpPort}
                                onChange={(e) => {
                                    setSmtpPort(e.target.value);
                                }}
                                placeholder={'587'}
                                className={'max-w-[26rem] w-full'}
                            />
                        </div>
                        <div className={'space-y-1.5'}>
                            <Label className={'text-xs'}>SMTP Username</Label>
                            <Input
                                value={smtpUsername}
                                onChange={(e) => {
                                    setSmtpUsername(e.target.value);
                                }}
                                placeholder={'admin@example.com'}
                                className={'max-w-[26rem] w-full'}
                            />
                        </div>
                        <div className={'space-y-1.5'}>
                            <Label className={'text-xs'}>SMTP Password</Label>
                            <Input
                                value={smtpPassword}
                                onChange={(e) => {
                                    setSmtpPassword(e.target.value);
                                }}
                                placeholder={'*******'}
                                className={'max-w-[26rem] w-full'}
                            />
                        </div>
                        <div className={'space-y-1.5'}>
                            <Label className={'text-xs'}>SMTP Encryption</Label>
                            <EnableCard
                                value={smtpEncryption}
                                onChange={(v) => {
                                    setSmtpEncryption(v);
                                }}
                                className={'max-w-[26rem]'}
                                title={'Use TLS'}
                                description={'Enable TLS for secure email transmission.'}
                            />
                        </div>
                    </>
                )}
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

export default Email;
