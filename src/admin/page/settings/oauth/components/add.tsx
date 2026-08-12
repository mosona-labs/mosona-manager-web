import { Plus } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import IsRequired from '@/components/required.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import OAuthList from '@/admin/page/settings/oauth/oauth.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import ApiAdminOAuth from '@/api/admin/oauth.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';
import OAuthIcon from '@/components/icons/oauth-icon.tsx';

const Add = ({ refresh }: { refresh: () => void }) => {
    const { t } = useTranslation();
    const [selectedProviderName, setSelectedProviderName] = useState('');

    // Open
    const [open, setOpen] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [authorizeUrl, setAuthorizeUrl] = useState('');
    const [tokenUrl, setTokenUrl] = useState('');
    const [userUrl, setUserUrl] = useState('');
    const [protocol, setProtocol] = useState<'oauth2' | 'oidc'>('oauth2');
    const [issuerUrl, setIssuerUrl] = useState('');
    const [scopes, setScopes] = useState('read:user read:email');
    const [subjectField, setSubjectField] = useState('id');

    useEffect(() => {
        if (selectedProviderName === '') return;
        const provider = OAuthList.find((item) => item.name === selectedProviderName);
        setAuthorizeUrl(provider?.authorize_url || '');
        setTokenUrl(provider?.token_url || '');
        setUserUrl(provider?.user_url || '');
        setIcon(provider?.icon || '');
        setName(provider?.name || '');
        setProtocol('oauth2');
        setIssuerUrl('');
        setScopes('read:user read:email');
        setSubjectField('id');
    }, [selectedProviderName]);

    useEffect(() => {
        if (open) {
            // Reset form fields
            setSelectedProviderName('');
            setIcon('');
            setAuthorizeUrl('');
            setTokenUrl('');
            setUserUrl('');
            setName('');
            setProtocol('oauth2');
            setIssuerUrl('');
            setScopes('read:user read:email');
            setSubjectField('id');
        }
    }, [open]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            provider: formData.get('provider') as string,
            icon: formData.get('icon') as string,
            authorize_url: protocol === 'oauth2' ? (formData.get('authorize_url') as string) : '',
            token_url: protocol === 'oauth2' ? (formData.get('token_url') as string) : '',
            userinfo_url: protocol === 'oauth2' ? (formData.get('userinfo_url') as string) : '',
            protocol,
            issuer_url: protocol === 'oidc' ? issuerUrl : '',
            scopes,
            subject_field: protocol === 'oidc' ? 'sub' : subjectField,
            client_id: formData.get('client_id') as string,
            client_secret: formData.get('client_secret') as string,
            skip_2fa: formData.get('skip_2fa') === 'on',
            enabled: formData.get('enabled') === 'on',
        };
        ApiAdminOAuth.add({
            name: data.name,
            icon: data.icon,
            protocol: data.protocol,
            issuer_url: data.issuer_url,
            auth_url: data.authorize_url,
            token_url: data.token_url,
            userinfo_url: data.userinfo_url,
            scopes: data.scopes,
            subject_field: data.subject_field,
            client_id: data.client_id,
            client_secret: data.client_secret,
            skip_2fa: data.skip_2fa,
            is_enabled: data.enabled,
        })
            .then(() => {
                toast.success(t('pages.adminOauth.createSuccess'), {
                    description: t('pages.adminOauth.createSuccessDesc'),
                });

                setOpen(false);
                refresh();
            })
            .catch(ToastError)
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => {}}>
                    <Plus />
                    {t('pages.adminOauth.add')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('pages.adminOauth.createTitle')}</DialogTitle>
                        <DialogDescription>{t('pages.adminOauth.createDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2 mt-5">
                        <div className="grid gap-3">
                            <Label>
                                {t('pages.adminOauth.authName')}
                                <IsRequired />
                            </Label>
                            <Input
                                name="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                placeholder={'Google'}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label>
                                {t('pages.adminOauth.provider')}
                                <IsRequired />
                            </Label>
                            <Select
                                required
                                name="provider"
                                value={selectedProviderName}
                                onValueChange={setSelectedProviderName}
                            >
                                <SelectTrigger className={'w-full'}>
                                    <SelectValue
                                        placeholder={t('pages.adminOauth.selectProvider')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {OAuthList.map((item) => (
                                            <SelectItem key={item.name} value={item.name}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-3 flex-1 md:col-span-2">
                            <Label>
                                {t('pages.adminOauth.icon')}
                                <IsRequired />
                            </Label>
                            <div className={'flex flex-row items-center gap-2'}>
                                <Input
                                    name="icon"
                                    placeholder={t('pages.adminOauth.iconPlaceholder')}
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    required
                                />
                                <Button variant={'outline'} type="button">
                                    {icon ? <OAuthIcon icon={icon} /> : t('pages.adminOauth.none')}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                {t('pages.adminOauth.protocol')}
                                <IsRequired />
                            </Label>
                            <Select
                                value={protocol}
                                onValueChange={(value) => {
                                    const nextProtocol = value as 'oauth2' | 'oidc';
                                    setProtocol(nextProtocol);
                                    setScopes(
                                        nextProtocol === 'oidc'
                                            ? 'openid profile email'
                                            : 'read:user read:email'
                                    );
                                    setSubjectField(nextProtocol === 'oidc' ? 'sub' : 'id');
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                                    <SelectItem value="oidc">OpenID Connect</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {protocol === 'oidc' ? (
                            <div className="grid gap-3 md:col-span-2">
                                <Label>
                                    {t('pages.adminOauth.issuerUrl')}
                                    <IsRequired />
                                </Label>
                                <Input
                                    name="issuer_url"
                                    value={issuerUrl}
                                    placeholder="https://accounts.example.com"
                                    onChange={(e) => setIssuerUrl(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 md:col-span-2">
                                    <Label>
                                        {t('pages.adminOauth.authorizeUrl')}
                                        <IsRequired />
                                    </Label>
                                    <Input
                                        name="authorize_url"
                                        value={authorizeUrl}
                                        placeholder="https://example.com/login/oauth/authorize"
                                        onChange={(e) => setAuthorizeUrl(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3 md:col-span-2">
                                    <Label>
                                        {t('pages.adminOauth.tokenUrl')}
                                        <IsRequired />
                                    </Label>
                                    <Input
                                        name="token_url"
                                        value={tokenUrl}
                                        placeholder="https://example.com/login/oauth/access_token"
                                        onChange={(e) => setTokenUrl(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3 md:col-span-2">
                                    <Label>
                                        {t('pages.adminOauth.userInfoUrl')}
                                        <IsRequired />
                                    </Label>
                                    <Input
                                        name="userinfo_url"
                                        value={userUrl}
                                        placeholder="https://api.example.com/user"
                                        onChange={(e) => setUserUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                {t('pages.adminOauth.scopes')}
                                <IsRequired />
                            </Label>
                            <Input
                                name="scopes"
                                value={scopes}
                                onChange={(e) => setScopes(e.target.value)}
                                required
                            />
                        </div>
                        {protocol === 'oauth2' && (
                            <div className="grid gap-3 md:col-span-2">
                                <Label>
                                    {t('pages.adminOauth.subjectField')}
                                    <IsRequired />
                                </Label>
                                <Input
                                    name="subject_field"
                                    value={subjectField}
                                    onChange={(e) => setSubjectField(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                {t('pages.adminOauth.clientId')}
                                <IsRequired />
                            </Label>
                            <Input name="client_id" required />
                        </div>
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                {t('pages.adminOauth.clientSecret')}
                                <IsRequired />
                            </Label>
                            <Input name="client_secret" required />
                        </div>
                        <div className={'space-y-2'}>
                            <div className="flex items-center gap-3 md:col-span-2">
                                <Checkbox id="skip_2fa" name={'skip_2fa'} defaultChecked />
                                <Label htmlFor="skip_2fa" className={'cursor-pointer'}>
                                    {t('pages.adminOauth.skip2fa')}
                                </Label>
                                <IsRequired className={'-ms-2'} />
                            </div>
                            <div className="flex items-center gap-3 md:col-span-2">
                                <Checkbox id="enabled" name={'enabled'} defaultChecked />
                                <Label htmlFor="enabled" className={'cursor-pointer'}>
                                    {t('pages.adminOauth.enabled')}
                                </Label>
                                <IsRequired className={'-ms-2'} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogClose>
                        <LoadingButton isLoading={isSubmitting} type="submit">
                            {t('pages.adminOauth.save')}
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Add;
