import { Info } from 'lucide-react';

import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
    EmptyMedia,
} from '@/components/ui/empty';

const NotFound = () => (
    <div className="flex flex-col items-center justify-center h-full pb-18">
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Info />
                </EmptyMedia>
                <EmptyTitle>404 - Not Found</EmptyTitle>
                <EmptyDescription>
                    The page you&apos;re looking for doesn&apos;t exist.
                    <br />
                    Try checking the URL for mistakes.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>
                    Need help?{' '}
                    <a
                        href="https://github.com/mosona-network/mosona-manager/issues"
                        target={'_blank'}
                    >
                        Contact support
                    </a>
                </EmptyDescription>
            </EmptyContent>
        </Empty>
    </div>
);

export default NotFound;
