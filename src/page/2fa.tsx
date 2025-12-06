import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [status, setStatus] = useState<{
        login_2fa: boolean;
        totp: boolean;
        verified: boolean;
    }>({
        login_2fa: false,
        totp: false,
        verified: false,
    });
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
                else if (!res.data.verified || !res.data.totp) sendMFA();
            })
            .catch((err) => {
                ToastError(err);
                setError(err.response.data.msg || 'An error occurred while checking 2FA status.');
            });
    }, []);

    const [sending, setSending] = useState(false);
    const sendMFA = () => {
        setSending(true);
        ApiAuth.twoFASendMFA(status.verified ? '2fa' : 'activation')
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
        if (code.length < 6) return;

        setSubmitting(true);
        setCode('');
        if (!status.verified || !status.totp) {
            ApiAuth.twoFAVerifyMFA(code)
                .then(() => {
                    toast.success(!status.verified ? 'Account Activated' : '2FA Verified', {
                        description: !status.verified
                            ? 'Your account has been activated successfully.'
                            : 'Two-Factor Authentication verified successfully.',
                    });
                    window.location.href = '/';
                })
                .catch((err) => {
                    ToastError(err);
                })
                .finally(() => setSubmitting(false));
        } else {
            ApiAuth.twoFAVerifyTOTP(code)
                .then(() => {
                    toast.success('2FA Verified', {
                        description: 'Two-Factor Authentication verified successfully.',
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
                    <h1 className={'text-3xl'}>Two-Factor Authentication (2FA)</h1>
                    <p className={'max-w-[80%] text-center'}>
                        {error || 'Checking your 2FA status...'}
                    </p>
                </>
            ) : (
                <Card className={'max-w-full'}>
                    <CardHeader>
                        <CardTitle>
                            {status.verified
                                ? 'Two-Factor Authentication (2FA)'
                                : 'Activate Account'}
                        </CardTitle>
                        <CardDescription>
                            {status.verified && status.totp
                                ? 'Please enter the 6-digit code from your authenticator app to proceed.'
                                : 'Please enter the 6-digit code from your email to proceed.'}
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
                        {(!status.verified || !status.totp) && (
                            <div className={'flex flex-row items-center mt-3 -mx-2'}>
                                <LoadingButton
                                    isLoading={sending}
                                    variant={'link'}
                                    size={'sm'}
                                    className={'text-xs'}
                                    disabled={cooling > 0}
                                    onClick={sendMFA}
                                >
                                    {cooling > 0 ? `Waiting ${cooling}s` : 'Send Again'}
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
