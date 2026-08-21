import type { LogType } from '@/api/logs';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ToastError } from '@/utils/toast.ts';
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination.tsx';

const millisecondsPerDay = 24 * 60 * 60 * 1000;

const Logs = ({ isAdmin = false }: { isAdmin?: boolean }) => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [cursor, setCursor] = useState('');
    const [cursorHistory, setCursorHistory] = useState<string[]>([]);
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [rangeDays, setRangeDays] = useState('30');
    const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString());

    const [logs, setLogs] = useState<Array<LogType>>([]);
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
    const requestSequence = useRef(0);

    const resetPagination = useCallback(() => {
        setPage(1);
        setCursor('');
        setCursorHistory([]);
        setNextCursor('');
        setHasMore(false);
        setRangeEnd(new Date().toISOString());
    }, []);

    useEffect(() => {
        if (inputEmail === email) return;
        const delayDebounceFn = setTimeout(() => {
            setEmail(inputEmail);
            resetPagination();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [email, inputEmail, resetPagination]);
    useEffect(() => {
        if (inputMessage === message) return;
        const delayDebounceFn = setTimeout(() => {
            if (inputMessage && Number(rangeDays) > 30) setRangeDays('30');
            setMessage(inputMessage);
            resetPagination();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [inputMessage, message, rangeDays, resetPagination]);

    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const requestID = ++requestSequence.current;
        const start = new Date(
            new Date(rangeEnd).getTime() - Number(rangeDays) * millisecondsPerDay
        ).toISOString();
        setIsLoading(true);
        (isAdmin ? ApiAdminLogs : ApiLogs)
            .list({
                cursor,
                pageSize: perPage,
                category,
                level,
                email,
                message,
                start,
                end: rangeEnd,
            })
            .then((data) => {
                if (requestID !== requestSequence.current) return;
                setLogs(data.data.logs);
                setNextCursor(data.data.next_cursor);
                setHasMore(data.data.has_more);
            })
            .catch((error) => {
                if (requestID === requestSequence.current) ToastError(error);
            })
            .finally(() => {
                if (requestID === requestSequence.current) setIsLoading(false);
            });
    }, [category, cursor, email, isAdmin, level, message, perPage, rangeDays, rangeEnd]);

    const downloadLogs = (exportedLogs: LogType[], limit: number) => {
        const bundle = {
            exported_at: new Date().toISOString(),
            source: isAdmin ? 'admin' : 'team',
            requested_limit: limit,
            exported_count: exportedLogs.length,
            filters: {
                category,
                level,
                email,
                message,
                range_days: Number(rangeDays),
                range_end: rangeEnd,
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
        if (!Number.isFinite(limit) || limit <= 0 || limit > 1000) {
            toast.warning(t('pages.logs.invalidCount'));
            return;
        }

        const start = new Date(
            new Date(rangeEnd).getTime() - Number(rangeDays) * millisecondsPerDay
        ).toISOString();
        setIsExporting(true);
        (isAdmin ? ApiAdminLogs : ApiLogs)
            .list({
                pageSize: limit,
                category,
                level,
                email,
                message,
                start,
                end: rangeEnd,
            })
            .then((data) => {
                downloadLogs(data.data.logs, limit);
                setExportOpen(false);
                toast.success(t('pages.logs.exported'));
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
                        <h1 className="text-2xl font-bold">{t('pages.logs.title')}</h1>
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
                    className="flex flex-row flex-wrap gap-3"
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
                            resetPagination();
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-0">
                            <SelectValue placeholder={t('pages.logs.allCategories')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('pages.logs.allCategories')}</SelectItem>
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
                            resetPagination();
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-0">
                            <SelectValue placeholder={t('pages.logs.allLevels')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('pages.logs.allLevels')}</SelectItem>
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
                    <Select
                        value={rangeDays}
                        onValueChange={(value) => {
                            setRangeDays(value);
                            resetPagination();
                        }}
                    >
                        <SelectTrigger className="w-[180px] border-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Last 24 hours</SelectItem>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90" disabled={Boolean(inputMessage)}>
                                Last 90 days
                            </SelectItem>
                            <SelectItem value="365" disabled={Boolean(inputMessage)}>
                                Last 365 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder={t('pages.logs.searchUser')}
                        className="border-0 w-64"
                        value={inputEmail}
                        onChange={(e) => {
                            setInputEmail(e.target.value);
                        }}
                    />
                    <Input
                        placeholder={t('pages.logs.searchMessage')}
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
                                <TableHead className="w-[50px]">{t('pages.logs.level')}</TableHead>
                                <TableHead className="min-w-[180px]">
                                    {t('pages.logs.time')}
                                </TableHead>
                                <TableHead className="min-w-[220px]">
                                    {t('pages.logs.user')}
                                </TableHead>
                                <TableHead className="min-w-[140px]">
                                    {t('pages.logs.category')}
                                </TableHead>
                                <TableHead>{t('pages.logs.message')}</TableHead>
                                <TableHead className="min-w-[100px]">
                                    {t('pages.logs.ip')}
                                </TableHead>
                                <TableHead className="min-w-[160px]">
                                    {t('pages.logs.location')}
                                </TableHead>
                                <TableHead className="text-end min-w-[60px]">
                                    {t('pages.logs.device')}
                                </TableHead>
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
                                            key={`${log.time}-${index}`}
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
                    <div className="select-none w-full flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="w-[180px]">Page {page}</div>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem
                                    className={
                                        page === 1 || isLoading
                                            ? 'opacity-40 pointer-events-none'
                                            : ''
                                    }
                                >
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            const previousCursor =
                                                cursorHistory[cursorHistory.length - 1];
                                            setCursor(previousCursor ?? '');
                                            setCursorHistory((history) => history.slice(0, -1));
                                            setPage((current) => Math.max(1, current - 1));
                                        }}
                                    />
                                </PaginationItem>
                                <PaginationItem
                                    className={
                                        !hasMore || !nextCursor || isLoading
                                            ? 'opacity-40 pointer-events-none'
                                            : ''
                                    }
                                >
                                    <PaginationNext
                                        href="#"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setCursorHistory((history) => [...history, cursor]);
                                            setCursor(nextCursor);
                                            setPage((current) => current + 1);
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                        <Select
                            value={perPage.toString()}
                            onValueChange={(value) => {
                                setPerPage(parseInt(value, 10));
                                resetPagination();
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
            </div>
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('pages.logs.export')}</DialogTitle>
                        <DialogDescription>
                            Export recent logs as JSON. Current filters will be applied.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <Label htmlFor="logs-export-limit">{t('pages.logs.recent')}</Label>
                        <Input
                            id="logs-export-limit"
                            type="number"
                            min={1}
                            max={1000}
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
