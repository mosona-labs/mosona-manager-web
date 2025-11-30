import { Dice5, Plus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
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
                toast.success('Create successful', {
                    description: 'The user has been created successfully.',
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
                    Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New User</DialogTitle>
                    <DialogDescription>
                        Fill in the information below to create a new user.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label>Username</Label>
                            <Input name="username" placeholder={'John Doe'} required />
                        </div>
                        <div className="grid gap-3">
                            <Label>Email</Label>
                            <Input
                                name="email"
                                type={'email'}
                                placeholder={'user@example.com'}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label>Password</Label>
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
                            <Label>Verified</Label>
                            <Select name={'verified'} defaultValue={'false'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="true">True</SelectItem>
                                        <SelectItem value="false">False</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className={'grid gap-3'}>
                            <Label>IsAdmin</Label>
                            <Select name={'is_admin'} defaultValue={'false'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="true">True</SelectItem>
                                        <SelectItem value="false">False</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className={'mt-4'}>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <LoadingButton type="submit" isLoading={isLoading}>
                            Create
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Add;
