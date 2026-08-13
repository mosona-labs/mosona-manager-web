import type { UserType } from '@/api/user.ts';

import { Dice5 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import ApiAdminUser from '@/api/admin/user.ts';
import { ToastError } from '@/utils/toast.ts';

const Edit = ({
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

    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(user.is_admin ? 'true' : 'false');

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            username: formData.get('username') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            current_password: formData.get('current_password') as string,
            verified: formData.get('verified') === 'true',
            is_admin: formData.get('is_admin') === 'true',
        };

        setIsLoading(true);
        ApiAdminUser.update(user.id, {
            username: data.username,
            email: data.email,
            password: data.password,
            current_password: data.current_password,
            verified: data.verified,
            is_admin: data.is_admin,
        })
            .then(() => {
                toast.success(t('pages.adminUsers.editSuccess'), {
                    description: t('pages.adminUsers.editSuccessDesc'),
                });
                refresh();
                setPassword('');
                setCurrentPassword('');
                setOpen(false);
            })
            .catch(ToastError)
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
                        setPassword('');
                        setCurrentPassword('');
                        setIsAdmin(user.is_admin ? 'true' : 'false');
                    }
                }}
            >
                <DialogContent
                    className="sm:max-w-[425px]"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>{t('pages.adminUsers.editTitle')}</DialogTitle>
                        <DialogDescription>{t('pages.adminUsers.editDesc')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label>{t('pages.adminUsers.username')}</Label>
                                <Input
                                    name="username"
                                    placeholder={'John Doe'}
                                    defaultValue={user.username}
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label>{t('pages.adminUsers.email')}</Label>
                                <Input
                                    name="email"
                                    type={'email'}
                                    placeholder={'user@example.com'}
                                    defaultValue={user.email}
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label>{t('pages.adminUsers.password')}</Label>
                                <div className={'flex flex-row gap-2'}>
                                    <Input
                                        name="password"
                                        placeholder={t('pages.adminUsers.keepPassword')}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                        }}
                                    />
                                    <Button
                                        variant={'outline'}
                                        type={'button'}
                                        onClick={() => {
                                            setPassword(Math.random().toString(36).slice(-8));
                                        }}
                                    >
                                        <Dice5 />
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor={`edit-current-password-${user.id}`}>
                                    {t('pages.adminUsers.currentAdminPassword')}
                                </Label>
                                <Input
                                    id={`edit-current-password-${user.id}`}
                                    name="current_password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    required={password !== '' || isAdmin !== String(user.is_admin)}
                                />
                            </div>
                            <div className={'grid gap-3'}>
                                <Label>{t('pages.adminUsers.verified')}</Label>
                                <Select
                                    name={'verified'}
                                    defaultValue={user.verified ? 'true' : 'false'}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="true">{t('common.true')}</SelectItem>
                                            <SelectItem value="false">
                                                {t('common.false')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className={'grid gap-3'}>
                                <Label>{t('pages.adminUsers.isAdmin')}</Label>
                                <Select
                                    name={'is_admin'}
                                    value={isAdmin}
                                    onValueChange={setIsAdmin}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="true">{t('common.true')}</SelectItem>
                                            <SelectItem value="false">
                                                {t('common.false')}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className={'mt-4'}>
                            <DialogClose asChild>
                                <Button variant="outline">{t('common.cancel')}</Button>
                            </DialogClose>
                            <LoadingButton type="submit" isLoading={isLoading}>
                                {t('pages.adminUsers.save')}
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Edit;
