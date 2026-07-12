import { Dice5, Plus } from 'lucide-react';
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
    DialogTrigger,
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

const Add = ({ refresh }: { refresh: () => void }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const [password, setPassword] = useState('');

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            username: formData.get('username') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            verified: formData.get('verified') === 'true',
            is_admin: formData.get('is_admin') === 'true',
        };

        setIsLoading(true);
        ApiAdminUser.add({
            username: data.username,
            email: data.email,
            password: data.password,
            verified: data.verified,
            is_admin: data.is_admin,
        })
            .then(() => {
                toast.success(t('pages.adminUsers.createSuccess'), {
                    description: t('pages.adminUsers.createSuccessDesc'),
                });
                refresh();
                setOpen(false);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    onClick={() => {
                        setPassword(Math.random().toString(36).slice(-8));
                    }}
                >
                    <Plus />
                    {t('pages.adminUsers.add')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('pages.adminUsers.addTitle')}</DialogTitle>
                    <DialogDescription>{t('pages.adminUsers.addDesc')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label>{t('pages.adminUsers.username')}</Label>
                            <Input name="username" placeholder={'John Doe'} required />
                        </div>
                        <div className="grid gap-3">
                            <Label>{t('pages.adminUsers.email')}</Label>
                            <Input
                                name="email"
                                type={'email'}
                                placeholder={'user@example.com'}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label>{t('pages.adminUsers.password')}</Label>
                            <div className={'flex flex-row gap-2'}>
                                <Input
                                    name="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                    required
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
                        <div className={'grid gap-3'}>
                            <Label>{t('pages.adminUsers.verified')}</Label>
                            <Select name={'verified'} defaultValue={'false'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="true">{t('common.true')}</SelectItem>
                                        <SelectItem value="false">{t('common.false')}</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={'grid gap-3'}>
                            <Label>{t('pages.adminUsers.isAdmin')}</Label>
                            <Select name={'is_admin'} defaultValue={'false'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="true">{t('common.true')}</SelectItem>
                                        <SelectItem value="false">{t('common.false')}</SelectItem>
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
                            {t('common.create')}
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Add;
