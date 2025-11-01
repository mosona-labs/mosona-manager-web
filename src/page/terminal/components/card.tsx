import type { TerminalType } from '@/api/terminal';

import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { osIcons } from '@/utils/icon';

const ServerTerminalCard = ({ server }: { server: TerminalType }) => {
    return (
        <Card className="border-border bg-card p-4 transition-all hover:border-primary/50 cursor-pointer flex-row flex items-center gap-3">
            <div className="w-10 p-2 bg-accent rounded-md">
                <img
                    src={`/icons/${osIcons.includes(server.os.toLowerCase()) ? server.os.toLowerCase() : 'linux'}.svg`}
                />
            </div>
            <div>
                <h3 className="font-mono text-sm font-semibold text-card-foreground">
                    {server.name}
                </h3>
                <p className="text-xs text-muted-foreground">{server.username}</p>
            </div>
            <div className="flex-1" />
            <Button variant="ghost" className="bg-accent">
                <Pencil />
            </Button>
        </Card>
    );
};

export default ServerTerminalCard;
