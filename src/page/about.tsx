import { Card } from '@/components/ui/card';

const About = () => (
    <div className="w-full p-5 h-full overflow-y-auto pb-24  font-mono">
        <div className="w-full flex flex-col items-center gap-1">
            <div
                className="rounded-full p-4"
                style={{
                    background: 'radial-gradient(circle, #0cf8b922 0%, transparent 70%)',
                }}
            >
                <img src="/images/about.webp" alt={'logo'} className="h-72 w-72" />
            </div>
            <h1 className="text-3xl font-bold font-mono">Mosona Manager</h1>
            <p className="text-muted-foreground text-sm">Server Monitor & Remote Management</p>

            <div className="py-4 max-w-2xl">
                <p>
                    Designed as a team-oriented project management server monitor and terminal
                    management tool, featuring comprehensive project permission control and
                    SSH-driven remote management protocol.
                </p>
            </div>

            <Card className="w-2xl border-none mb-4 px-6 py-4 gap-2">
                <h2 className="font-bold space-x-2">Version: v0.0.1</h2>
                <p className="text-muted-foreground">
                    Automatic updates are currently not supported. Please visit the GitHub
                    repository for the latest releases and update instructions.
                </p>
            </Card>

            <p className="text-muted-foreground text-sm">
                © 2025{' '}
                <a
                    className="underline"
                    href="https://github.com/mosona-network"
                    target="_blank"
                    rel="noreferrer"
                >
                    Mosona Network
                </a>
                . All rights reserved.
            </p>
        </div>
    </div>
);

export default About;
