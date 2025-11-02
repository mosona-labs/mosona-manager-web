import { PanelTopOpen, PanelBottomOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/context/useUser';

const DetailBtn = () => {
    const { config, updateConfig } = useUser();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    onClick={() => {
                        updateConfig({
                            dashboardShowDetails: !config.dashboardShowDetails,
                        });
                    }}
                >
                    {config.dashboardShowDetails ? <PanelBottomOpen /> : <PanelTopOpen />}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="me-2">
                {config.dashboardShowDetails ? <p>Hide Details</p> : <p>Show Details</p>}
            </TooltipContent>
        </Tooltip>
    );
};

export default DetailBtn;
