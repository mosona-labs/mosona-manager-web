import type { UserType } from '@/api/user.ts';
import type { OwnedTeamSummary } from '@/api/admin/user.ts';

import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import ApiAdminUser from '@/api/admin/user.ts';
import { ToastError } from '@/utils/toast.ts';

const Del = ({
    user,
    refresh,
    open,
    setOpen,
}: {
    user: UserType;
    refresh: () => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const [ownedTeams, setOwnedTeams] = useState<OwnedTeamSummary[]>([]);

    const onDelete = () => {
        if (confirmation !== user.username) {
            toast.warning(t('pages.adminUsers.deleteNameMismatch'), {
                description: t('pages.adminUsers.deleteNameMismatchDesc'),
            });
            return;
        }

        setIsLoading(true);
        setOwnedTeams([]);
        ApiAdminUser.del(user.id, confirmation)
            .then(() => {
                toast.success(t('pages.adminUsers.deleteSuccess'), {
                    description: t('pages.adminUsers.deleteSuccessDesc'),
                });
                refresh();
                setConfirmation('');
                setOwnedTeams([]);
                setOpen(false);
            })
            .catch((error) => {
                const response = error?.response?.data;
                if (response?.code === 'user_owns_teams' && Array.isArray(response.data?.teams)) {
                    setOwnedTeams(response.data.teams);
                    toast.warning(t('pages.adminUsers.deleteBlocked'), {
                        description: t('pages.adminUsers.deleteBlockedDesc'),
                    });
                    return;
                }
                ToastError(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    setOpen(nextOpen);
                    if (!nextOpen) {
                        setConfirmation('');
                        setOwnedTeams([]);
                    }
                }}
            >
                <DialogContent
                    className="sm:max-w-[425px]"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {t('pages.adminUsers.deleteTitle', { name: user.username })}
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-2">
                                <p>{t('pages.adminUsers.deleteDesc')}</p>
                                <p className="text-destructive">
                                    {t('pages.adminUsers.deleteWarning')}
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    {ownedTeams.length > 0 && (
                        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                            <p className="text-sm font-medium text-destructive">
                                {t('pages.adminUsers.ownedTeams')}
                            </p>
                            <ul className="mt-2 max-h-32 list-disc space-y-1 overflow-y-auto pl-5 text-sm">
                                {ownedTeams.map((team) => (
                                    <li key={team.id} className="break-words">
                                        {team.name} (ID: {team.id})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <p className="text-sm font-semibold">
                            <Trans
                                i18nKey="pages.adminUsers.deleteTypeHint"
                                values={{ name: user.username }}
                                components={{ b: <b className="text-destructive" /> }}
                            />
                        </p>
                        <Input
                            value={confirmation}
                            autoComplete="off"
                            onChange={(event) => setConfirmation(event.target.value)}
                        />
                    </div>
                    <DialogFooter className={'mt-4'}>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <LoadingButton
                            variant={'destructive'}
                            onClick={onDelete}
                            isLoading={isLoading}
                        >
                            {t('common.delete')}
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Del;
