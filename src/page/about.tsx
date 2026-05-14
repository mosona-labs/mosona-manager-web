import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';

const About = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setMounted(true), 40);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24  font-mono">
            <div className="w-full flex flex-col items-center gap-1">
                <div
                    className="rounded-full p-4"
                    style={{
                        background: 'radial-gradient(circle, #0cf8b922 0%, transparent 70%)',
                        transition: 'opacity 500ms ease, transform 500ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(10px) scale(0.98)',
                    }}
                >
                    <img src="/images/about.webp" alt={'logo'} className="h-72 w-72" />
                </div>
                <h1
                    className="text-3xl font-bold font-mono"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '80ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    Mosona Manager
                </h1>
                <p
                    className="text-muted-foreground text-sm"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '120ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    Server Monitor & Remote Management
                </p>

                <div
                    className="py-4 max-w-2xl"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '160ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <p>
                        Designed as a team-oriented / personal project management server monitor and
                        terminal management tool, featuring comprehensive project permission control
                        and SSH-driven remote management protocol.
                    </p>
                </div>

                <Card
                    className="max-w-2xl border-none mb-4 px-6 py-4 gap-2"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '220ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <h2 className="font-bold space-x-2">Version: v0.0.1</h2>
                    <p className="text-muted-foreground">
                        Automatic updates are currently not supported. Please visit the GitHub
                        repository for the latest releases and update instructions.
                    </p>
                </Card>

                <div
                    className="text-sm flex flex-row items-center gap-2"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '280ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <a
                        className="underline text-green-600"
                        href="https://github.com/mosona-labs/mosona-manager"
                        target="_blank"
                    >
                        Github
                    </a>
                    <div className={'rounded-full w-1 h-1 bg-muted-foreground'} />
                    <a
                        className="underline text-green-600"
                        href="https://manager.mosona.cc"
                        target="_blank"
                    >
                        Documentation
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;
