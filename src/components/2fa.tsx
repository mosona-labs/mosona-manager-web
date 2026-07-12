import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useUser } from '@/context/useUser.tsx';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp.tsx';
import ApiAuth from '@/api/auth.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';
import { Button } from '@/components/ui/button.tsx';

const TwoFA = ({
    open,
    setOpen,
    callback,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    callback: (code: string) => void;
}) => {
    const { t } = useTranslation();
    const { user } = useUser();

    const [cooling, setCooling] = useState(0);

    const timerRef = useRef<number>(null);
    const createTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCooling((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    };
    useEffect(() => {
        if (cooling === 0 && timerRef.current) clearInterval(timerRef.current);
    }, [cooling]);

    const [sending, setSending] = useState(false);
    const sendMFA = () => {
        setSending(true);
        ApiAuth.twoFASendMFA('2fa')
            .then(() => {
                setCooling(60);
                createTimer();
            })
            .catch((err) => {
                ToastError(err);
            })
            .finally(() => setSending(false));
    };

    const [code, setCode] = useState('');
    useEffect(() => {
        if (code.length < 6) return;

        callback(code);
        setOpen(false);
    }, [code.length]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className={'w-[400px]'}>
                <DialogHeader>
                    <DialogTitle>{t('pages.twofa.dialogTitle')}</DialogTitle>
                    <DialogDescription>
                        {user?.totp_enabled
                            ? t('pages.twofa.dialogDescTotp')
                            : t('pages.twofa.dialogDescEmail')}
                    </DialogDescription>
                </DialogHeader>
                <div className={'mx-auto'}>
                    <InputOTP maxLength={6} onChange={setCode}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                {!user?.totp_enabled && (
                    <div className={'flex flex-row items-center mt-3 -mx-2'}>
                        <LoadingButton
                            isLoading={sending}
                            variant={'link'}
                            size={'sm'}
                            className={'text-xs'}
                            disabled={cooling > 0}
                            onClick={sendMFA}
                        >
                            {cooling > 0
                                ? t('pages.twofa.waiting', { seconds: cooling })
                                : t('pages.twofa.sendAgain')}
                        </LoadingButton>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose>
                        <Button variant={'outline'}>{t('common.cancel')}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TwoFA;
