import { Key, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { useUser } from '@/context/useUser.tsx';
import ApiUser from '@/api/user.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';

const AccountInfoCard = () => {
    const { user, refresh } = useUser();

    const [userIsChange, setUserIsChange] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    useEffect(() => {
        setUsername(user?.username || '');
    }, [user]);
    const changeUsername = () => {
        if (username === '') {
            return toast.warning('Username cannot be empty', {
                description: 'Please enter a valid username.',
            });
        }
        if (username === user?.username) {
            return toast.info('No changes detected', {
                description: 'Your username is already up to date.',
            });
        }
        setUserIsChange(true);
        ApiUser.changeUsername(username)
            .then(() => {
                toast.success('Username updated successfully', {
                    description: 'Your username has been changed.',
                });
                refresh().then();
            })
            .catch(ToastError)
            .finally(() => {
                setUserIsChange(false);
            });
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Account Information
                </CardTitle>
                <CardDescription>Update your account details and credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-foreground">
                        Username
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Your unique identifier on the platform.
                    </p>
                    <div className="flex gap-2">
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                            }}
                            className="bg-input flex-1 border-border pr-10"
                        />
                        <LoadingButton isLoading={userIsChange} onClick={changeUsername}>
                            Save
                        </LoadingButton>
                    </div>
                </div>

                <Separator className="bg-border" />

                {/* Password */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            Password
                        </Label>
                        <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountInfoCard;
