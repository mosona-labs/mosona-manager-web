import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import ApiAuth from '@/api/auth.ts';
import { ToastError } from '@/utils/toast.ts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import { cn } from '@/lib/utils.ts';

const TwoFA = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [status, setStatus] = useState<{
        login_2fa: boolean;
        totp: boolean;
        verified: boolean;
    }>();
    const [cooling, setCooling] = useState(0);

    const timerRef = useRef<number>(null);
    const createTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCooling((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    };
    useEffect(() => {
        if (cooling === 0 && timerRef.current) clearInterval(timerRef.current);
    }, [cooling]);

    useEffect(() => {
        ApiAuth.twoFAStatus()
            .then((res) => {
                setStatus(res.data);
                setCooling(res.data.cooling);
                setIsLoading(false);

                if (res.data.cooling > 0) createTimer();
                else if (!res.data.verified || !res.data.totp) sendMFA(res.data.verified);
            })
            .catch((err) => {
                ToastError(err);
                setError(err.response.data.msg || t('pages.twofa.statusError'));
            });
    }, []);

    const [sending, setSending] = useState(false);
    const sendMFA = (verified: boolean) => {
        setSending(true);
        ApiAuth.twoFASendMFA(verified ? '2fa' : 'activation')
            .then(() => {
                setCooling(60);
                createTimer();
            })
            .catch((err) => {
                ToastError(err);
            })
            .finally(() => setSending(false));
    };

    const [submitting, setSubmitting] = useState(false);
    const [code, setCode] = useState('');
    useEffect(() => {
        if (code.length < 6 || !status) return;

        setSubmitting(true);
        setCode('');
        if (!status.verified || !status.totp) {
            ApiAuth.twoFAVerifyMFA(code)
                .then(() => {
                    toast.success(
                        !status.verified ? t('pages.twofa.activated') : t('pages.twofa.verified'),
                        {
                            description: !status.verified
                                ? t('pages.twofa.activatedDesc')
                                : t('pages.twofa.verifiedDesc'),
                        }
                    );
                    window.location.href = '/';
                })
                .catch((err) => {
                    ToastError(err);
                })
                .finally(() => setSubmitting(false));
        } else {
            ApiAuth.twoFAVerifyTOTP(code)
                .then(() => {
                    toast.success(t('pages.twofa.verified'), {
                        description: t('pages.twofa.verifiedDesc'),
                    });
                    window.location.href = '/';
                })
                .catch((err) => {
                    ToastError(err);
                })
                .finally(() => setSubmitting(false));
        }
    }, [code]);

    return (
        <div className={'flex flex-col gap-2 h-screen justify-center items-center relative'}>
            <div
                className={cn(
                    'absolute w-full h-full bg-white/50 dark:bg-black/50 rounded-lg flex flex-row justify-center items-center z-10 transition-all',
                    submitting ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
            >
                <LoaderCircle className={'w-8 h-8 animate-spin'} />
            </div>
            {isLoading ? (
                <>
                    <LoaderCircle className={'w-12 h-12 animate-spin'} />
                    <h1 className={'text-3xl'}>{t('pages.twofa.title')}</h1>
                    <p className={'max-w-[80%] text-center'}>
                        {error || t('pages.twofa.checking')}
                    </p>
                </>
            ) : (
                <Card className={'max-w-full'}>
                    <CardHeader>
                        <CardTitle>
                            {!status?.verified
                                ? t('pages.twofa.activateTitle')
                                : t('pages.twofa.title')}
                        </CardTitle>
                        <CardDescription>
                            {status?.verified && status?.totp
                                ? t('pages.twofa.enterTotp')
                                : t('pages.twofa.enterEmail')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={'mx-2'}>
                            <InputOTP maxLength={6} value={code} onChange={setCode}>
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
                        {(!status?.verified || !status?.totp) && (
                            <div className={'flex flex-row items-center mt-3 -mx-2'}>
                                <LoadingButton
                                    isLoading={sending}
                                    variant={'link'}
                                    size={'sm'}
                                    className={'text-xs'}
                                    disabled={cooling > 0}
                                    onClick={() => sendMFA(!!status?.verified)}
                                >
                                    {cooling > 0
                                        ? t('pages.twofa.waiting', { seconds: cooling })
                                        : t('pages.twofa.sendAgain')}
                                </LoadingButton>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TwoFA;
