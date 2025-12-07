import { LayoutList, LayoutGrid, Grid3x2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/context/useUser';

const LayoutBtn = () => {
    const { config, updateConfig } = useUser();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    onClick={() => {
                        updateConfig({
                            dashboardLayout:
                                config.dashboardLayout === 'grid'
                                    ? 'list'
                                    : config.dashboardLayout === 'list'
                                      ? 'list2'
                                      : 'grid',
                        });
                    }}
                >
                    {config.dashboardLayout === 'grid' ? (
                        <LayoutList />
                    ) : config.dashboardLayout === 'list' ? (
                        <LayoutGrid />
                    ) : (
                        <Grid3x2 />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="me-2">
                <p>
                    {config.dashboardLayout === 'grid'
                        ? 'Switch to List'
                        : config.dashboardLayout === 'list'
                          ? 'Switch to List x2'
                          : 'Switch to Grid'}
                </p>
            </TooltipContent>
        </Tooltip>
    );
};

export default LayoutBtn;
