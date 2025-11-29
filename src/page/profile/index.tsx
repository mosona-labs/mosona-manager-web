import { Briefcase, Cable, Key, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import ApiUser, { type UserSessionType } from '@/api/user.ts';
import { useUser } from '@/context/useUser.tsx';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import GravatarDialog from '@/page/profile/components/gravatar.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { ToastError } from '@/utils/toast.ts';
import SessionCard from '@/page/profile/components/session.tsx';
import TeamCard from '@/page/profile/components/team.tsx';

const Profile = () => {
    const { user, teams, refresh } = useUser();

    const [isLoading, setIsLoading] = useState(false);

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Session
    const [currentSession, setCurrentSession] = useState<string>('');
    const [sessions, setSessions] = useState<Array<UserSessionType>>([]);

    const reloadSession = () => {
        setIsLoading(true);
        ApiUser.sessions()
            .then((res) => {
                setCurrentSession(res.data.current);
                setSessions(res.data.list);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        reloadSession();
    }, []);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="opacity-65">
                        Manage your personal profile, account settings and sessions.
                    </p>
                </div>
            </div>
            <div className={'flex flex-col gap-4'}>
                <Card className={'py-4 overflow-hidden'}>
                    <CardContent className={'flex flex-row items-center gap-3 relative'}>
                        <GravatarDialog username={user?.username || ''} email={user?.email} />
                        <div className={'flex-1 flex flex-col justify-center'}>
                            <h2 className={'text-xl break-all'}>{user?.username}</h2>
                            <p className={'opacity-75 break-all text-sm'}>{user?.email}</p>
                            <p className={'opacity-50 break-all text-xs mt-0.5'}>
                                Member since {new Date(user?.created_at || '').toLocaleDateString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Account Information
                        </CardTitle>
                        <CardDescription>
                            Update your account details and credentials.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="username"
                                className="text-sm font-medium text-foreground"
                            >
                                Username
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Your unique identifier on the platform.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    id="username"
                                    defaultValue="arsfy"
                                    className="bg-input flex-1 border-border pr-10"
                                />
                                <Button>Save</Button>
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
                                <p className="text-xs text-muted-foreground">
                                    Last changed 3 months ago
                                </p>
                            </div>
                            <Button variant="outline">Change Password</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Security
                        </CardTitle>
                        <CardDescription>
                            Manage your account security and authentication methods.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/*TOTP*/}
                        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground">
                                        Two-Factor Authentication (TOTP)
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Add an extra layer of security to your account using an
                                    authenticator app.
                                </p>
                            </div>
                            <Switch
                                checked={twoFactorEnabled}
                                onCheckedChange={setTwoFactorEnabled}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/*Teams*/}
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Teams
                        </CardTitle>
                        <CardDescription>Manage your joined teams.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {teams.length === 0 ? (
                            <p className="text-sm text-center py-3 text-muted-foreground">
                                You have not joined any teams yet.
                            </p>
                        ) : (
                            teams.map((team) => <TeamCard key={team.id} team={team} />)
                        )}
                    </CardContent>
                </Card>

                {/*Sessions*/}
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Cable className="h-5 w-5 text-primary" />
                            Sessions
                        </CardTitle>
                        <CardDescription>
                            View and manage your active sessions across different devices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {isLoading ? (
                            <p className="text-sm text-center py-3 text-muted-foreground">
                                Loading sessions...
                            </p>
                        ) : (
                            sessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    isCurrent={session.id === currentSession}
                                    reload={reloadSession}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
