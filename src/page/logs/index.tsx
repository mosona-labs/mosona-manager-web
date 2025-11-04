import type { LogType } from '@/api/logs';

import { useEffect, useState } from 'react';

import OS from './components/os';
import Browser from './components/browser';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ApiLogs from '@/api/logs';
import GetUAInfo from '@/utils/ua';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Logs = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(100);

    const [logs, setLogs] = useState<Array<LogType>>([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        ApiLogs.list(page, perPage).then((data) => {
            setLogs(data.data.logs);
            setCount(data.data.total);
        });
    }, [page, perPage]);

    const maxPage = Math.ceil(count / perPage);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Logs</h1>
                    <p className="opacity-65">
                        View and manage user & system logs for audit and troubleshooting purposes
                    </p>
                </div>
            </div>
            <div className="flex flex-row gap-3">
                <Select>
                    <SelectTrigger className="w-[180px] border-0">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="authentication">Authentication</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-[180px] border-0">
                        <SelectValue placeholder="All Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Level</SelectItem>
                        <SelectItem className="text-green-500" value="low">
                            Low
                        </SelectItem>
                        <SelectItem className="text-orange-500" value="medium">
                            Medium
                        </SelectItem>
                        <SelectItem className="text-red-500" value="high">
                            High
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Input placeholder="Search user email..." className="border-0 w-64" />
                <Input placeholder="Search message..." className="border-0 w-64" />
            </div>
            <Card className="p-2 border-none mt-3">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Time</TableHead>
                            <TableHead className="w-[220px]">User</TableHead>
                            <TableHead className="w-[140px]">Category</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="w-[180px]">IP Address</TableHead>
                            <TableHead className="w-[200px]">Location</TableHead>
                            <TableHead className="w-[100px]">Device</TableHead>
                            <TableHead className="text-right w-[50px]">Level</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => {
                            const { os, browser } = GetUAInfo(log.user_agent);

                            const levelColor =
                                log.level === 'low'
                                    ? 'text-green-600'
                                    : log.level === 'medium'
                                      ? 'text-yellow-600'
                                      : 'text-red-600';

                            return (
                                <TableRow key={log.time}>
                                    <TableCell className="font-medium">
                                        {new Date(log.time).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {log.email}{' '}
                                        <span className="text-muted-foreground">
                                            ({log.username})
                                        </span>
                                    </TableCell>
                                    <TableCell>{log.category}</TableCell>
                                    <TableCell>{log.message}</TableCell>
                                    <TableCell>{log.ip}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-row gap-1.5 items-center">
                                            <img
                                                src={`/flags/${log.ip_country_code.toLowerCase()}.svg`}
                                                className="h-4"
                                            />{' '}
                                            {log.ip_country}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex flex-row gap-1 items-center">
                                                    <OS os={os} />
                                                    <Browser browser={browser} />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="me-2" side="bottom">
                                                <p>{log.user_agent}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className={cn('text-right', levelColor)}>
                                        {log.level}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
            <div className="mt-3 select-none flex flex-row justify-between items-center">
                <div className="w-[180px]">All {count} logs</div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={page === 1 ? 'opacity-40 pointer-events-none' : ''}
                        >
                            <PaginationPrevious />
                        </PaginationItem>

                        {(() => {
                            const pages: Array<number | 'ellipsis'> = [];
                            const delta = 2;
                            const left = Math.max(1, page - delta);
                            const right = Math.min(maxPage, page + delta);

                            if (left > 1) {
                                pages.push(1);
                                if (left > 2) pages.push('ellipsis');
                            }

                            for (let i = left; i <= right; i++) pages.push(i);

                            if (right < maxPage) {
                                if (right < maxPage - 1) pages.push('ellipsis');
                                pages.push(maxPage);
                            }

                            return pages.map((p, idx) =>
                                p === 'ellipsis' ? (
                                    <PaginationItem key={`e-${idx}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={p}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p);
                                            }}
                                            className={cn(page === p ? 'bg-primary/10' : '')}
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            );
                        })()}

                        <PaginationItem
                            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                            className={page === maxPage ? 'opacity-40 pointer-events-none' : ''}
                        >
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
                <Select
                    value={perPage.toString()}
                    onValueChange={(e) => {
                        setPerPage(parseInt(e));
                    }}
                >
                    <SelectTrigger className="w-[180px] border-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="20">20 Per Page</SelectItem>
                            <SelectItem value="50">50 Per Page</SelectItem>
                            <SelectItem value="100">100 Per Page</SelectItem>
                            <SelectItem value="500">500 Per Page</SelectItem>
                            <SelectItem value="1000">1000 Per Page</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default Logs;
