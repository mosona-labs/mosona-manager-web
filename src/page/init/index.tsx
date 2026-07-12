import {
    CirclePlay,
    InfoIcon,
    LayoutDashboard,
    LoaderCircle,
    Settings,
    SquareChevronRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PasswordCheck from '../auth/components/PasswordCheck';

import { Input } from '@/components/ui/input';
import Logo from '@/components/logo';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import IsRequired from '@/components/required.tsx';
import StepCard from '@/page/init/components/step-card.tsx';
import EnableCard from '@/components/enable-card.tsx';
import ApiInit from '@/api/init.ts';
import { ToastError } from '@/utils/toast.ts';
import { useSiteBranding } from '@/hooks/useSiteBranding.ts';

const Init = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { title } = useSiteBranding();

    const [installed, setInstalled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1);

    useEffect(() => {
        ApiInit.status()
            .then((res) => {
                if (res.data) navigate('/');
            })
            .catch(ToastError);
    }, []);

    // Form State
    const [username, setUsername] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [websiteURL, setWebsiteURL] = useState(
        typeof window !== 'undefined' ? window.location.origin : ''
    );
    const [registrationEnabled, setRegistrationEnabled] = useState<boolean>(false);

    const onSubmit = () => {
        if (!username || !email || !password || !confirmPassword) {
            setStep(1);
            toast.warning(t('common.warning'), { description: t('auth.required') });
            return;
        }
        if (!websiteURL) {
            setStep(2);
            toast.warning(t('common.warning'), {
                description: t('pages.init.provideWebsiteUrl'),
            });
            return;
        }
        if (password !== confirmPassword) {
            setStep(1);
            toast.warning(t('common.warning'), { description: t('auth.mismatch') });
            return;
        }
        if (email.indexOf('@') === -1) {
            setStep(1);
            toast.warning(t('common.warning'), { description: t('pages.init.validEmail') });
            return;
        }
        const failed = [
            { ok: password.length >= 8, text: t('auth.minLength') },
            { ok: /[A-Z]/.test(password), text: t('auth.uppercase') },
            { ok: /[a-z]/.test(password), text: t('auth.lowercase') },
            { ok: /[0-9]/.test(password), text: t('auth.number') },
            { ok: /[^A-Za-z0-9]/.test(password), text: t('auth.special') },
        ].filter((it) => !it.ok);
        if (failed.length > 0) {
            setStep(1);
            toast.warning(t('auth.weakPassword'), {
                description: failed.map((f) => f.text).join(', '),
            });
            return;
        }
        if (!websiteURL.startsWith('http://') && !websiteURL.startsWith('https://')) {
            setStep(2);
            toast.warning(t('common.warning'), {
                description: t('pages.init.urlProtocol'),
            });
            return;
        }
        if (websiteURL.endsWith('/')) {
            setStep(2);
            toast.warning(t('common.warning'), {
                description: t('pages.init.urlTrailingSlash'),
            });
            return;
        }

        setLoading(true);
        ApiInit.setup(username, password, email, websiteURL, registrationEnabled)
            .then(() => {
                setInstalled(true);
            })
            .catch(ToastError)
            .finally(() => {
                setLoading(false);
            });
    };

    return installed ? (
        <div className="flex flex-col h-screen gap-3 justify-center items-center w-full px-4 overflow-hidden">
            <div className="w-full mb-4 flex flex-col gap-2 items-center">
                <p className={'text-5xl'}>🎉</p>
                <h1 className="text-3xl font-bold mt-2">{t('pages.init.successTitle')}</h1>
                <p className="text-muted-foreground">{t('pages.init.successDesc')}</p>
                <div className={'flex flex-row mt-3 gap-2'}>
                    <a href={'/'}>
                        <Button>
                            <LayoutDashboard />
                            {t('pages.init.goDashboard')}
                        </Button>
                    </a>
                    <a href={'/admin/'}>
                        <Button variant={'outline'}>
                            <Settings />
                            {t('pages.init.goAdmin')}
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    ) : (
        <div className={'no-scrollbar h-screen w-full overflow-y-auto'}>
            <div className="flex w-full flex-col items-center gap-3 px-4 py-8 md:justify-center">
                <div className="w-full mb-4 flex flex-col gap-2 items-center">
                    <Logo />
                    <h1 className="text-3xl font-bold mt-2">{title}</h1>
                    <p className="text-muted-foreground">{t('pages.init.subtitle')}</p>
                </div>

                <StepCard
                    show={step == 1}
                    setStep={() => {
                        setStep(1);
                    }}
                    title={t('pages.init.step1Title')}
                    description={t('pages.init.step1Desc')}
                >
                    <div className="mt-4 flex flex-col gap-3">
                        <Alert variant="default">
                            <InfoIcon />
                            <AlertTitle>{t('pages.init.attention')}</AlertTitle>
                            <AlertDescription>{t('pages.init.adminWarning')}</AlertDescription>
                        </Alert>
                        <div className="grid gap-3 mt-1">
                            <Label>
                                {t('auth.username')}
                                <IsRequired />
                            </Label>
                            <Input
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3 mt-1">
                            <Label>
                                {t('auth.email')}
                                <IsRequired />
                            </Label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>
                                {t('auth.password')}
                                <IsRequired />
                            </Label>
                            <Input
                                type="password"
                                placeholder={t('auth.passwordPlaceholder')}
                                className="mt-3"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />
                            <PasswordCheck password={password} />
                        </div>
                        <div className="grid gap-3">
                            <Label>
                                {t('auth.confirmPassword')}
                                <IsRequired />
                            </Label>
                            <Input
                                type="password"
                                placeholder={t('auth.confirmPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button
                            type={'button'}
                            className={'mt-2'}
                            onClick={() => {
                                setStep(2);
                            }}
                        >
                            <SquareChevronRight className="rtl:rotate-180" />
                            {t('pages.init.nextStep')}
                        </Button>
                    </div>
                </StepCard>

                <StepCard
                    show={step == 2}
                    setStep={() => {
                        setStep(2);
                    }}
                    title={t('pages.init.step2Title')}
                    description={t('pages.init.step2Desc')}
                >
                    <div className="mt-4 flex flex-col gap-3">
                        <div className="grid gap-3">
                            <Label>
                                {t('pages.init.websiteUrl')}
                                <IsRequired />
                            </Label>
                            <Input
                                placeholder="https://example.com"
                                value={websiteURL}
                                onChange={(e) => setWebsiteURL(e.target.value)}
                            />
                            <p className={'text-xs text-muted-foreground -mt-1'}>
                                {t('pages.init.websiteUrlHint')}
                            </p>
                        </div>
                        <div className={'border-t border-border my-1'}></div>
                        <div className="grid gap-3">
                            <Label>
                                {t('pages.init.userRegistration')}
                                <IsRequired />
                            </Label>
                            <p className={'text-xs text-muted-foreground'}>
                                {t('pages.init.registrationHint')}
                                <br />
                            </p>
                            <i className={'text-xs text-muted-foreground -mt-2'}>
                                {t('pages.init.legalRisk')}
                            </i>
                            <EnableCard
                                value={registrationEnabled}
                                onChange={setRegistrationEnabled}
                                title={t('pages.init.enableRegistration')}
                            />
                        </div>
                        <Button
                            type={'button'}
                            className={'mt-1'}
                            onClick={onSubmit}
                            disabled={loading}
                        >
                            {loading ? <LoaderCircle className="animate-spin" /> : <CirclePlay />}
                            {t('pages.init.finish')}
                        </Button>
                    </div>
                </StepCard>
            </div>
        </div>
    );
};

export default Init;
