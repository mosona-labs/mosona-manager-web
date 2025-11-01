import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useParams } from 'react-router-dom';

import { useSession } from '@/context/useSession';

import '@xterm/xterm/css/xterm.css';

const Session = () => {
    const { id } = useParams<{ id: string }>();

    const { session, sendData, switchSession, connectWebSocket, resizeTerminal } = useSession();

    const initLock = useRef<boolean>(false);
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const lastContentLengthRef = useRef<number>(0);

    // Init
    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) return;

        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#000',
                foreground: '#fff',
            },
            allowTransparency: false,
            disableStdin: false,
            cursorStyle: 'block',
            allowProposedApi: false,
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

        xtermRef.current.onData((data) => {
            if (
                initLock.current &&
                (data.match(/^\x1b\[[\d;]*R$/) ||
                    data.match(/^\x1b\[>[\d;]*c$/) ||
                    data.match(/^\x1b\[\?[\d;]*\$?[a-zA-Z]$/) ||
                    data.match(/^\x1b\][\d;]+;[^\x07\x1b]*(\x07|\x1b\\)/) ||
                    data.match(/^\x1b\][\d;]+;rgb:[0-9a-f]{4}\/[0-9a-f]{4}\/[0-9a-f]{4}\\?$/))
            ) {
                return;
            }
            if (id) sendData(id, data);
        });

        // Handle window resize
        const handleResize = () => {
            fitAddon.fit();
            resizeTerminal(terminal.cols, terminal.rows);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            terminal.dispose();
            xtermRef.current = null;
        };
    }, [id]);

    // Create/get session and connect WebSocket
    useEffect(() => {
        if (!id) return;

        if (xtermRef.current) {
            const terminal = xtermRef.current;
            const fitAddon = fitAddonRef.current;

            if (fitAddon) {
                fitAddon.fit();
            }

            setTimeout(() => {
                const currentSession = switchSession(id);
                if (!currentSession) return;
                if (!currentSession?.ws || currentSession.ws.readyState !== WebSocket.OPEN) {
                    connectWebSocket(id, {
                        cols: terminal.cols,
                        rows: terminal.rows,
                        term: 'xterm-256color',
                    });
                } else {
                    initLock.current = true;
                }
            }, 100);
        }
    }, [id]);

    useEffect(() => {
        if (!session || !xtermRef.current) return;

        const terminal = xtermRef.current;

        terminal.clear();
        lastContentLengthRef.current = 0;

        if (session.content) {
            terminal.write(session.content);
            lastContentLengthRef.current = session.content.length;
        }
    }, [session?.id]);

    useEffect(() => {
        if (!session || !xtermRef.current) return;

        const terminal = xtermRef.current;
        const content = session.content;
        const lastLength = lastContentLengthRef.current;

        if (content.length > lastLength) {
            const newContent = content.slice(lastLength);
            terminal.write(newContent);
            lastContentLengthRef.current = content.length;
        }
    }, [session?.content]);

    return (
        <div className="px-6 py-6 pb-24 bg-black w-full h-full">
            <div className="mb-2 text-white text-sm">
                {session && (
                    <div>
                        <span className="font-bold">{session.name}</span>
                        <span className="ml-4 text-gray-400">{session.os}</span>
                        <span
                            className={`ml-4 ${session.isConnected ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {session.isConnected ? '● Connected' : '○ Disconnected'}
                        </span>
                    </div>
                )}
            </div>
            <div ref={terminalRef} className="w-full h-[calc(100%-1rem)]" />
        </div>
    );
};

export default Session;
