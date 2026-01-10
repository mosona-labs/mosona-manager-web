import { Loader } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import PasswordCheck from '../auth/components/PasswordCheck';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const Init = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        setLoading(true);
    };

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
                        <CardTitle>Setup</CardTitle>
                        <CardDescription>
                            Please set up your administrator account to get started.
                        </CardDescription>
                    </CardHeader>
                    <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
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
                            <PasswordCheck password={password} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                placeholder="Confirm your password"
                            />
                        </div>
                        <div className="my-1 gap-3 flex flex-col">
                            <div className="flex items-center gap-3">
                                <Checkbox id="know_pwd" name="know_pwd" />
                                <Label htmlFor="know_pwd">
                                    I Know password reset is not available for admin.
                                </Label>
                            </div>
                        </div>
                        <Button type="submit" variant={'outline'} disabled={loading}>
                            <Loader
                                className="animate-spin"
                                style={{ display: loading ? 'inline-block' : 'none' }}
                            />
                            Create Account
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Init;
