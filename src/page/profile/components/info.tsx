import { Key, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
import { formatTimeAgo } from '@/utils/time.ts';

const AccountInfoCard = () => {
    const { t } = useTranslation();
    const { user, refresh } = useUser();

    const [userIsChange, setUserIsChange] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    useEffect(() => {
        setUsername(user?.username || '');
    }, [user]);
    const changeUsername = () => {
        if (username === '') {
            return toast.warning(t('pages.profile.usernameEmpty'), {
                description: t('pages.profile.usernameEmptyDesc'),
            });
        }
        if (username === user?.username) {
            return toast.info(t('pages.profile.noChanges'), {
                description: t('pages.profile.noChangesDesc'),
            });
        }
        setUserIsChange(true);
        ApiUser.changeUsername(username)
            .then(() => {
                toast.success(t('pages.profile.usernameUpdated'), {
                    description: t('pages.profile.usernameUpdatedDesc'),
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
                    {t('pages.profile.accountInfo')}
                </CardTitle>
                <CardDescription>{t('pages.profile.accountInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-foreground">
                        {t('pages.profile.username')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        {t('pages.profile.usernameHint')}
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
                            {t('common.save')}
                        </LoadingButton>
                    </div>
                </div>

                <Separator className="bg-border" />

                {/* Password */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            {t('pages.profile.password')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            {t('pages.profile.lastChanged', {
                                time: formatTimeAgo(user?.pwd_at || ''),
                            })}
                        </p>
                    </div>
                    <Button variant="outline">{t('pages.profile.changePassword')}</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountInfoCard;
