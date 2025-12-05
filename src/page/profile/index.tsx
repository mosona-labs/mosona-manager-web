import { Briefcase, Shield } from 'lucide-react';

import { useUser } from '@/context/useUser.tsx';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import GravatarDialog from '@/page/profile/components/gravatar.tsx';
import TeamCard from '@/page/profile/components/team.tsx';
import AccountInfoCard from '@/page/profile/components/info.tsx';
import SessionsCard from '@/page/profile/components/session.tsx';
import TOTPCard from '@/page/profile/components/totp.tsx';
import OAuthCard from '@/page/profile/components/oauth.tsx';

const Profile = () => {
    const { user, teams } = useUser();

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
                <AccountInfoCard />

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
                        <TOTPCard />
                    </CardContent>
                </Card>

                {/*OAuth*/}
                <OAuthCard />

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
                <SessionsCard />
            </div>
        </div>
    );
};

export default Profile;
