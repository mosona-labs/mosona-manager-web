import { EditIcon } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
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
import ApiAdminOAuth, { type OAuthProviderType } from '@/api/admin/oauth.ts';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';
import OAuthIcon from '@/components/icons/oauth-icon.tsx';

const Edit = ({ item, refresh }: { item: OAuthProviderType; refresh: () => void }) => {
    const [selectedProviderName, setSelectedProviderName] = useState('');

    // Open
    const [open, setOpen] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [authorizeUrl, setAuthorizeUrl] = useState('');
    const [tokenUrl, setTokenUrl] = useState('');
    const [userUrl, setUserUrl] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [skip2fa, setSkip2fa] = useState(false);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (selectedProviderName === '') return;
        const provider = OAuthList.find((p) => p.name === selectedProviderName);
        setAuthorizeUrl(provider?.authorize_url || '');
        setTokenUrl(provider?.token_url || '');
        setUserUrl(provider?.user_url || '');
        setIcon(provider?.icon || '');
    }, [selectedProviderName]);

    useEffect(() => {
        if (open) {
            // Load item data
            setName(item.name);
            setIcon(item.icon);
            setAuthorizeUrl(item.auth_url);
            setTokenUrl(item.token_url);
            setUserUrl(item.userinfo_url);
            setClientId(item.client_id);
            setClientSecret(item.client_secret);
            setSkip2fa(item.skip_2fa);
            setEnabled(item.is_enabled);

            // Find matching provider
            const provider = OAuthList.find(
                (p) => p.authorize_url === item.auth_url && p.token_url === item.token_url
            );
            setSelectedProviderName(provider?.name || '');
        }
    }, [open, item]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            icon: formData.get('icon') as string,
            authorize_url: formData.get('authorize_url') as string,
            token_url: formData.get('token_url') as string,
            userinfo_url: formData.get('userinfo_url') as string,
            client_id: formData.get('client_id') as string,
            client_secret: formData.get('client_secret') as string,
            skip_2fa: formData.get('skip_2fa') === 'on',
            enabled: formData.get('enabled') === 'on',
        };
        ApiAdminOAuth.update(item.id, {
            name: data.name,
            icon: data.icon,
            auth_url: data.authorize_url,
            token_url: data.token_url,
            userinfo_url: data.userinfo_url,
            client_id: data.client_id,
            client_secret: data.client_secret,
            skip_2fa: data.skip_2fa,
            is_enabled: data.enabled,
        })
            .then(() => {
                toast.success('Update successful', {
                    description: 'The OAuth2 provider has been updated successfully.',
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
                <Button variant={'ghost'} className={'rounded-none'}>
                    <EditIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Auth Provider</DialogTitle>
                        <DialogDescription>
                            Update the OAuth2 authentication provider.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2 mt-5">
                        <div className="grid gap-3">
                            <Label>
                                Authentication Name
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
                            <Label>OAuth2 Provider</Label>
                            <Select
                                name="provider"
                                value={selectedProviderName}
                                onValueChange={setSelectedProviderName}
                            >
                                <SelectTrigger className={'w-full'}>
                                    <SelectValue placeholder="Select a provider" />
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
                                Icon
                                <IsRequired />
                            </Label>
                            <div className={'flex flex-row items-center gap-2'}>
                                <Input
                                    name="icon"
                                    placeholder={
                                        'e.g. google, github or https://example.com/icon.png'
                                    }
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    required
                                />
                                <Button variant={'outline'} type="button">
                                    {icon ? <OAuthIcon icon={icon} /> : 'None'}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                Authorize URL
                                <IsRequired />
                            </Label>
                            <Input
                                name="authorize_url"
                                value={authorizeUrl}
                                placeholder={'https://example.com/login/oauth/authorize'}
                                onChange={(e) => {
                                    setAuthorizeUrl(e.target.value);
                                }}
                                required
                            />
                        </div>
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                Token URL
                                <IsRequired />
                            </Label>
                            <Input
                                name="token_url"
                                value={tokenUrl}
                                placeholder={'https://example.com/login/oauth/access_token'}
                                onChange={(e) => {
                                    setTokenUrl(e.target.value);
                                }}
                                required
                            />
                        </div>
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                User Info URL
                                <IsRequired />
                            </Label>
                            <Input
                                name="userinfo_url"
                                value={userUrl}
                                placeholder={'https://api.example.com/user'}
                                onChange={(e) => {
                                    setUserUrl(e.target.value);
                                }}
                                required
                            />
                        </div>
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                Client ID
                                <IsRequired />
                            </Label>
                            <Input
                                name="client_id"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-3 md:col-span-2">
                            <Label>
                                Client Secret
                                <IsRequired />
                            </Label>
                            <Input
                                name="client_secret"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                required
                            />
                        </div>
                        <div className={'space-y-2'}>
                            <div className="flex items-center gap-3 md:col-span-2">
                                <Checkbox
                                    id="skip_2fa"
                                    name={'skip_2fa'}
                                    checked={skip2fa}
                                    onCheckedChange={(checked) => setSkip2fa(checked === true)}
                                />
                                <Label htmlFor="skip_2fa" className={'cursor-pointer'}>
                                    Skip 2FA
                                </Label>
                                <IsRequired className={'-ms-2'} />
                            </div>
                            <div className="flex items-center gap-3 md:col-span-2">
                                <Checkbox
                                    id="enabled"
                                    name={'enabled'}
                                    checked={enabled}
                                    onCheckedChange={(checked) => setEnabled(checked === true)}
                                />
                                <Label htmlFor="enabled" className={'cursor-pointer'}>
                                    Enabled
                                </Label>
                                <IsRequired className={'-ms-2'} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <LoadingButton isLoading={isSubmitting} type="submit">
                            Save changes
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Edit;
