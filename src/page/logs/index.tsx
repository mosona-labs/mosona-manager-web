import type { LogType } from '@/api/logs';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

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
import ApiAdminLogs from '@/api/admin/logs.ts';
import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Label } from '@/components/ui/label.tsx';
import LoadingButton from '@/components/loading-button.tsx';

const Logs = ({ isAdmin = false }: { isAdmin?: boolean }) => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    const [logs, setLogs] = useState<Array<LogType>>([]);
    const [count, setCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    const [category, setCategory] = useState('all');
    const [level, setLevel] = useState('all');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const [inputEmail, setInputEmail] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [exportOpen, setExportOpen] = useState(false);
    const [exportLimit, setExportLimit] = useState('100');
    const [isExporting, setIsExporting] = useState(false);

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
        (isAdmin ? ApiAdminLogs : ApiLogs)
            .list(page, perPage, category, level, email, message)
            .then((data) => {
                setLogs(data.data.logs);
                setCount(data.data.total);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    }, [page, perPage, category, level, email, message]);

    const downloadLogs = (exportedLogs: LogType[], total: number, limit: number) => {
        const bundle = {
            exported_at: new Date().toISOString(),
            source: isAdmin ? 'admin' : 'team',
            limit,
            total,
            filters: {
                category,
                level,
                email,
                message,
            },
            logs: exportedLogs,
        };
        const blob = new Blob([JSON.stringify(bundle, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${isAdmin ? 'admin-' : ''}logs-export-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleExportLogs = () => {
        const limit = parseInt(exportLimit, 10);
        if (!Number.isFinite(limit) || limit <= 0) {
            toast.warning('Please enter a valid number of records.');
            return;
        }

        setIsExporting(true);
        (isAdmin ? ApiAdminLogs : ApiLogs)
            .list(1, limit, category, level, email, message)
            .then((data) => {
                downloadLogs(data.data.logs, data.data.total, limit);
                setExportOpen(false);
                toast.success('Logs exported successfully.');
            })
            .catch(ToastError)
            .finally(() => {
                setIsExporting(false);
            });
    };

    useEffect(() => {
        const fadeInTimer = window.setTimeout(() => setMounted(true), 40);

        return () => {
            window.clearTimeout(fadeInTimer);
        };
    }, []);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div style={{ transition: 'opacity 400ms ease', opacity: mounted ? 1 : 0 }}>
                <div
                    className="flex flex-row justify-between items-center mb-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(6px)',
                    }}
                >
                    <div>
                        <h1 className="text-2xl font-bold">Logs</h1>
                        <p className="opacity-65">
                            {isAdmin
                                ? 'View and manage system logs for audit and troubleshooting purposes'
                                : 'View and manage user & system logs for audit and troubleshooting purposes'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setExportOpen(true)}>
                        <Download />
                        Export Logs
                    </Button>
                </div>
                <div
                    className="flex flex-row gap-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '80ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
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
                            {isAdmin
                                ? [
                                      <SelectItem key="user" value="user">
                                          User
                                      </SelectItem>,
                                      <SelectItem key="oauth" value="oauth">
                                          OAuth
                                      </SelectItem>,
                                      <SelectItem key="settings" value="settings">
                                          Settings
                                      </SelectItem>,
                                  ]
                                : [
                                      <SelectItem key="team" value="team">
                                          Team
                                      </SelectItem>,
                                      <SelectItem key="server" value="server">
                                          Server
                                      </SelectItem>,
                                      <SelectItem key="terminal" value="terminal">
                                          Terminal
                                      </SelectItem>,
                                      <SelectItem key="category" value="category">
                                          Category
                                      </SelectItem>,
                                  ]}
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
                <Card
                    className="p-2 border-none mt-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '140ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
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
                                Array.from({ length: Math.min(perPage, 8) }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell colSpan={8} className="py-3">
                                            <div className="h-6 rounded bg-muted-foreground/8 animate-pulse" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log, index) => {
                                    const { os, browser } = GetUAInfo(log.user_agent);

                                    const levelColor =
                                        log.level === 'low'
                                            ? 'text-green-600'
                                            : log.level === 'medium'
                                              ? 'text-yellow-600'
                                              : 'text-red-600';

                                    return (
                                        <TableRow
                                            key={log.time}
                                            style={{
                                                transition:
                                                    'opacity 400ms ease, transform 400ms ease',
                                                transitionDelay: `${160 + index * 35}ms`,
                                                opacity: mounted ? 1 : 0,
                                                transform: mounted ? 'none' : 'translateY(6px)',
                                            }}
                                        >
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
                <div
                    className={'mt-3'}
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '200ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <BottomPagination
                        count={count}
                        page={page}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        setPage={setPage}
                    />
                </div>
            </div>
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Export Logs</DialogTitle>
                        <DialogDescription>
                            Export recent logs as JSON. Current filters will be applied.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <Label htmlFor="logs-export-limit">Recent records</Label>
                        <Input
                            id="logs-export-limit"
                            type="number"
                            min={1}
                            step={1}
                            value={exportLimit}
                            onChange={(e) => setExportLimit(e.target.value)}
                            placeholder="100"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setExportOpen(false)}
                            disabled={isExporting}
                        >
                            Cancel
                        </Button>
                        <LoadingButton isLoading={isExporting} onClick={handleExportLogs}>
                            Export
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Logs;
