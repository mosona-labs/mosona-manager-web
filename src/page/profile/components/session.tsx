import { useEffect, useState } from 'react';
import { Cable } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ApiUser, { type UserSessionType } from '@/api/user.ts';
import GetUAInfo from '@/utils/ua.ts';
import { cn } from '@/lib/utils.ts';
import Browser from '@/page/logs/components/browser.tsx';
import OS from '@/page/logs/components/os.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import { ToastError } from '@/utils/toast.ts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';

const SessionCard = ({
    session,
    isCurrent,
    reload,
}: {
    session: UserSessionType;
    isCurrent: boolean;
    reload: () => void;
}) => {
    const { t } = useTranslation();
    const deviceInfo = GetUAInfo(session.user_agent);

    const [isLoading, setIsLoading] = useState(false);

    const revokeSession = () => {
        setIsLoading(true);

        ApiUser.revokeSession(session.id)
            .then(() => {
                if (isCurrent) {
                    window.location.reload();
                } else reload();
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4',
                isCurrent ? 'bg-secondary' : ''
            )}
        >
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground flex flex-row gap-1.5">
                    <Browser browser={deviceInfo.browser} />
                    <OS os={deviceInfo.os} />
                    {deviceInfo.browser} {deviceInfo.version}{' '}
                    <span className={'opacity-65'}>({deviceInfo.os})</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    {new Date(session.time * 1000).toLocaleString()}
                    {isCurrent && ` • ${t('pages.profile.currentSession')}`}
                </p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">{t('pages.profile.revoke')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('pages.profile.revokeTitle')}</DialogTitle>
                        <DialogDescription>{t('pages.profile.revokeDesc')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <LoadingButton
                            variant={'destructive'}
                            onClick={revokeSession}
                            isLoading={isLoading}
                        >
                            {t('pages.profile.revokeAction')}
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const SessionsCard = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);

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

    const [revokingAll, setRevokingAll] = useState(false);

    const revokeAllSessions = () => {
        setRevokingAll(true);
        ApiUser.revokeAllSessions()
            .then(() => {
                window.location.reload();
            })
            .catch(ToastError)
            .finally(() => {
                setRevokingAll(false);
            });
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader className={'flex flex-row justify-between items-center w-full'}>
                <div className={'gap-2 flex flex-col'}>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Cable className="h-5 w-5 text-primary" />
                        {t('pages.profile.sessions')}
                    </CardTitle>
                    <CardDescription>{t('pages.profile.sessionsDesc')}</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant={'secondary'}
                            className={'hover:bg-rose-500/50 transition duration-300'}
                        >
                            {t('pages.profile.revokeAll')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('pages.profile.revokeAllTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('pages.profile.revokeAllDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t('common.cancel')}</Button>
                            </DialogClose>
                            <LoadingButton
                                variant={'destructive'}
                                isLoading={revokingAll}
                                onClick={revokeAllSessions}
                            >
                                {t('pages.profile.revokeAll')}
                            </LoadingButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoading ? (
                    <p className="text-sm text-center py-3 text-muted-foreground">
                        {t('pages.profile.loadingSessions')}
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
    );
};

export default SessionsCard;
