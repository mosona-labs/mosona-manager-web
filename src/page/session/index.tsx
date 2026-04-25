import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { RefreshCw } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useSession } from '@/context/useSession';

import '@xterm/xterm/css/xterm.css';

const Session = () => {
    const { id } = useParams<{ id: string }>();

    const {
        session,
        sendData,
        switchSession,
        connectWebSocket,
        reconnectWebSocket,
        resizeTerminal,
    } = useSession();

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
            scrollback: 5000,
            fastScrollModifier: 'alt',
            macOptionIsMeta: true,
            theme: {
                background: '#000',
                foreground: '#fff',
                cursor: '#fff',
                selectionBackground: '#334155',
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
        terminal.focus();

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
            if (!terminalRef.current) return;
            fitAddon.fit();
            resizeTerminal(terminal.cols, terminal.rows);
        };
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(handleResize);
        });

        resizeObserver.observe(terminalRef.current);
        window.addEventListener('resize', handleResize);

        return () => {
            resizeObserver.disconnect();
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

                initLock.current = false;

                if (
                    !currentSession?.ws ||
                    (currentSession.ws.readyState !== WebSocket.OPEN &&
                        currentSession.ws.readyState !== WebSocket.CONNECTING)
                ) {
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
        initLock.current = !!session?.isConnected;
    }, [session?.isConnected]);

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

    const statusClassName =
        session?.connectionStatus === 'connected'
            ? 'text-green-400'
            : session?.connectionStatus === 'connecting' ||
                session?.connectionStatus === 'reconnecting'
              ? 'text-amber-300'
              : 'text-red-400';
    const statusLabel =
        session?.connectionStatus === 'connected'
            ? 'Connected'
            : session?.connectionStatus === 'connecting'
              ? 'Connecting'
              : session?.connectionStatus === 'reconnecting'
                ? `Reconnecting${session.reconnectAttempt ? ` #${session.reconnectAttempt}` : ''}`
                : 'Disconnected';

    return (
        <div className="px-6 py-6 pb-24 bg-black w-full h-full">
            <div className="mb-2 min-h-8 text-white text-sm flex items-center gap-3">
                {session && (
                    <>
                        <div className="min-w-0 flex items-center gap-3">
                            <span className="font-bold truncate">{session.name}</span>
                            <span className="text-gray-400 shrink-0">{session.os}</span>
                        </div>
                        <span className={`${statusClassName} shrink-0`}>
                            {session.isConnected ? '●' : '○'} {statusLabel}
                        </span>
                        {!session.isConnected && id && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-white hover:bg-white/10 hover:text-white"
                                onClick={() => reconnectWebSocket(id)}
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Reconnect
                            </Button>
                        )}
                    </>
                )}
            </div>
            <div ref={terminalRef} className="w-full h-[calc(100%-1rem)]" />
        </div>
    );
};

export default Session;
