import type { LogType } from '@/api/logs';

import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import OS from './components/os';
import Browser from './components/browser';

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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ToastError } from '@/utils/toast.ts';
import BottomPagination from '@/components/bottom-pagination.tsx';

const Logs = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);

    const [logs, setLogs] = useState<Array<LogType>>([]);
    const [count, setCount] = useState(0);

    const [category, setCategory] = useState('all');
    const [level, setLevel] = useState('all');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const [inputEmail, setInputEmail] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setEmail(inputEmail);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [inputEmail]);
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setMessage(inputMessage);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [inputMessage]);

    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        ApiLogs.list(page, perPage, category, level, email, message)
            .then((data) => {
                setLogs(data.data.logs);
                setCount(data.data.total);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    }, [page, perPage, category, level, email, message]);

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
                <Select
                    value={category}
                    onValueChange={(e) => {
                        setCategory(e);
                    }}
                >
                    <SelectTrigger className="w-[180px] border-0">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="server">Server</SelectItem>
                        <SelectItem value="terminal">Terminal</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={level}
                    onValueChange={(e) => {
                        setLevel(e);
                    }}
                >
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
                <Input
                    placeholder="Search user email..."
                    className="border-0 w-64"
                    value={inputEmail}
                    onChange={(e) => {
                        setInputEmail(e.target.value);
                    }}
                />
                <Input
                    placeholder="Search message..."
                    className="border-0 w-64"
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                    }}
                />
            </div>
            <Card className="p-2 border-none mt-3">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Level</TableHead>
                            <TableHead className="min-w-[180px]">Time</TableHead>
                            <TableHead className="min-w-[220px]">User</TableHead>
                            <TableHead className="min-w-[140px]">Category</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="min-w-[100px]">IP Address</TableHead>
                            <TableHead className="min-w-[160px]">Location</TableHead>
                            <TableHead className="text-right min-w-[60px]">Device</TableHead>
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
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => {
                                const { os, browser } = GetUAInfo(log.user_agent);

                                const levelColor =
                                    log.level === 'low'
                                        ? 'text-green-600'
                                        : log.level === 'medium'
                                          ? 'text-yellow-600'
                                          : 'text-red-600';

                                return (
                                    <TableRow key={log.time}>
                                        <TableCell className={cn(levelColor)}>
                                            {log.level}
                                        </TableCell>
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
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p>{log.ip}</p>
                                                </TooltipTrigger>
                                                <TooltipContent className="me-2" side="bottom">
                                                    <p>{log.ip}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-row gap-1.5 items-center">
                                                <img
                                                    src={`/flags/${log.ip_country_code.toLowerCase()}.svg`}
                                                    alt={'flag'}
                                                    className="h-4"
                                                />{' '}
                                                {log.ip_country}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex flex-row gap-1 items-center justify-end">
                                                        <OS os={os} />
                                                        <Browser browser={browser} />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="me-2" side="bottom">
                                                    <p>{log.user_agent}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>
            <div className={'mt-3'}>
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

export default Logs;
