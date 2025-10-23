import { KeyRound } from 'lucide-react';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignIn = () => {
    return (
        <div className="flex flex-col h-screen gap-3 justify-center items-center w-full">
            <div className="w-full mb-4 flex flex-col gap-2 items-center">
                <Logo />
                <h1 className="text-3xl font-bold mt-2">Mosona Manager</h1>
                <p className="text-muted-foreground">Server Monitor & Management</p>
            </div>
            <Card className="md:w-md py-4">
                <CardContent className="px-4">
                    <CardHeader className="px-0">
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                            Please sign in to your account to continue.
                        </CardDescription>
                    </CardHeader>
                    <form className="mt-4 flex flex-col gap-3">
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Your password"
                            />
                        </div>
                        <div className="flex flex-row justify-between my-1">
                            <div className="flex flex-row gap-2">
                                <Checkbox id="remember" name="remember" />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>
                            <Label className="hover:underline">Don't have an account?</Label>
                        </div>
                        <Button type="submit" variant={'outline'}>
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <div className="flex flex-row gap-3 md:w-md items-center px-1">
                <div className="border-t flex-1" />
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="border-t flex-1" />
            </div>
            <Card className="md:w-md py-0">
                <CardContent className="px-0">
                    <Button
                        variant={'ghost'}
                        size={'lg'}
                        className="flex flex-row gap-3 w-full justify-start px-4 rounded-b-none"
                    >
                        <KeyRound />
                        Continue with SSO
                    </Button>
                    <Button
                        variant={'ghost'}
                        size={'lg'}
                        className="flex flex-row gap-3 w-full justify-start px-4 rounded-none"
                    >
                        <img src={'/icons/google.svg'} className="w-4.5" />
                        Continue with Google
                    </Button>
                    <Button
                        variant={'ghost'}
                        size={'lg'}
                        className="flex flex-row gap-3 w-full justify-start px-4 rounded-t-none"
                    >
                        <img src={'/icons/github.svg'} className="w-4.5 bg-white rounded-full" />
                        Continue with GitHub
                    </Button>
                </CardContent>
            </Card>
            <Button variant={'ghost'} size={'sm'} className="w-md rounded-xl absolute bottom-4">
                Forget my password
            </Button>
        </div>
    );
};

export default SignIn;
