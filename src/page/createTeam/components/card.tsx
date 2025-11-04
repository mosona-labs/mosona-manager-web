import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TeamPlanCard = ({
    name,
    price,
    description,
    server,
    member,
    alert,
    isSelected,
    onClick,
}: {
    name: string;
    price: number | string;
    description: string;
    server: number;
    member: number;
    alert: number;
    isSelected: boolean;
    onClick: () => void;
}) => {
    return (
        <Card
            className={cn(
                'p-4 gap-1 cursor-pointer transition-colors',
                isSelected && 'border-black dark:border-white'
            )}
            onClick={onClick}
        >
            <div className="flex flex-row justify-between items-center">
                <p className="font-bold text-lg">{name}</p>
                <Badge>
                    {price == 0 ? 'Free' : typeof price == 'string' ? price : `€${price / 100}`}
                </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <ul className="text-sm text-muted-foreground">
                <li>• {server == -1 ? 'Unlimited' : server} Target servers</li>
                <li>• {member == -1 ? 'Unlimited' : member} Members</li>
                <li>• {alert == -1 ? 'Unlimited' : alert} Alert Items</li>
            </ul>
        </Card>
    );
};

export default TeamPlanCard;
