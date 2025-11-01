import { Grid2X2, Grid3x2, Rows2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const LayoutBtn = ({
    layout,
    setLayout,
}: {
    layout: 'grid-2' | 'grid-3' | 'list';
    setLayout: (layout: 'grid-2' | 'grid-3' | 'list') => void;
}) => (
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
                    <p>Switch to 3-column grid</p>
                    <p>(Only for large screens)</p>
                </>
            ) : layout === 'grid-3' ? (
                <>
                    <p>Switch to list view</p>
                </>
            ) : (
                <>
                    <p>Switch to 2-column grid</p>
                    <p>(Only for large screens)</p>
                </>
            )}
        </TooltipContent>
    </Tooltip>
);

export default LayoutBtn;
