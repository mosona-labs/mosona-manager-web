import { useEffect, useState } from 'react';
import QRCodeModule from 'react-qr-code';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import DownloadsTOTP from '@/components/totp/downloads.tsx';
import ApiUser from '@/api/user.ts';
import { ToastError } from '@/utils/toast.ts';
import { Input } from '@/components/ui/input.tsx';
import LoadingButton from '@/components/loading-button.tsx';

const QRCode =
    (QRCodeModule as unknown as { default?: typeof QRCodeModule }).default ?? QRCodeModule;

const EnableTOTP = ({
    open,
    setOpen,
    callback,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    callback: () => void;
}) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [url, setUrl] = useState('');
    const [secret, setSecret] = useState('');

    useEffect(() => {
        if (!open) callback();
        else {
            setIsLoading(true);
            ApiUser.enableTOTP()
                .then((res) => {
                    setUrl(res.data.url);
                    setSecret(res.data.secret);
                })
                .catch(ToastError)
                .finally(() => setIsLoading(false));
        }
    }, [open]);

    const [code, setCode] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const onSubmit = () => {
        setSubmitting(true);
        ApiUser.confirmTOTP(secret, code)
            .then(() => {
                toast.success(t('common.success'), {
                    description: t('pages.totp.enabled'),
                });
                callback();
                setOpen(false);
            })
            .catch(ToastError)
            .finally(() => {
                setSubmitting(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>{t('pages.totp.enableTitle')}</DialogTitle>
                </DialogHeader>
                <div className={'text-foreground/70 space-y-3'}>
                    <h2>{t('pages.totp.step1')}</h2>
                    <div className={'flex flex-row'}>
                        <DownloadsTOTP
                            googlePlayLink={
                                'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
                            }
                            appleStoreLink={
                                'https://apps.apple.com/us/app/google-authenticator/id388497605'
                            }
                            src={'/icons/google-authenticator.svg'}
                            alt={'Google Authenticator'}
                        />
                        <DownloadsTOTP
                            googlePlayLink={
                                'https://play.google.com/store/apps/details?id=com.authy.authy'
                            }
                            appleStoreLink={
                                'https://apps.apple.com/us/app/twilio-authy/id494168017'
                            }
                            src={'/icons/authy.svg'}
                            alt={'Authy'}
                        />
                    </div>
                    <h2>{t('pages.totp.step2')}</h2>
                    <div className={'w-42 h-42 mx-auto p-2 bg-white rounded-md flex items-center'}>
                        {isLoading ? (
                            <LoaderCircle
                                className={'w-16 h-16 mx-auto text-muted-foreground animate-spin'}
                            />
                        ) : (
                            <QRCode
                                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                value={url}
                            />
                        )}
                    </div>
                    <p className={'text-xs text-center text-muted-foreground'}>
                        {isLoading ? t('common.loading') : secret}
                    </p>
                    <h2>{t('pages.totp.step3')}</h2>
                    <Input
                        type="text"
                        placeholder={t('pages.totp.codePlaceholder')}
                        maxLength={6}
                        className="w-full"
                        onChange={(e) => {
                            setCode(e.target.value);
                        }}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <LoadingButton isLoading={submitting} onClick={onSubmit}>
                        {t('common.submit')}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EnableTOTP;
