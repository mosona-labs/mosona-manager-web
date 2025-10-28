import type { UserType } from '@/api/user';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LoaderCircle, Search } from 'lucide-react';
import md5 from 'md5';

import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import ApiUser from '@/api/user';
import { ToastError } from '@/utils/toast';

const FindUser = ({
    children,
    onAdd,
}: {
    children: ReactNode;
    onAdd: (user: UserType) => void;
}) => {
    const [show, setShow] = useState(false);

    const [email, setEmail] = useState('');
    const [searchEmail, setSearchEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const [userResults, setUserResults] = useState<UserType | null>();

    const timeRef = useRef<number>(0);
    useEffect(() => {
        timeRef.current = setTimeout(() => {
            setSearchEmail(email);
        }, 500);
        return () => clearTimeout(timeRef.current);
    }, [email]);
    useEffect(() => {
        setLoading(true);
        ApiUser.find(searchEmail)
            .then((data) => {
                setUserResults(data.data);
            })
            .catch(ToastError)
            .finally(() => {
                setLoading(false);
            });
    }, [searchEmail]);

    return (
        <Dialog open={show} onOpenChange={setShow}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Find User</DialogTitle>
                    <DialogDescription>
                        Search for users to add them to your team by their email.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="flex flex-row gap-2">
                        <Input
                            placeholder="user@example.com"
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                        />
                        <Button variant="outline">
                            {loading ? <LoaderCircle className="animate-spin" /> : <Search />}
                        </Button>
                    </div>
                    <Card className="p-4">
                        {userResults ? (
                            <div className="flex flex-row gap-2 items-center">
                                <Avatar>
                                    <AvatarImage
                                        src={`https://gravatar.webp.se/avatar/${md5(userResults?.email || '')}?d=mm&s=128`}
                                        alt={userResults.username}
                                    />
                                    <AvatarFallback>
                                        {userResults.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium">{userResults.username}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {userResults.email}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        onAdd(userResults);
                                        setShow(false);
                                        setEmail('');
                                        setUserResults(null);
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        ) : (
                            <p className="text-center">No users found with this email.</p>
                        )}
                    </Card>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FindUser;
