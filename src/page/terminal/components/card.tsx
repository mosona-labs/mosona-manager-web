import type { TerminalType } from '@/api/terminal';

import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOsIconName } from '@/utils/icon';
import { useSession } from '@/context/useSession';

const ServerTerminalCard = ({
    server,
    openEdit,
    mounted,
    index,
}: {
    server: TerminalType;
    openEdit: () => void;
    mounted: boolean;
    index: number;
}) => {
    const navigator = useNavigate();
    const { createSession } = useSession();
    const enterDelay = `${180 + index * 60}ms`;

    return (
        <Card
            className="border-border bg-card p-4 transition-all hover:border-primary/50 cursor-pointer flex-row flex items-center gap-3"
            style={{
                transition: `opacity 400ms ease ${enterDelay}, transform 400ms ease ${enterDelay}, border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(10px)',
            }}
            onClick={() => {
                createSession(
                    {
                        serverId: server.id,
                        name: server.name,
                        os: server.os,
                        terminalConfig: {
                            cols: 80,
                            rows: 24,
                            term: 'xterm-256color',
                        },
                    },
                    (sessionId) => {
                        navigator(`/session/${sessionId}`);
                    }
                );
            }}
        >
            <div className="w-10 shrink-0 p-2 bg-accent rounded-md">
                <img src={`/icons/${getOsIconName(server.os)}.svg`} alt={server.os} />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="truncate font-mono text-sm font-semibold text-card-foreground">
                    {server.name}
                </h3>
                <p className="text-xs text-muted-foreground">{server.username}</p>
            </div>
            <Button
                variant="ghost"
                className="shrink-0 bg-accent"
                onClick={(e) => {
                    e.stopPropagation();
                    openEdit();
                }}
            >
                <Pencil />
            </Button>
        </Card>
    );
};

export default ServerTerminalCard;
