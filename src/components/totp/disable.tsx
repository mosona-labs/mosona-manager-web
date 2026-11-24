import { useEffect, useRef, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import ApiUser from '@/api/user.ts';
import LoadingButton from '@/components/loading-button.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { ToastError } from '@/utils/toast.ts';

const DisableTOTP = ({
    open,
    setOpen,
    callback,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    callback: () => void;
}) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const pending = useRef(false);
    const [retryUntil, setRetryUntil] = useState(0);
    const [retryIn, setRetryIn] = useState(0);

    useEffect(() => {
        if (!retryUntil) return;
        const timer = window.setInterval(() => {
            const remaining = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
            setRetryIn(remaining);
            if (remaining === 0) window.clearInterval(timer);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [retryUntil]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending.current || retryIn > 0 || !password || code.length !== 6) return;
        pending.current = true;
        setSubmitting(true);
        try {
            await ApiUser.disableTOTP(password, code);
            setPassword('');
            setCode('');
            toast.success(t('common.success'), {
                description: t('pages.profile.totpDisabled'),
            });
            setOpen(false);
            callback();
        } catch (error) {
            setCode('');
            if (isAxiosError(error) && error.response?.status === 429) {
                const seconds = Number(error.response.headers['retry-after']);
                const delay = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 600;
                setRetryIn(delay);
                setRetryUntil(Date.now() + delay * 1000);
            } else {
                ToastError(error);
            }
        } finally {
            pending.current = false;
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !pending.current && setOpen(value)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('pages.profile.totpDisableTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('pages.profile.totpDisableDescription')}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="totp-disable-password">
                            {t('pages.profile.currentPassword')}
                        </Label>
                        <Input
                            id="totp-disable-password"
                            name="current_password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={submitting || retryIn > 0}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="totp-disable-code">{t('pages.profile.totpCode')}</Label>
                        <Input
                            id="totp-disable-code"
                            name="v_code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={code}
                            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                            disabled={submitting || retryIn > 0}
                            required
                        />
                    </div>
                    {retryIn > 0 && (
                        <p role="status" className="text-sm text-destructive">
                            {t('pages.profile.totpDisableRetry', { seconds: retryIn })}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={submitting}
                            onClick={() => setOpen(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="destructive"
                            isLoading={submitting}
                            disabled={!password || code.length !== 6 || retryIn > 0}
                        >
                            {t('pages.profile.totpDisableConfirm')}
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DisableTOTP;
