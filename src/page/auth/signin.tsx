import { Loader, LoaderCircle } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import PasswordCheck from './components/PasswordCheck';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuthKeys from '@/hooks/useAuthKeys';
import ApiAuth from '@/api/auth';
import { ToastError } from '@/utils/toast';
import OAuthBtn from '@/page/auth/components/oauth.tsx';

const SignIn = () => {
    const navigate = useNavigate();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    // Captcha
    const captchaRef = useRef<TurnstileInstance | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string>('');

    // Jump
    const [jumpTarget, setJumpTarget] = useState<string>('');
    useEffect(() => {
        if (window.location.search) {
            const params = new URLSearchParams(window.location.search);
            const target = params.get('jump');
            if (target) setJumpTarget(target);
        }
    }, [window.location.search]);

    // Form
    const formRef = useRef<HTMLFormElement | null>(null);
    const [password, setPassword] = useState<string>('');

    // Submit
    const [loading, setLoading] = useState<boolean>(false);
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Check
        if (data.email === '' || data.password === '') {
            toast.warning('Warning', {
                description: 'Please fill in all required fields.',
            });
            return;
        }
        if (mode === 'signin') {
            // Sign In logic
            setLoading(true);
            ApiAuth.login(String(data.email), String(data.password), Boolean(data.remember))
                .then(() => {
                    toast.success('Success', {
                        description: 'Signed in successfully.',
                    });
                    navigate(jumpTarget ? jumpTarget : '/');
                })
                .catch(ToastError)
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // Sign Up logic
            if (data.username === '' || data['confirm-password'] === '' || captchaToken === '') {
                toast.warning('Warning', {
                    description: 'Please fill in all required fields.',
                });
                return;
            }
            if (data.password !== data['confirm-password']) {
                toast.error('Error', {
                    description: 'Passwords do not match.',
                });
                return;
            }
            // Password strength validation
            const pass = String(data.password || '');
            const items = [
                { ok: pass.length >= 8, text: 'At least 8 characters' },
                { ok: /[A-Z]/.test(pass), text: 'At least one uppercase letter' },
                { ok: /[a-z]/.test(pass), text: 'At least one lowercase letter' },
                { ok: /[0-9]/.test(pass), text: 'At least one number' },
                { ok: /[^A-Za-z0-9]/.test(pass), text: 'At least one special character' },
            ];
            const failed = items.filter((it) => !it.ok);
            if (failed.length > 0) {
                toast.error('Weak password', {
                    description: failed.map((f) => f.text).join(', '),
                });
                return;
            }
            // Submit
            setLoading(true);
            ApiAuth.register(
                String(data.username),
                String(data.password),
                String(data.email),
                captchaToken
            )
                .then(() => {
                    toast.success('Success', {
                        description: 'Account created successfully. You can now sign in.',
                    });
                    formRef.current?.reset();
                    setMode('signin');
                })
                .catch(ToastError)
                .finally(() => {
                    setLoading(false);
                    captchaRef.current?.reset();
                    setCaptchaToken('');
                });
        }
    };

    // Auth Keys
    const { keys } = useAuthKeys();

    return (
        <div className="flex flex-col h-screen gap-3 justify-center items-center w-full">
            <div className="w-full mb-4 flex flex-col gap-2 items-center">
                <Logo />
                <h1 className="text-3xl font-bold mt-2">Mosona Manager</h1>
                <p className="text-muted-foreground">Server Monitor & Remote Management</p>
            </div>
            <Card className="w-[90vw] md:w-md py-4">
                <CardContent className="px-4">
                    <CardHeader className="px-0">
                        <CardTitle>
                            {mode === 'signin' ? 'Welcome back !' : 'Welcome here !'}
                        </CardTitle>
                        <CardDescription>
                            {mode === 'signin'
                                ? 'Sign in to your account to continue'
                                : 'Create a new account to get started'}
                        </CardDescription>
                    </CardHeader>
                    <form ref={formRef} className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
                        {mode === 'signup' && (
                            <div className="grid gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" name="username" placeholder="John Doe" />
                            </div>
                        )}
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Your password"
                                className="mt-3"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />
                            {mode === 'signup' && <PasswordCheck password={password} />}
                        </div>
                        {mode === 'signup' && (
                            <div className="grid gap-3">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        )}
                        {mode === 'signup' && (
                            <div className="grid gap-3">
                                <Label htmlFor="invite-code">Captcha</Label>
                                <div className="border rounded-xl overflow-hidden bg-[#fafafa] dark:bg-[#232323] relative">
                                    <div
                                        className="absolute w-full h-full flex justify-center items-center"
                                        style={{
                                            zIndex: 1,
                                        }}
                                    >
                                        <LoaderCircle className="animate-spin text-muted-foreground" />
                                    </div>
                                    <Turnstile
                                        ref={captchaRef}
                                        siteKey={keys?.captcha || ''}
                                        options={{
                                            size: 'flexible',
                                        }}
                                        style={{
                                            margin: '-1%',
                                            width: '102%',
                                            position: 'relative',
                                            zIndex: 2,
                                        }}
                                        onReset={() => {
                                            setCaptchaToken('');
                                        }}
                                        onSuccess={(token) => {
                                            setCaptchaToken(token);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex flex-row justify-between my-1">
                            {mode === 'signin' ? (
                                <div className="flex flex-row gap-2">
                                    <Checkbox id="remember" name="remember" />
                                    <Label htmlFor="remember">Remember me</Label>
                                </div>
                            ) : (
                                <div />
                            )}
                            <Label
                                className="hover:underline cursor-pointer"
                                onClick={() => {
                                    formRef.current?.reset();
                                    setPassword('');
                                    setMode(mode === 'signin' ? 'signup' : 'signin');
                                }}
                            >
                                {mode === 'signin'
                                    ? "Don't have an account?"
                                    : 'Already have an account?'}
                            </Label>
                        </div>
                        <Button type="submit" variant={'outline'} disabled={loading}>
                            <Loader
                                className="animate-spin"
                                style={{ display: loading ? 'inline-block' : 'none' }}
                            />
                            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            {mode === 'signin' && (
                <>
                    <div className="flex flex-row gap-3 md:w-md items-center px-1">
                        <div className="border-t flex-1" />
                        <span className="text-sm text-muted-foreground">OR</span>
                        <div className="border-t flex-1" />
                    </div>
                    <Card className="w-[90vw] md:w-md py-0">
                        <CardContent className="px-0">
                            {keys?.oauth.map((item) => (
                                <OAuthBtn key={item.id} info={item} />
                            ))}
                        </CardContent>
                    </Card>
                    <Button variant={'ghost'} className="fixed bottom-4">
                        Forget my password
                    </Button>
                </>
            )}
        </div>
    );
};

export default SignIn;
