import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
    EmptyMedia,
} from '@/components/ui/empty';

const NotFound = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full pb-18">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Info />
                    </EmptyMedia>
                    <EmptyTitle>{t('notFound.title')}</EmptyTitle>
                    <EmptyDescription>
                        {t('notFound.line1')}
                        <br />
                        {t('notFound.line2')}
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <EmptyDescription>
                        {t('notFound.help')}{' '}
                        <a
                            href="https://github.com/mosona-labs/mosona-manager/issues"
                            target={'_blank'}
                        >
                            {t('notFound.contact')}
                        </a>
                    </EmptyDescription>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default NotFound;
