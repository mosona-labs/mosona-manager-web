import type { Dispatch, SetStateAction } from 'react';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination.tsx';
import { cn } from '@/lib/utils.ts';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';

const BottomPagination = ({
    count,
    page,
    perPage,
    setPerPage,
    setPage,
}: {
    count: number;
    page: number;
    perPage: number;
    setPerPage: Dispatch<SetStateAction<number>>;
    setPage: Dispatch<SetStateAction<number>>;
}) => {
    const maxPage = Math.ceil(count / perPage);

    return (
        <div className="select-none w-full flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-2">
            <div className="w-[180px] hidden sm:block">All {count} records</div>
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
            <div className={'flex flex-row justify-between items-center'}>
                <div className="w-[180px] block sm:hidden">All {count} records</div>
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

export default BottomPagination;
