import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ServerTerminalCard = () => {
    return (
        <Card className="border-border bg-card p-4 transition-all hover:border-primary/50 cursor-pointer flex-row flex items-center gap-3">
            <div className="w-10 p-2 bg-accent rounded-md">
                <img src="/icons/ubuntu.svg" />
            </div>
            <div>
                <h3 className="font-mono text-sm font-semibold text-card-foreground">ServerName</h3>
                <p className="text-xs text-muted-foreground">root</p>
            </div>
            <div className="flex-1" />
            <Button variant="ghost" className="bg-accent">
                <Pencil />
            </Button>
        </Card>
    );
};

export default ServerTerminalCard;
