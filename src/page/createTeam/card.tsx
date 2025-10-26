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
    server: number | string;
    member: number | string;
    alert: number | string;
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
                <li>• {server} Target servers</li>
                <li>• {member} Members</li>
                <li>• {alert} Alert Items</li>
            </ul>
        </Card>
    );
};

export default TeamPlanCard;
