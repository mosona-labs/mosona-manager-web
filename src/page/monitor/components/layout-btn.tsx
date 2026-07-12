import { Grid2X2, Grid3x2, Rows2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const LayoutBtn = ({
    layout,
    setLayout,
}: {
    layout: 'grid-2' | 'grid-3' | 'list';
    setLayout: (layout: 'grid-2' | 'grid-3' | 'list') => void;
}) => {
    const { t } = useTranslation();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={'outline'}
                    className="hidden md:inline"
                    onClick={() =>
                        setLayout(
                            layout === 'grid-2' ? 'grid-3' : layout === 'grid-3' ? 'list' : 'grid-2'
                        )
                    }
                >
                    {layout === 'grid-2' ? (
                        <Grid2X2 size={16} />
                    ) : layout === 'grid-3' ? (
                        <Grid3x2 size={16} />
                    ) : (
                        <Rows2 size={16} />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="me-2">
                {layout === 'grid-2' ? (
                    <>
                        <p>{t('pages.monitor.switchGrid3')}</p>
                        <p>{t('pages.monitor.largeScreensOnly')}</p>
                    </>
                ) : layout === 'grid-3' ? (
                    <>
                        <p>{t('pages.monitor.switchList')}</p>
                    </>
                ) : (
                    <>
                        <p>{t('pages.monitor.switchGrid2')}</p>
                        <p>{t('pages.monitor.largeScreensOnly')}</p>
                    </>
                )}
            </TooltipContent>
        </Tooltip>
    );
};

export default LayoutBtn;
