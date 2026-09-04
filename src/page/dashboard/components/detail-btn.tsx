import { PanelTopOpen, PanelBottomOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/context/useUser';

const DetailBtn = ({
    variant = 'outline',
}: {
    variant?:
        | 'link'
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | null
        | undefined;
}) => {
    const { t } = useTranslation();
    const { config, updateConfig } = useUser();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={variant}
                    className={variant == 'ghost' ? 'border-e' : ''}
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
                {config.dashboardShowDetails ? (
                    <p>{t('pages.dashboard.hideDetails')}</p>
                ) : (
                    <p>{t('pages.dashboard.showDetails')}</p>
                )}
            </TooltipContent>
        </Tooltip>
    );
};

export default DetailBtn;
