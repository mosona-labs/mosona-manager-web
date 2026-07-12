import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import { Input } from '@/components/ui/input.tsx';
import EnableCard from '@/components/enable-card.tsx';
import { useSettings } from '@/admin/page/settings/useSettings.tsx';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';

const Register = () => {
    const { t } = useTranslation();
    const { settings, refresh } = useSettings();

    const success = () =>
        toast.success(t('common.success'), {
            description: t('pages.adminRegister.updated'),
        });

    // Registration Enabled
    const [registrationEnabled, setRegistrationEnabled] = useState(false);
    const [registrationEnabledLoading, setRegistrationEnabledLoading] = useState(false);
    const changeRegistrationEnabled = (enabled: boolean) => {
        setRegistrationEnabledLoading(true);
        ApiAdminSettings.set([
            {
                key: 'registration_enabled',
                value: String(enabled),
            },
        ])
            .then(() => {
                setRegistrationEnabled(enabled);
                refresh().then(() => {
                    success();
                    setRegistrationEnabledLoading(false);
                });
            })
            .catch((err) => {
                ToastError(err);
                setRegistrationEnabledLoading(false);
            });
    };

    // Registration Verify Email
    const [registrationVerifyEmail, setRegistrationVerifyEmail] = useState(false);
    const [registrationVerifyEmailLoading, setRegistrationVerifyEmailLoading] = useState(false);
    const changeRegistrationVerifyEmail = (enabled: boolean) => {
        setRegistrationVerifyEmailLoading(true);
        ApiAdminSettings.set([
            {
                key: 'registration_verify_email',
                value: String(enabled),
            },
        ])
            .then(() => {
                setRegistrationVerifyEmail(enabled);
                refresh().then(() => {
                    success();
                    setRegistrationVerifyEmailLoading(false);
                });
            })
            .catch((err) => {
                ToastError(err);
                setRegistrationVerifyEmailLoading(false);
            });
    };

    // Login Verify Email
    const [loginVerifyEmail, setLoginVerifyEmail] = useState(false);
    const [loginVerifyEmailLoading, setLoginVerifyEmailLoading] = useState(false);
    const changeLoginVerifyEmail = (enabled: boolean) => {
        setLoginVerifyEmailLoading(true);
        ApiAdminSettings.set([
            {
                key: 'email_verify_login',
                value: String(enabled),
            },
        ])
            .then(() => {
                setLoginVerifyEmail(enabled);
                refresh().then(() => {
                    success();
                    setLoginVerifyEmailLoading(false);
                });
            })
            .catch((err) => {
                ToastError(err);
                setLoginVerifyEmailLoading(false);
            });
    };

    // const [captchaProvider, setCaptchaProvider] = useState('turnstile');
    const [captchaSiteKey, setCaptchaSiteKey] = useState('');
    const [captchaSecretKey, setCaptchaSecretKey] = useState('');
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const changeCaptchaSettings = () => {
        setCaptchaLoading(true);
        ApiAdminSettings.set([
            {
                key: 'captcha_site_key',
                value: captchaSiteKey,
            },
            {
                key: 'captcha_secret',
                value: captchaSecretKey,
            },
        ])
            .then(() => {
                refresh().then(() => {
                    success();
                    setCaptchaLoading(false);
                });
            })
            .catch((err) => {
                ToastError(err);
                setCaptchaLoading(false);
            });
    };

    // Init
    useEffect(() => {
        if (settings) {
            setRegistrationEnabled(settings.registration_enabled);
            setRegistrationVerifyEmail(settings.registration_verify_email);
            setLoginVerifyEmail(settings.email_verify_login);
            setCaptchaSiteKey(settings.captcha_site_key);
            setCaptchaSecretKey(settings.captcha_secret_key);
        }
    }, [settings]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">{t('pages.adminRegister.title')}</h1>
                    <p className="opacity-65">{t('pages.adminRegister.description')}</p>
                </div>
            </div>
            <div className={'flex flex-col gap-3'}>
                <EnableCard
                    value={registrationEnabled}
                    onChange={changeRegistrationEnabled}
                    title={t('pages.adminRegister.enableRegistration')}
                    description={t('pages.adminRegister.enableRegistrationDesc')}
                    disabled={registrationEnabledLoading}
                />
                <div className={'border-t my-2'} />
                <div>
                    <Label>{t('pages.adminRegister.email')}</Label>
                    <p className={'text-muted-foreground text-xs mt-1'}>
                        {t('pages.adminRegister.emailHint')}
                    </p>
                </div>
                <EnableCard
                    value={registrationVerifyEmail}
                    onChange={changeRegistrationVerifyEmail}
                    title={t('pages.adminRegister.regVerify')}
                    description={t('pages.adminRegister.regVerifyDesc')}
                    disabled={registrationVerifyEmailLoading}
                />
                <EnableCard
                    value={loginVerifyEmail}
                    onChange={changeLoginVerifyEmail}
                    title={t('pages.adminRegister.loginVerify')}
                    description={t('pages.adminRegister.loginVerifyDesc')}
                    disabled={loginVerifyEmailLoading}
                />
                <div className={'border-t my-2'} />
                <div>
                    <Label>{t('pages.adminRegister.captcha')}</Label>
                    <p className={'text-muted-foreground text-xs mt-1'}>
                        {t('pages.adminRegister.captchaHint')}
                    </p>
                </div>
                <div className={'space-y-1.5'}>
                    <Label className={'text-xs'}>{t('pages.adminRegister.provider')}</Label>
                    <Select value={'turnstile'}>
                        <SelectTrigger className="max-w-[26rem] w-full" disabled>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className={'space-y-1.5'}>
                    <Label className={'text-xs'}>{t('pages.adminRegister.siteKey')}</Label>
                    <Input
                        value={captchaSiteKey}
                        onChange={(e) => {
                            setCaptchaSiteKey(e.target.value);
                        }}
                        placeholder="0xAAAAAAAAAAAAA"
                        className={'max-w-[26rem] w-full'}
                    />
                </div>
                <div className={'space-y-1.5'}>
                    <Label className={'text-xs'}>{t('pages.adminRegister.secret')}</Label>
                    <Input
                        value={captchaSecretKey}
                        onChange={(e) => {
                            setCaptchaSecretKey(e.target.value);
                        }}
                        placeholder="0xBBBBBBBBBBBBBBBBBBB"
                        className={'max-w-[26rem] w-full'}
                    />
                </div>
                <div className={'mt-1'}>
                    <LoadingButton
                        onClick={changeCaptchaSettings}
                        isLoading={captchaLoading}
                        variant={'outline'}
                    >
                        {t('pages.adminRegister.save')}
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
};

export default Register;
