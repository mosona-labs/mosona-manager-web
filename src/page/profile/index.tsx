import { Briefcase, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { user, teams } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setMounted(true), 40);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div
                className="flex flex-row justify-between items-center mb-3"
                style={{
                    transition: 'opacity 400ms ease, transform 400ms ease',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'none' : 'translateY(6px)',
                }}
            >
                <div>
                    <h1 className="text-2xl font-bold">{t('pages.profile.title')}</h1>
                    <p className="opacity-65">{t('pages.profile.description')}</p>
                </div>
            </div>
            <div
                className={'flex flex-col gap-4'}
                style={{ transition: 'opacity 400ms ease', opacity: mounted ? 1 : 0 }}
            >
                <Card
                    className={'py-4 overflow-hidden'}
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '60ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <CardContent className={'flex flex-row items-center gap-3 relative'}>
                        <GravatarDialog username={user?.username || ''} email={user?.email} />
                        <div className={'flex-1 flex flex-col justify-center'}>
                            <h2 className={'text-xl break-all'}>{user?.username}</h2>
                            <p className={'opacity-75 break-all text-sm'}>{user?.email}</p>
                            <p className={'opacity-50 break-all text-xs mt-0.5'}>
                                {t('pages.profile.memberSince', {
                                    date: new Date(user?.created_at || '').toLocaleDateString(),
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <div
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '100ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <AccountInfoCard />
                </div>

                {/* Security */}
                <Card
                    className="border-border bg-card"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '140ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            {t('pages.profile.security')}
                        </CardTitle>
                        <CardDescription>{t('pages.profile.securityDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/*TOTP*/}
                        <TOTPCard />
                    </CardContent>
                </Card>

                {/*OAuth*/}
                <div
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '180ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <OAuthCard />
                </div>

                {/*Teams*/}
                <Card
                    className="border-border bg-card"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '220ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            {t('pages.profile.teams')}
                        </CardTitle>
                        <CardDescription>{t('pages.profile.teamsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {teams.length === 0 ? (
                            <p className="text-sm text-center py-3 text-muted-foreground">
                                {t('pages.profile.noTeams')}
                            </p>
                        ) : (
                            teams.map((team) => <TeamCard key={team.id} team={team} />)
                        )}
                    </CardContent>
                </Card>

                {/*Sessions*/}
                <div
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '260ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <SessionsCard />
                </div>
            </div>
        </div>
    );
};

export default Profile;
