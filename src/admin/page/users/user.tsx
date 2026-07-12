import type { UserType } from '@/api/user.ts';

import { EditIcon, MoreHorizontal, Trash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TableCell, TableRow } from '@/components/ui/table.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import Edit from '@/admin/page/users/edit.tsx';
import Del from '@/admin/page/users/del.tsx';

const UserItem = ({ user, refresh }: { user: UserType; refresh: () => void }) => {
    const { t } = useTranslation();
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    return (
        <>
            <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <Badge variant={user.verified ? 'default' : 'outline'}>
                        {user.verified
                            ? t('pages.adminUsers.verified')
                            : t('pages.adminUsers.unverified')}
                    </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                <TableCell>{user.login_at && new Date(user.login_at).toLocaleString()}</TableCell>
                <TableCell className={'p-0 text-end'}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={'ghost'}
                                className={'rounded-none'}
                                style={{
                                    boxShadow: 'none',
                                }}
                            >
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-46 me-5" align="start">
                            <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                                <EditIcon className={'text-foreground'} />
                                {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant={'destructive'}
                                onClick={() => setOpenDelete(true)}
                            >
                                <Trash />
                                {t('common.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
            {/*Edit Dialog*/}
            <Edit user={user} refresh={refresh} open={openEdit} setOpen={setOpenEdit} />
            {/*Delete Dialog*/}
            <Del user={user} refresh={refresh} open={openDelete} setOpen={setOpenDelete} />
        </>
    );
};

export default UserItem;
