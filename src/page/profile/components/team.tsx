import { useTranslation } from 'react-i18next';

import { type TeamType } from '@/api/team.ts';
import TeamAvatar from '@/components/team-avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import LeaveTeam from '@/components/leave-team.tsx';

const TeamCard = ({ team }: { team: TeamType }) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <TeamAvatar color={team.color} name={team.name} imageUrl={team.image} />
            <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{team.name}</p>
                <p className="text-xs text-muted-foreground">
                    {t('pages.profile.createdOn', {
                        date: new Date(team.created_at).toLocaleDateString(),
                    })}
                </p>
            </div>
            <LeaveTeam team={team}>
                <Button variant="destructive">{t('pages.profile.leave')}</Button>
            </LeaveTeam>
        </div>
    );
};

export default TeamCard;
