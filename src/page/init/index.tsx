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

const Init = () => {
    const navigate = useNavigate();

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
            toast.warning('Warning', { description: 'Please fill in all required fields.' });
            return;
        }
        if (!websiteURL) {
            setStep(2);
            toast.warning('Warning', { description: 'Please provide the website URL.' });
            return;
        }
        if (password !== confirmPassword) {
            setStep(1);
            toast.warning('Warning', { description: 'Passwords do not match.' });
            return;
        }
        if (email.indexOf('@') === -1) {
            setStep(1);
            toast.warning('Warning', { description: 'Please provide a valid email address.' });
            return;
        }
        const failed = [
            { ok: password.length >= 8, text: 'At least 8 characters' },
            { ok: /[A-Z]/.test(password), text: 'At least one uppercase letter' },
            { ok: /[a-z]/.test(password), text: 'At least one lowercase letter' },
            { ok: /[0-9]/.test(password), text: 'At least one number' },
            { ok: /[^A-Za-z0-9]/.test(password), text: 'At least one special character' },
        ].filter((it) => !it.ok);
        if (failed.length > 0) {
            setStep(1);
            toast.warning('Weak password', {
                description: failed.map((f) => f.text).join(', '),
            });
            return;
        }
        if (!websiteURL.startsWith('http://') && !websiteURL.startsWith('https://')) {
            setStep(2);
            toast.warning('Warning', {
                description: 'Website URL must start with http:// or https://.',
            });
            return;
        }
        if (websiteURL.endsWith('/')) {
            setStep(2);
            toast.warning('Warning', {
                description: 'Website URL must not end with a trailing slash (/).',
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
        <div className="flex flex-col h-screen gap-3 justify-center items-center w-full">
            <div className="w-full mb-4 flex flex-col gap-2 items-center">
                <p className={'text-5xl'}>🎉</p>
                <h1 className="text-3xl font-bold mt-2">Installation Successfully!</h1>
                <p className="text-muted-foreground">Now, start your journey by logging in.</p>
                <div className={'flex flex-row mt-3 gap-2'}>
                    <a href={'/'}>
                        <Button>
                            <LayoutDashboard />
                            Go Dashboard
                        </Button>
                    </a>
                    <a href={'/admin/'}>
                        <Button variant={'outline'}>
                            <Settings />
                            Go Admin Panel
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    ) : (
        <div className="flex flex-col h-screen gap-3 justify-center items-center w-full">
            <div className="w-full mb-4 flex flex-col gap-2 items-center">
                <Logo />
                <h1 className="text-3xl font-bold mt-2">Mosona Manager</h1>
                <p className="text-muted-foreground">Server Monitor & Remote Management</p>
            </div>

            <StepCard
                show={step == 1}
                setStep={() => {
                    setStep(1);
                }}
                title={'Step 1: Create Admin Account'}
                description={'Set up the initial administrator account.'}
            >
                <div className="mt-4 flex flex-col gap-3">
                    <Alert variant="default">
                        <InfoIcon />
                        <AlertTitle>Attention</AlertTitle>
                        <AlertDescription>
                            Admin account is not support the "forgot password". Please keep your
                            credentials safe.
                        </AlertDescription>
                    </Alert>
                    <div className="grid gap-3 mt-1">
                        <Label>
                            Username
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
                            Email
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
                            Password
                            <IsRequired />
                        </Label>
                        <Input
                            type="password"
                            placeholder="Your password"
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
                            Confirm Password
                            <IsRequired />
                        </Label>
                        <Input
                            type="password"
                            placeholder="Confirm your password"
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
                        <SquareChevronRight />
                        Next Step
                    </Button>
                </div>
            </StepCard>

            <StepCard
                show={step == 2}
                setStep={() => {
                    setStep(2);
                }}
                title={'Step 2: Base URL & Registration'}
                description={'Configure base settings.'}
            >
                <div className="mt-4 flex flex-col gap-3">
                    <div className="grid gap-3">
                        <Label>
                            Website URL
                            <IsRequired />
                        </Label>
                        <Input
                            placeholder="https://example.com"
                            value={websiteURL}
                            onChange={(e) => setWebsiteURL(e.target.value)}
                        />
                        <p className={'text-xs text-muted-foreground -mt-1'}>
                            Used for email links and OAuth redirects. Ensure correctness.
                        </p>
                    </div>
                    <div className={'border-t border-border my-1'}></div>
                    <div className="grid gap-3">
                        <Label>
                            User Registration
                            <IsRequired />
                        </Label>
                        <p className={'text-xs text-muted-foreground'}>
                            If you wish to allow user self-registration, please configure the email
                            sender under <b>Admin Settings → Email</b> after initialization, and
                            enable activation emails in <b>Admin Settings → Register & Login</b>.
                            <br />
                        </p>
                        <i className={'text-xs text-muted-foreground -mt-2'}>
                            Please note that exposing this service to unknown users may involve
                            certain <b>legal risks</b>.
                        </i>
                        <EnableCard
                            value={registrationEnabled}
                            onChange={setRegistrationEnabled}
                            title={'Enable User Registration'}
                        />
                    </div>
                    <Button
                        type={'button'}
                        className={'mt-1'}
                        onClick={onSubmit}
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle className="animate-spin" /> : <CirclePlay />}
                        Finish Initialization
                    </Button>
                </div>
            </StepCard>
        </div>
    );
};

export default Init;
