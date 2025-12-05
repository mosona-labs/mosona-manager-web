import { useEffect, useState } from 'react';

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
import EnableCard from '@/admin/page/settings/register/components/enable-card.tsx';
import { useSettings } from '@/admin/page/settings/useSettings.tsx';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';

const Register = () => {
    const { settings, refresh } = useSettings();

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
                    setRegistrationVerifyEmailLoading(false);
                });
            })
            .catch((err) => {
                ToastError(err);
                setRegistrationVerifyEmailLoading(false);
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
            setCaptchaSiteKey(settings.captcha_site_key);
            setCaptchaSecretKey(settings.captcha_secret_key);
        }
    }, [settings]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Register</h1>
                    <p className="opacity-65">Manage registration settings for new users.</p>
                </div>
            </div>
            <div className={'flex flex-col gap-3'}>
                <EnableCard
                    value={registrationEnabled}
                    onChange={changeRegistrationEnabled}
                    title={'Enable User Registration'}
                    description={'Allow new users to register an account on the platform.'}
                    disabled={registrationEnabledLoading}
                />
                <div className={'border-t my-2'} />
                <div>
                    <Label>Email</Label>
                    <p className={'text-muted-foreground text-xs mt-1'}>
                        If email configuration is not set up, email verification cannot be enabled.
                    </p>
                </div>
                <EnableCard
                    value={registrationVerifyEmail}
                    onChange={changeRegistrationVerifyEmail}
                    title={'Require Email Verification'}
                    description={
                        'Require users to verify their email addresses during registration.'
                    }
                    disabled={registrationVerifyEmailLoading}
                />
                <div className={'border-t my-2'} />
                <div>
                    <Label>Captcha</Label>
                    <p className={'text-muted-foreground text-xs mt-1'}>
                        Now only Cloudflare Turnstile is supported, more captcha providers will be
                        added in the future.
                    </p>
                </div>
                <div className={'space-y-1.5'}>
                    <Label className={'text-xs'}>Provider</Label>
                    <Select value={'turnstile'}>
                        <SelectTrigger className="max-w-[22rem] w-full" disabled>
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
                    <Label className={'text-xs'}>Site Key</Label>
                    <Input
                        value={captchaSiteKey}
                        onChange={(e) => {
                            setCaptchaSiteKey(e.target.value);
                        }}
                        placeholder="0xAAAAAAAAAAAAA"
                        className={'max-w-[22rem] w-full'}
                    />
                </div>
                <div className={'space-y-1.5'}>
                    <Label className={'text-xs'}>Secret</Label>
                    <Input
                        value={captchaSecretKey}
                        onChange={(e) => {
                            setCaptchaSecretKey(e.target.value);
                        }}
                        placeholder="0xBBBBBBBBBBBBBBBBBBB"
                        className={'max-w-[22rem] w-full'}
                    />
                </div>
                <div className={'mt-1'}>
                    <LoadingButton
                        onClick={changeCaptchaSettings}
                        isLoading={captchaLoading}
                        variant={'outline'}
                    >
                        Save Changes
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
};

export default Register;
