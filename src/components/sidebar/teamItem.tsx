import { Badge } from '../ui/badge';

const TeamItem = ({
    color,
    name,
    role,
    onClick,
    isCurrent = false,
}: {
    color: string;
    name: string;
    role: string;
    onClick?: () => void;
    isCurrent?: boolean;
}) => {
    return (
        <div
            className="flex flex-row w-full justify-center items-center gap-2 cursor-pointer"
            onClick={onClick}
        >
            <div
                className="w-8 h-8 rounded-md"
                style={{
                    backgroundColor: color,
                }}
            />
            <div className="text-start">
                <p>{name}</p>
                <p className="font-normal text-xs opacity-65">{role}</p>
            </div>
            <div className="flex-1" />
            {isCurrent && (
                <Badge variant="secondary" className="text-xs">
                    Current
                </Badge>
            )}
        </div>
    );
};

export default TeamItem;
