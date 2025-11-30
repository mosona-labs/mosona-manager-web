import { useEffect, useState } from 'react';
import { Cable } from 'lucide-react';

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
                    {isCurrent && ' • Current Session'}
                </p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">Revoke</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Revoke Session</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke this session? This will log out the
                            device associated with this session.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <LoadingButton
                            variant={'destructive'}
                            onClick={revokeSession}
                            isLoading={isLoading}
                        >
                            Revoke Session
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const SessionsCard = () => {
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
                        Sessions
                    </CardTitle>
                    <CardDescription>
                        View and manage your active sessions across different devices.
                    </CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant={'secondary'}
                            className={'hover:bg-rose-500/50 transition duration-300'}
                        >
                            Revoke All
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Revoke All Sessions</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to revoke all sessions? This will log out all
                                devices.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <LoadingButton
                                variant={'destructive'}
                                isLoading={revokingAll}
                                onClick={revokeAllSessions}
                            >
                                Revoke All
                            </LoadingButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
    );
};

export default SessionsCard;
