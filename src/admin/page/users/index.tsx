import type { UserType } from '@/api/user.ts';

import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card.tsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx';
import ApiAdminUser from '@/api/admin/user.ts';
import { ToastError } from '@/utils/toast.ts';
import BottomPagination from '@/components/bottom-pagination.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import UserItem from '@/admin/page/users/user.tsx';
import Add from '@/admin/page/users/add.tsx';

const Users = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [search, setSearch] = useState('');
    const [verify, setVerify] = useState('all');

    // Search debounce
    const [searchInput, setSearchInput] = useState('');
    const syncSearchText = () => {
        if (searchInput === search) return;
        setSearch(searchInput);
    };
    useEffect(() => {
        const timeout = setTimeout(() => {
            syncSearchText();
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const [users, setUsers] = useState<UserType[]>([]);
    const [count, setCount] = useState(0);

    const refresh = () => {
        setIsLoading(true);
        ApiAdminUser.list(page, perPage, search, verify)
            .then((res) => {
                setUsers(res.data.users);
                setCount(res.data.total);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };
    useEffect(refresh, [page, perPage, search, verify]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="opacity-65">Manage all registered users in the system.</p>
                </div>
            </div>
            <div className={'flex flex-col gap-3'}>
                <div className={'flex flex-row gap-2'}>
                    <Select value={verify} onValueChange={(value) => setVerify(value)}>
                        <SelectTrigger className="w-[180px] border-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={'all'}>All Status</SelectItem>
                                <SelectItem value={'true'}>Verified</SelectItem>
                                <SelectItem value={'false'}>Unverified</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchInput}
                        className={'border-0 max-w-64'}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <div className={'flex-1'} />
                    <Add refresh={refresh} />
                </div>
                <Card className="p-2 border-none">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead className="min-w-[140px]">Username</TableHead>
                                <TableHead className="min-w-[180px]">Email</TableHead>
                                <TableHead className="min-w-[100px]">Verified</TableHead>
                                <TableHead className="min-w-[160px]">Created At</TableHead>
                                <TableHead className="min-w-[160px]">Last Login</TableHead>
                                <TableHead className="text-right min-w-[40px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        <LoaderCircle className={'mx-auto mb-2 animate-spin'} />
                                        Loading
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <UserItem key={user.id} user={user} refresh={refresh} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
                <BottomPagination
                    count={count}
                    page={page}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    setPage={setPage}
                />
            </div>
        </div>
    );
};

export default Users;
