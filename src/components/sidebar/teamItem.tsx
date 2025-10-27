import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TeamAvatar from '../team-avatar';
import { Badge } from '../ui/badge';

import { cn } from '@/lib/utils';
import ApiUser from '@/api/user';
import { useUser } from '@/context/useUser';

const TeamItem = ({
    id,
    color,
    image,
    name,
    role,
    isCurrent = false,
    onClose,
}: {
    id: number;
    color: string;
    image: string;
    name: string;
    role: string;
    isCurrent?: boolean;
    onClose?: () => void;
}) => {
    const { refresh } = useUser();

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = () => {
        setIsLoading(true);

        ApiUser.setActiveTeam(id)
            .then(() => {
                onClose && onClose();
                refresh().finally(() => {
                    setIsLoading(false);
                    toast.success('Success', { description: 'Switched team successfully.' });
                });
            })
            .catch(() => {
                setIsLoading(false);
                toast.error('Error', { description: 'Failed to switch team.' });
            });
    };

    return (
        <div
            className="flex flex-row w-full justify-center items-center gap-2 cursor-pointer relative"
            onClick={handleChange}
        >
            <TeamAvatar color={color} imageUrl={image} name={name} />
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
            <div
                className={cn(
                    'absolute w-full h-full bg-accent/50 rounded-lg opacity-0 transition-opacity flex items-center justify-center cursor-pointer',
                    isLoading ? 'opacity-100' : ''
                )}
            >
                <LoaderCircle className="animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25" />
            </div>
        </div>
    );
};

export default TeamItem;
