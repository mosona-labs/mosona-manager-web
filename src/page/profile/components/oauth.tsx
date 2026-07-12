import { FingerprintIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ApiUser, { type AuthIdentityType } from '@/api/user.ts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import OAuthIcon from '@/components/icons/oauth-icon.tsx';
import { ToastError } from '@/utils/toast.ts';
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
import { Button } from '@/components/ui/button.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import ApiAuth from '@/api/auth.ts';

const OAuthItem = ({ item, refresh }: { item: AuthIdentityType; refresh: () => void }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const onConnect = () => {
        setIsLoading(true);
        ApiAuth.oauthLogin(item.id)
            .then((res) => {
                window.localStorage.setItem('oauth_link', 'true');
                window.localStorage.setItem('oauth_state', res.data.state);
                window.location.href = res.data.url;
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    const onDisconnect = () => {
        setIsLoading(true);
        ApiUser.revokeOAuthIdentity(item.id)
            .then(() => {
                refresh();
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <div className={'bg-white p-2 rounded-lg'}>
                <OAuthIcon icon={item.icon} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                    {item.linked.email ? item.linked.email : t('pages.profile.noLinked')}
                </p>
            </div>
            {item.linked.email ? (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">{t('pages.profile.disconnect')}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {t('pages.profile.disconnectTitle', { name: item.name })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('pages.profile.disconnectDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t('common.cancel')}</Button>
                            </DialogClose>
                            <LoadingButton
                                isLoading={isLoading}
                                variant={'destructive'}
                                onClick={onDisconnect}
                            >
                                {t('pages.profile.disconnect')}
                            </LoadingButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : (
                <LoadingButton isLoading={isLoading} variant="outline" onClick={onConnect}>
                    {t('pages.profile.connect')}
                </LoadingButton>
            )}
        </div>
    );
};

const OAuthCard = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<AuthIdentityType[]>([]);

    const refresh = () => {
        setIsLoading(true);
        ApiUser.oauthIdentities()
            .then((res) => {
                setItems(res.data);
            })
            .catch(ToastError)
            .finally(() => setIsLoading(false));
    };
    useEffect(refresh, []);

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FingerprintIcon className="h-5 w-5 text-primary" />
                    {t('pages.profile.oauth')}
                </CardTitle>
                <CardDescription>{t('pages.profile.oauthDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
                {isLoading ? (
                    <p className="text-sm text-center py-3 text-muted-foreground xl:col-span-2 2xl:col-span-3 3xl:col-span-4">
                        {t('pages.profile.loadingOauth')}
                    </p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-center py-3 text-muted-foreground xl:col-span-2 2xl:col-span-3 3xl:col-span-4">
                        {t('pages.profile.noOauth')}
                    </p>
                ) : (
                    items.map((item) => <OAuthItem key={item.id} item={item} refresh={refresh} />)
                )}
            </CardContent>
        </Card>
    );
};

export default OAuthCard;
