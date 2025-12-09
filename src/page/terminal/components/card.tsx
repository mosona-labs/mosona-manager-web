import type { TerminalType } from '@/api/terminal';

import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { osIcons } from '@/utils/icon';
import { useSession } from '@/context/useSession';

const ServerTerminalCard = ({
    server,
    openEdit,
}: {
    server: TerminalType;
    openEdit: () => void;
}) => {
    const navigator = useNavigate();
    const { createSession } = useSession();

    return (
        <Card
            className="border-border bg-card p-4 transition-all hover:border-primary/50 cursor-pointer flex-row flex items-center gap-3"
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
            <div className="w-10 p-2 bg-accent rounded-md">
                <img
                    src={`/icons/${server.os && osIcons.includes(server.os.toLowerCase()) ? server.os.toLowerCase() : 'linux'}.svg`}
                    alt={server.os}
                />
            </div>
            <div>
                <h3 className="font-mono text-sm font-semibold text-card-foreground">
                    {server.name}
                </h3>
                <p className="text-xs text-muted-foreground">{server.username}</p>
            </div>
            <div className="flex-1" />
            <Button
                variant="ghost"
                className="bg-accent"
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
